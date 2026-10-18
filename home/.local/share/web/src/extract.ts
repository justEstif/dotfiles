import { policyFor, type SitePolicy } from "./sites.js";

function uaForUrl(u: string, policy: SitePolicy | undefined): string {
  const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";
  if (policy?.chromeUa || (policy && u.includes("reddit"))) {
    return UA + " (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
  }
  return UA;
}

const GENERIC_BLOCK_MARKERS = ["Prove your humanity"];

export async function extract(
  url: string,
  opts: { maxLines?: number; raw?: boolean },
): Promise<void> {
  const hostname = new URL(url).hostname;
  const policy = policyFor(hostname);
  const tryFetch = async (u: string): Promise<Response> =>
    fetch(u, {
      redirect: "follow",
      headers: {
        Accept: "text/html,application/xhtml+xml,text/plain,*/*;q=0.1",
        "User-Agent": uaForUrl(u, policy),
      },
    });

  // Mirror/proxy chain for sites that block plain fetches or serve a JS challenge
  let url_ = url;
  let res = await tryFetch(url_);
  let firstBody = res.ok ? await res.text() : "";
  const blockMarkers = [...GENERIC_BLOCK_MARKERS, ...(policy?.blockMarkers ?? [])];
  const looksBlocked =
    !res.ok ||
    !!policy?.blockedMessage ||
    firstBody.includes("Prove your humanity") ||
    (firstBody.includes("solution") && firstBody.length < 12_000 && !firstBody.includes("<article"));
  if (looksBlocked) {
    const mirrors = [
      ...(policy?.mirrors?.(new URL(url)) ?? []),
      `https://r.jina.ai/${url}`,
    ];
    for (const alt of mirrors) {
      try {
        const r2 = await fetch(alt, {
          redirect: "follow",
          headers: { "User-Agent": uaForUrl(alt, policy), Accept: "text/html,application/json,*/*" },
        });
        const body = r2.ok ? await r2.text() : "";
        if (r2.ok && !body.includes("Prove your humanity")) {
          res = new Response(body, { status: r2.status, headers: r2.headers });
          url_ = alt;
          break;
        }
      } catch {
        // next mirror
      }
    }
  }
  const stillBlocked =
    !res.ok ||
    (firstBody && url_ === url && blockMarkers.some((m) => firstBody.includes(m)));
  if (stillBlocked && policy?.blockedMessage) {
    throw new Error(policy.blockedMessage);
  }
  if (!res.ok) {
    throw new Error(`Fetch returned ${res.status} ${res.statusText} (mirrors exhausted)`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  const text = url_ === url && firstBody ? firstBody : await res.text();

  let title = url;
  let markdown = text;

  if (!opts.raw && (contentType.includes("text/html") || contentType.includes("application/xhtml"))) {
    const { parseHTML } = await import("linkedom");
    const { Defuddle } = await import("defuddle/node");
    const { document } = parseHTML(text);
    try {
      const result = await Defuddle(document, url_, { markdown: true });
      markdown = result.contentMarkdown ?? result.content;
      title = result.title || url;
    } catch {
      // Defuddle re-fetches for some extractors; fall back to page text
      const { document: d2 } = parseHTML(text);
      title = d2.querySelector("title")?.textContent?.trim() || url;
      markdown = d2.body ? (d2.body.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim() : text.slice(0, 50_000);
    }
  } else if (contentType.includes("text/plain")) {
    markdown = text;
  } else if (!opts.raw) {
    markdown = text.slice(0, 50_000);
  }

  if (opts.maxLines && markdown.split("\n").length > opts.maxLines) {
    const lines = markdown.split("\n");
    markdown = lines.slice(0, opts.maxLines).join("\n") +
      `\n\n[Content truncated: ${opts.maxLines} of ${lines.length} lines shown]`;
  }

  console.log(`# ${title}\n\n${markdown}`);
}
