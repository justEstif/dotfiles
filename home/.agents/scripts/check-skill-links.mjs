#!/usr/bin/env node
// Resolves every relative markdown link and every bare `references/...`,
// `playbooks/...`, or `scripts/...` path in the skills tree. Paths are
// resolved against the linking file's directory; a bare path that misses
// there is retried from the file's skill root. Exit 0 = all resolve.
// Usage: node check-skill-links.mjs [skills-dir]  (default: ../skills)

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const here = path.dirname(new URL(import.meta.url).pathname);
const skillsDir = path.resolve(process.argv[2] ?? path.join(here, "../skills"));

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isSymbolicLink() && !fs.existsSync(p)) return [];
    return e.isDirectory() ? walk(p) : e.name.endsWith(".md") ? [p] : [];
  });

const skillRoot = (file) => {
  let dir = path.dirname(file);
  while (dir.startsWith(skillsDir) && dir !== skillsDir) {
    if (fs.existsSync(path.join(dir, "SKILL.md"))) return dir;
    dir = path.dirname(dir);
  }
  return path.dirname(file);
};

const stripFences = (text) => text.replace(/```[\s\S]*?```/g, "");
const LINK = /\]\(([^)\s]+)\)/g;
const BARE = /(?<![\w./~-])((?:references|playbooks|scripts)\/[\w./-]+\.(?:md|mjs|sh|json|tsv))/g;

const problems = [];
for (const file of walk(skillsDir)) {
  const text = stripFences(fs.readFileSync(file, "utf8"));
  const rel = path.relative(skillsDir, file);
  for (const [, raw] of text.matchAll(LINK)) {
    if (/^[a-z]+:|^#|^\/|^~/.test(raw)) continue;
    const target = decodeURIComponent(raw.split("#")[0]);
    if (target && !fs.existsSync(path.resolve(path.dirname(file), target)))
      problems.push(`${rel}: link (${raw})`);
  }
  for (const [, bare] of text.matchAll(BARE)) {
    if (bare.includes("<") || bare.includes("*")) continue;
    const local = path.resolve(path.dirname(file), bare);
    const fromRoot = path.resolve(skillRoot(file), bare);
    if (!fs.existsSync(local) && !fs.existsSync(fromRoot)) problems.push(`${rel}: path ${bare}`);
  }
}

if (problems.length) {
  console.error(`${problems.length} unresolved:`);
  for (const p of [...new Set(problems)]) console.error(`  - ${p}`);
  process.exit(1);
}
console.error("All skill links and paths resolve.");
