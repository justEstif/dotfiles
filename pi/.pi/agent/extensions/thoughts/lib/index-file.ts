/**
 * Persistent index of thought threads — ~/.pi/agent/thoughts-index.jsonl
 *
 * One entry per line. Written on /thoughts:start, read by /thoughts and /thoughts:switch.
 * Stale entries (session file deleted) are silently skipped on read.
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

export interface ThreadIndexEntry {
  slug: string;
  displayName: string;
  sessionFile: string;
  cwd: string;
  createdAt: number;
  updatedAt: number;
}

const INDEX_PATH = join(homedir(), ".pi", "agent", "thoughts-index.jsonl");

/**
 * Append a new thread entry to the index
 */
export function indexThread(entry: ThreadIndexEntry): void {
  appendFileSync(INDEX_PATH, JSON.stringify(entry) + "\n", "utf8");
}

/**
 * Update the updatedAt timestamp for a thread (rewrites file)
 */
export function touchThread(slug: string): void {
  const entries = readIndex();
  const idx = entries.findLastIndex((e) => e.slug === slug);
  if (idx < 0) return;
  entries[idx].updatedAt = Date.now();
  writeFileSync(
    INDEX_PATH,
    entries.map((e) => JSON.stringify(e)).join("\n") + "\n",
    "utf8"
  );
}

/**
 * Read all index entries, skipping stale (missing session file) and duplicate slugs.
 * Returns most recent entry per slug, sorted by updatedAt descending.
 */
export function readIndex(): ThreadIndexEntry[] {
  if (!existsSync(INDEX_PATH)) return [];

  const lines = readFileSync(INDEX_PATH, "utf8")
    .split("\n")
    .filter((l) => l.trim());

  const bySlug = new Map<string, ThreadIndexEntry>();

  for (const line of lines) {
    try {
      const entry: ThreadIndexEntry = JSON.parse(line);
      // Keep most recently updated entry per slug
      const existing = bySlug.get(entry.slug);
      if (!existing || entry.updatedAt > existing.updatedAt) {
        bySlug.set(entry.slug, entry);
      }
    } catch {
      // Skip malformed lines
    }
  }

  return Array.from(bySlug.values())
    .filter((e) => existsSync(e.sessionFile)) // skip stale
    .sort((a, b) => b.updatedAt - a.updatedAt);
}
