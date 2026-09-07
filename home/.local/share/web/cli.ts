#!/usr/bin/env bun
// web — self-hosted SearXNG CLI: search the web and fetch pages as markdown.
// Config: ~/.pi/agent/auth.json -> { "searxng": { baseUrl, user?, pass?, engines? } }
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

// --- Config ---

interface SearxConfig {
  baseUrl: string;
  user?: string;
  pass?: string;
  engines?: string[];
}

function loadConfig(): SearxConfig {
  try {
    const auth = JSON.parse(
      readFileSync(join(homedir(), ".pi/agent/auth.json"), "utf-8"),
    );
    const entry = auth.searxng;
    if (entry?.baseUrl) {
      return {
        baseUrl: entry.baseUrl,
        user: entry.user,
        pass: entry.pass,
        engines: Array.isArray(entry.engines)
          ? entry.engines.filter((e: unknown): e is string => typeof e === "string" && e.length > 0)
          : undefined,
      };
    }
  } catch {
    // fallthrough
  }
  console.error(
    'No searxng config found in ~/.pi/agent/auth.json. Add a "searxng" entry with baseUrl (and optional user/pass/engines).',
  );
  process.exit(1);
}

function authHeader(cfg: SearxConfig): Record<string, string> {
  if (cfg.user && cfg.pass) {
    const encoded = Buffer.from(`${cfg.user}:${cfg.pass}`).toString("base64");
    return { Authorization: `Basic ${encoded}` };
  }
  return {};
}

// --- Search ---

async function search(
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

// --- Extract ---

async function extract(url: string, opts: { maxLines?: number; raw?: boolean }): Promise<void> {
  const res = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml,text/plain,*/*;q=0.1",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });
  if (!res.ok) throw new Error(`Fetch returned ${res.status} ${res.statusText}`);

  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text();

  let title = url;
  let markdown = text;

  if (!opts.raw && (contentType.includes("text/html") || contentType.includes("application/xhtml"))) {
    const { parseHTML } = await import("linkedom");
    const { Defuddle } = await import("defuddle/node");
    const { document } = parseHTML(text);
    const result = await Defuddle(document, url, { markdown: true });
    markdown = result.contentMarkdown ?? result.content;
    title = result.title || url;
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

// --- CLI ---

const USAGE = `web — self-hosted SearXNG CLI (web search + web fetch)

Usage:
  web search <query> [options]
  web extract <url> [options]

Options:
  search: --category <cat>   Category: general, images, videos, news, it, science, files, social media
          --limit <n>        Number of results (default 10, max 20)
          --json             Output raw JSON
  extract: --max-lines <n>   Truncate output after n lines
           --raw             Skip Defuddle extraction, return raw response body
  -h, --help                 Show this help`;

const args = process.argv.slice(2);
const cmd = args[0];
// positional values: non-flag args after the subcommand (first flag ends them)
const rest = args.slice(1);
const firstFlag = rest.findIndex((a) => a.startsWith("-"));
const positional = firstFlag === -1 ? rest : rest.slice(0, firstFlag);
const flag = (name: string): string | undefined => {
  const i = rest.indexOf(name);
  return i >= 0 ? rest[i + 1] : undefined;
};
const has = (name: string): boolean => rest.includes(name);

try {
  if (!cmd || has("-h") || has("--help") || cmd === "help" || cmd === "-h" || cmd === "--help") {
    console.log(USAGE);
    process.exit(cmd ? 0 : 1);
  }
  if (cmd === "search") {
    const query = positional.join(" ");
    if (!query) {
      console.error("Error: query required (quote multi-word queries)");
      process.exit(1);
    }
    await search(query, {
      category: flag("--category"),
      limit: Number(flag("--limit") ?? 10),
      json: has("--json"),
    });
  } else if (cmd === "extract") {
    const url = positional[0];
    if (!url) {
      console.error("Error: url required");
      process.exit(1);
    }
    await extract(url, {
      maxLines: flag("--max-lines") ? Number(flag("--max-lines")) : undefined,
      raw: has("--raw"),
    });
  } else {
    console.error(`Unknown command: ${cmd}\n`);
    console.error(USAGE);
    process.exit(1);
  }
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
