import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

export interface SocialPost {
  author: string;
  url: string;
  text: string;
  createdAtMs?: number;
  favorites?: number;
}

// x.com serves full server-rendered HTML to a browser UA (no login).
// Posts live in an escaped JSON payload inside <script> stream chunks.
export function parseProfilePosts(html: string, handle: string): SocialPost[] {
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

export async function fetchProfilePosts(handle: string): Promise<SocialPost[]> {
  const res = await fetch(`https://x.com/${handle}`, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if (!res.ok) throw new Error(`x.com/${handle} returned ${res.status}`);
  const html = await res.text();
  return parseProfilePosts(html, handle);
}

const DEFAULT_WATCHLIST = [
  "karpathy", "sama", "gdb", "swyx", "simonw", "AndrewYNg", "ylecun",
  "DrJimFan", "soumith", "dan_abramov", "sebastianruder", "fchollet", "hardmaru",
  "rasbt", "hardmaru",
];

export function watchlist(): string[] {
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

// Watchlist management: web social follow <handle>
export async function follow(handles: string[]): Promise<void> {
  if (!handles.length) {
    console.error("Error: at least one handle required");
    process.exit(1);
  }
  const { appendFileSync, mkdirSync } = await import("node:fs");
  const dir = join(homedir(), ".config/web");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "social-watchlist.txt");
  const clean = handles.map((h) => h.replace(/^@/, "").trim()).filter(Boolean);
  appendFileSync(file, clean.join("\n") + "\n");
  console.log(`Added to ${file}: ${clean.map((h) => "@" + h).join(", ")}`);
}
