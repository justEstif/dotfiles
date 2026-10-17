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

interface XConfig {
  authToken?: string;
  ct0?: string;
  bearer?: string;
  searchQueryId?: string;
}

function loadXConfig(): XConfig {
  try {
    const auth = JSON.parse(readFileSync(join(homedir(), ".pi/agent/auth.json"), "utf-8"));
    return auth.x ?? {};
  } catch {
    return {};
  }
}

// --- Social (X/Twitter) ---

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

interface SocialPost {
  author: string;
  url: string;
  text: string;
  createdAtMs?: number;
  favorites?: number;
}

// x.com serves full server-rendered HTML to a browser UA (no login).
// Posts live in an escaped JSON payload inside <script> stream chunks.
function parseProfilePosts(html: string, handle: string): SocialPost[] {
  const posts: SocialPost[] = [];
  const marker = '\\"full_text\\":\\"';
  const term = '\\",\\"hashtag_entities';
  let idx = html.indexOf(marker);
  while (idx !== -1) {
    const valStart = idx + marker.length;
    const end = html.indexOf(term, valStart);
    if (end === -1) break;
    const raw = html.slice(valStart, end);
    // payload is double-encoded JSON; two decode passes handle \\n, \\\", \\\\
    const dec = (s: string) => s.replace(/\\(.)/g, (_m, c) => (c === "n" ? "\n" : c === "t" ? "\t" : c));
    const text = dec(dec(raw));
    const before = html.slice(Math.max(0, idx - 300), idx);
    const ts = /created_at_ms\\":(\d+)/.exec(before);
    // engagement counts sit before long posts and after short ones
    const nearby = html.slice(Math.max(0, idx - 3000), end + 4000);
    const fav = /favorite_count\\":(\d+)/.exec(nearby);
    posts.push({
      author: handle,
      url: `https://x.com/${handle}`,
      text,
      createdAtMs: ts ? Number(ts[1]) : undefined,
      favorites: fav ? Number(fav[1]) : undefined,
    });
    idx = html.indexOf(marker, end);
  }
  return posts;
}

async function fetchProfilePosts(handle: string): Promise<SocialPost[]> {
  const res = await fetch(`https://x.com/${handle}`, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if (!res.ok) throw new Error(`x.com/${handle} returned ${res.status}`);
  const html = await res.text();
  return parseProfilePosts(html, handle);
}

// api.fxtwitter.com is a free public mirror: full post JSON with metrics, no login.
async function socialPost(url: string, opts: { json?: boolean }): Promise<void> {
  const m = /(?:x|twitter)\.com\/([^/]+)\/status\/(\d+)/.exec(url);
  if (!m) throw new Error("Expected an x.com/twitter.com status URL");
  const api = `https://api.fxtwitter.com/${m[1]}/status/${m[2]}`;
  const res = await fetch(api, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`fxtwitter returned ${res.status}`);
  const body = (await res.json()) as { code: number; tweet?: Record<string, unknown> };
  if (body.code !== 200 || !body.tweet) throw new Error("fxtwitter: post not found");
  const t = body.tweet as Record<string, any>;
  if (opts.json) {
    console.log(JSON.stringify(t, null, 2));
    return;
  }
  const author = `${t.author?.name ?? ""} (@${t.author?.screen_name ?? m[1]})`;
  const stats = `❤ ${t.likes ?? "?"} · 🔁 ${t.reposts ?? "?"} · 💬 ${t.replies ?? "?"} · ${t.created_at ?? ""}`;
  const quote = t.quoted_tweet ? `\n> Quoting @${t.quoted_tweet.author?.screen_name}: ${String(t.quoted_tweet.text ?? "").slice(0, 200)}\n` : "";
  console.log(`# ${author}\n\n${t.text ?? ""}${quote}\n**${stats}**\n**URL:** https://x.com/${m[1]}/status/${m[2]}`);
}

const DEFAULT_WATCHLIST = [
  "karpathy", "sama", "gdb", "swyx", "simonw", "AndrewYNg", "ylecun",
  "DrJimFan", "soumith", "dan_abramov", "sebastianruder", "fchollet", "hardmaru",
  "rasbt", "hardmaru",
];

function watchlist(): string[] {
  try {
    const file = readFileSync(join(homedir(), ".config/web/social-watchlist.txt"), "utf-8");
    const list = file
      .split("\n")
      .map((l) => l.trim().replace(/^@/, ""))
      .filter((l) => l && !l.startsWith("#"));
    if (list.length) return list;
  } catch {
    // no user watchlist -> default
  }
  return [...new Set(DEFAULT_WATCHLIST)];
}

async function socialNews(opts: { limit: number; hours?: number; json?: boolean }): Promise<void> {
  const accounts = watchlist();
  const cutoff = opts.hours ? Date.now() - opts.hours * 3600_000 : 0;
  const settled = await Promise.allSettled(accounts.map((a) => fetchProfilePosts(a)));
  const posts: SocialPost[] = [];
  const failed: string[] = [];
  settled.forEach((s, i) => {
    if (s.status === "fulfilled") posts.push(...s.value);
    else failed.push(accounts[i]);
  });
  const ranked = posts
    .filter((p) => (p.createdAtMs ?? Infinity) >= cutoff && p.text.trim().length > 0)
    .sort((a, b) => (b.favorites ?? 0) - (a.favorites ?? 0))
    .slice(0, opts.limit);
  if (opts.json) {
    console.log(JSON.stringify({ posts: ranked, failed }, null, 2));
    return;
  }
  for (const p of ranked) {
    const when = p.createdAtMs ? new Date(p.createdAtMs).toISOString().slice(0, 16).replace("T", " ") : "?";
    console.log(`## @${p.author} · ${when} · ❤ ${p.favorites ?? "?"}\n**URL:** ${p.url}\n${p.text}\n`);
  }
  if (!ranked.length) console.log(`No posts found${opts.hours ? ` in the last ${opts.hours}h` : ""}.`);
}

async function socialSearch(
  query: string,
  opts: { limit: number; json?: boolean },
): Promise<void> {
  const cfg = loadXConfig();
  if (!cfg.authToken || !cfg.ct0) {
    throw new Error(
      'X search needs cookies. Add to ~/.pi/agent/auth.json: "x": {"authToken": "...", "ct0": "...", "bearer": "...", "searchQueryId": "..."}. ' +
        "authToken and ct0 come from your logged-in x.com cookies; bearer and searchQueryId from devtools Network (any x.com/i/api/graphql/ request: token after 'Bearer ', id in the URL path). " +
        'No cookies? Fallback: web search "site:x.com ' + query + '"',
    );
  }
  const qid = cfg.searchQueryId ?? "nKQ8KlOzgBoLCiQENdWKBg";
  const variables = JSON.stringify({ rawQuery: query, count: opts.limit, querySource: "typed_query" });
  const features = JSON.stringify({
    rweb_tipjar_consumption_enabled: true, responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false, creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_timeline_navigation_enabled: true, responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    communities_web_enable_tweet_community_results_fetch: true, c9s_tweet_anatomy_moderator_badge_enabled: true,
    articles_rweb_enabled: true, responsive_web_enhance_cards_enabled: false,
  });
  const url = new URL(`https://x.com/i/api/graphql/${qid}/SearchTimeline`);
  url.searchParams.set("variables", variables);
  url.searchParams.set("features", features);
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${cfg.bearer ?? ""}`,
      Cookie: `auth_token=${cfg.authToken}; ct0=${cfg.ct0}`,
      "x-csrf-token": cfg.ct0,
      "x-twitter-active-user": "yes",
      "x-twitter-auth-type": "OAuth2Session",
      "User-Agent": UA,
      Accept: "application/json",
    },
  });
  if (res.status === 400 || res.status === 404) {
    throw new Error(`X API ${res.status}: likely a stale searchQueryId. Re-copy it from devtools into auth.json "x". `);
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error("X API rejected the cookies (expired or account flagged). Re-export auth_token/ct0.");
  }
  if (!res.ok) throw new Error(`X API returned ${res.status}`);
  const body = await res.json();
  const out: SocialPost[] = [];
  const walk = (node: any) => {
    if (!node || typeof node !== "object") return;
    const result = node.result?.legacy ?? node.result;
    if (result?.full_text && result?.user?.screen_name) {
      out.push({
        author: result.user.screen_name,
        url: `https://x.com/${result.user.screen_name}/status/${result.id_str}`,
        text: result.full_text,
        createdAtMs: result.created_at ? Date.parse(result.created_at) : undefined,
        favorites: result.favorite_count,
      });
    }
    for (const v of Object.values(node)) walk(v);
  };
  walk(body);
  const results = out.slice(0, opts.limit);
  if (opts.json) {
    console.log(JSON.stringify({ results }, null, 2));
    return;
  }
  if (!results.length) {
    console.log("No results.");
    return;
  }
  console.log(
    results
      .map((p, i) => {
        const when = p.createdAtMs ? new Date(p.createdAtMs).toISOString().slice(0, 16).replace("T", " ") : "?";
        return `## ${i + 1}. @${p.author} · ${when} · ❤ ${p.favorites ?? "?"}\n**URL:** ${p.url}\n${p.text}`;
      })
      .join("\n\n---\n\n"),
  );
}

async function socialUser(handle: string, opts: { limit: number; json?: boolean }): Promise<void> {
  const h = handle.replace(/^@/, "");
  const posts = (await fetchProfilePosts(h)).slice(0, opts.limit);
  if (opts.json) {
    console.log(JSON.stringify({ posts }, null, 2));
    return;
  }
  if (!posts.length) {
    console.log(`No posts parsed for @${h}.`);
    return;
  }
  console.log(
    posts
      .map((p, i) => {
        const when = p.createdAtMs ? new Date(p.createdAtMs).toISOString().slice(0, 16).replace("T", " ") : "?";
        return `## ${i + 1}. @${h} · ${when} · ❤ ${p.favorites ?? "?"}\n**URL:** ${p.url}\n${p.text}`;
      })
      .join("\n\n---\n\n"),
  );
}

// --- CLI ---

const USAGE = `web — self-hosted SearXNG CLI (web search + web fetch + X social)

Usage:
  web search <query> [options]
  web extract <url> [options]
  web social <subcommand> [args]

Social subcommands (X/Twitter):
  web social post <status-url>            Full post with metrics (via fxtwitter, no login)
  web social user <handle>                Recent posts (x.com HTML, no login)
  web social news [--limit n] [--hours h] Ranked posts from watchlist (~/.config/web/social-watchlist.txt)
  web social search <query>               Real X search (needs cookies, see auth.json "x")
  shared: --limit <n> (default 10) --json

Options:
  search: --category <cat>   Category: general, images, videos, news, it, science, files, social media
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
  } else if (cmd === "social") {
    const sub = positional[0];
    const subArgs = rest.slice(rest.indexOf(sub) + 1);
    const subFlag = (name: string): string | undefined => {
      const i = subArgs.indexOf(name);
      return i >= 0 ? subArgs[i + 1] : undefined;
    };
    const subHas = (name: string): boolean => subArgs.includes(name);
    const subPositional: string[] = [];
    for (let i = 0; i < subArgs.length; i++) {
      const a = subArgs[i];
      if (a.startsWith("-")) {
        if (i + 1 < subArgs.length && !subArgs[i + 1].startsWith("-")) i++;
        continue;
      }
      subPositional.push(a);
    }
    if (sub === "post") {
      const url = subPositional[1] ?? subPositional[0];
      if (!url) {
        console.error("Error: status url required");
        process.exit(1);
      }
      await socialPost(url, { json: subHas("--json") });
    } else if (sub === "user") {
      const handle = subPositional[1] ?? subPositional[0];
      if (!handle) {
        console.error("Error: handle required");
        process.exit(1);
      }
      await socialUser(handle, { limit: Number(subFlag("--limit") ?? 10), json: subHas("--json") });
    } else if (sub === "news") {
      await socialNews({
        limit: Number(subFlag("--limit") ?? 10),
        hours: subFlag("--hours") ? Number(subFlag("--hours")) : undefined,
        json: subHas("--json"),
      });
    } else if (sub === "search") {
      const query = subPositional.slice(1).join(" ") || subArgs.filter((a) => !a.startsWith("-") && a !== "search").join(" ");
      if (!query) {
        console.error('Error: query required (quote multi-word queries)');
        process.exit(1);
      }
      await socialSearch(query, { limit: Number(subFlag("--limit") ?? 10), json: subHas("--json") });
    } else {
      console.error(`Unknown social subcommand: ${sub ?? "(none)"}\n`);
      console.error(USAGE);
      process.exit(1);
    }
  } else {
    console.error(`Unknown command: ${cmd}\n`);
    console.error(USAGE);
    process.exit(1);
  }
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
