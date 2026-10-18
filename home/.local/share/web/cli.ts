#!/usr/bin/env bun
// web — self-hosted SearXNG CLI: search the web and fetch pages as markdown.
// Modules live in src/: config, search, extract, social/.
import { search } from "./src/search.js";
import { extract } from "./src/extract.js";
import { socialPost, socialNews, socialSearch, socialUser } from "./src/social/commands.js";
import { follow } from "./src/social/profile.js";

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
  web social follow <handle> [<handle>]   Add handles to the news watchlist
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
    } else if (sub === "follow") {
      await follow(subPositional);
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
