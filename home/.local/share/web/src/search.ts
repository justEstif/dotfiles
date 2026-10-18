import { loadConfig, authHeader } from "./config.js";

export async function search(
  query: string,
  opts: { category?: string; limit: number; json?: boolean },
): Promise<void> {
  const cfg = loadConfig();
  const url = new URL("/search", cfg.baseUrl);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  if (opts.category) url.searchParams.set("categories", opts.category);
  if (cfg.engines?.length) url.searchParams.set("engines", cfg.engines.join(","));

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json", ...authHeader(cfg) },
  });
  if (!res.ok) throw new Error(`SearXNG returned ${res.status} ${res.statusText}`);

  const body = (await res.json()) as {
    results?: Array<{ title?: string | null; url?: string | null; content?: string | null; engine?: string | null }>;
    unresponsive_engines?: Array<[string, string]>;
  };

  const results = (body.results ?? [])
    .filter((r) => r.url)
    .slice(0, opts.limit)
    .map((r) => ({
      title: r.title ?? "Untitled",
      url: r.url!,
      content: r.content ?? "",
      engine: r.engine ?? "unknown",
    }));

  if (results.length === 0 && body.unresponsive_engines?.length) {
    const failures = body.unresponsive_engines.map(([e, r]) => `${e}: ${r}`).join("; ");
    throw new Error(`SearXNG engines failed: ${failures}`);
  }

  if (opts.json) {
    console.log(JSON.stringify({ results, unresponsiveEngines: body.unresponsive_engines ?? [] }, null, 2));
    return;
  }

  if (results.length === 0) {
    console.log("No results found.");
    return;
  }
  console.log(
    results
      .map((r, i) => `## ${i + 1}. ${r.title}\n**URL:** ${r.url}\n${r.content || "(no snippet)"}`)
      .join("\n\n---\n\n"),
  );
}
