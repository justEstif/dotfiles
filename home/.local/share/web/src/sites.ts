// Per-site mirror and fetch behavior, keyed by hostname suffix.
// Generic extraction consults this; extract.ts itself stays site-agnostic.

export interface SitePolicy {
  // Hostnames this policy applies to (exact match or suffix like ".reddit.com").
  hostnames: string[];
  // A browser-like UA matters for this site.
  chromeUa?: boolean;
  // Mirror URLs to try before the generic r.jina.ai fallback. Empty string = skip.
  mirrors?: (u: URL) => string[];
  // Fetching directly is hopeless; show this instead of retry noise.
  blockedMessage?: string;
  // Body snippets that indicate a block/challenge page for this site.
  blockMarkers?: string[];
}

export const SITE_POLICIES: SitePolicy[] = [
  {
    hostnames: ["x.com", "twitter.com"],
    mirrors: (u) => [
      `https://api.fxtwitter.com${u.pathname.replace(/\\.(json)$/, "")}`,
      `https://fixupx.com${u.pathname}`,
    ],
  },
  {
    hostnames: ["reddit.com", ".reddit.com"],
    chromeUa: true,
    blockMarkers: ["Prove your humanity", "<title>Reddit</title>"],
    blockedMessage:
      "Reddit blocks server fetches entirely now (challenge wall, 403 JSON). Use `web social` for X, or fetch Reddit in the agent-browser skill.",
  },
];

export function policyFor(hostname: string): SitePolicy | undefined {
  return SITE_POLICIES.find((p) =>
    p.hostnames.some((h) => h.startsWith(".") ? hostname.endsWith(h) : hostname === h),
  );
}
