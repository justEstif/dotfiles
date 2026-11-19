// SSRF guard for `web extract`: refuse to fetch loopback, private, link-local,
// and cloud-metadata targets — including every redirect hop. Same model as
// Firecrawl Local's guard: content fetched by this CLI feeds AI agents, so a
// page must not be able to steer an agent into probing internal networks.
// Known limit (shared with pragmatic guards): DNS is resolved here for the
// check and again by fetch at connect time; a rebinding attacker who controls
// DNS can race the two lookups.
import { lookup } from "node:dns/promises";
import { isIP, isIPv4 } from "node:net";

export class GuardError extends Error {}

const isPrivateV4 = (ip: string): boolean => {
  const o = ip.split(".").map(Number);
  if (o.length !== 4 || o.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = o;
  return (
    a === 0 || // "this network"
    a === 10 || // private
    a === 127 || // loopback
    (a === 100 && b >= 64 && b <= 127) || // CGNAT 100.64/10
    (a === 169 && b === 254) || // link-local (incl. cloud metadata 169.254.169.254)
    (a === 172 && b >= 16 && b <= 31) || // private
    (a === 192 && b === 168) || // private
    (a === 192 && (b === 0 || b === 2)) || // 192.0.0.0/24, TEST-NET-1
    (a === 198 && (b === 18 || b === 19)) || // benchmark 198.18.0.0/15
    a >= 224 // multicast, reserved, broadcast
  );
};

const isPrivateV6 = (ip: string): boolean => {
  const l = ip.toLowerCase();
  const mapped = l.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) return isPrivateV4(mapped[1]);
  return (
    l === "::" || // unspecified
    l === "::1" || // loopback
    /^(fe[89ab]|f[cd]|ff)/.test(l) // link-local fe80::/10, unique-local fc00::/7, multicast
  );
};

export const isPrivateAddress = (ip: string): boolean =>
  isIP(ip) === 0 ? true : isIPv4(ip) ? isPrivateV4(ip) : isPrivateV6(ip);

/** Throws GuardError unless `raw` is an http(s) URL resolving only to public addresses. */
export async function assertPublicUrl(raw: string, what = "URL"): Promise<void> {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new GuardError(`Not a valid URL: ${raw}`);
  }
  if (u.protocol !== "http:" && u.protocol !== "https:")
    throw new GuardError(`Refused ${u.protocol}// target — only http and https are fetched`);
  const host = u.hostname.replace(/^\[|\]$/g, "");
  let ips: string[];
  if (isIP(host)) {
    ips = [host];
  } else {
    try {
      ips = (await lookup(host, { all: true })).map((r) => r.address);
    } catch {
      throw new GuardError(`DNS resolution failed for ${host}`);
    }
  }
  const bad = ips.filter(isPrivateAddress);
  if (bad.length > 0)
    throw new GuardError(
      `Refused to fetch ${what} ${raw} — resolves to private/reserved address ${bad.join(", ")}. ` +
        `Re-run with --allow-private (or WEB_ALLOW_PRIVATE=1) if this is intended.`,
    );
}
