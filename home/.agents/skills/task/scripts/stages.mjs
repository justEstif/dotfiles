#!/usr/bin/env node
// Renders the task skill's stage list from stages/index.json and validates
// that every named skill, playbook, and reference exists on disk.
// Skills: bare names resolve to sibling skill dirs (../<name>/SKILL.md);
// entries containing "/" resolve relative to this skill's root.
// Playbooks resolve under playbooks/. Dispatch entries are subagent role
// names carried in SKILL.md prose, not on-disk files; they are checked for
// shape only. Gates are required on stages 1, 2, and 5 only. Exit 0 = valid.

import fs from "node:fs";
import process from "node:process";

const root = new URL("..", import.meta.url); // skill root: task/
const toPath = (p) => new URL(p, root).pathname;
const exists = (p) => fs.existsSync(toPath(p));

const index = JSON.parse(fs.readFileSync(toPath("stages/index.json"), "utf8"));
const problems = [];
const fail = (msg) => problems.push(msg);

if (!Array.isArray(index.stages) || index.stages.length === 0) {
  fail("index has no stages array");
}

const GATED = new Set([1, 2, 5]);
let prev = 0;
for (const stage of index.stages ?? []) {
  const label = `stage ${stage.id ?? "?"} (${stage.name ?? "unnamed"})`;
  if (typeof stage.id !== "number" || stage.id !== prev + 1)
    fail(`${label}: ids must be sequential integers starting at 1`);
  prev = stage.id;

  if (GATED.has(stage.id)) {
    if (typeof stage.gate !== "string" || stage.gate.trim() === "")
      fail(`${label}: needs a non-empty gate question (gates sit at stages 1, 2, 5 only)`);
  } else if (stage.gate !== null && stage.gate !== false && stage.gate !== "")
    fail(`${label}: must have no gate (empty/false/null); stages 3-4 run unattended`);

  for (const skill of stage.skills ?? []) {
    if (typeof skill !== "string" || skill.trim() === "") {
      fail(`${label}: empty skill entry`);
      continue;
    }
    const resolved = skill.includes("/") ? skill : `../${skill}/SKILL.md`;
    if (!exists(resolved)) fail(`${label}: skill "${skill}" not found at ${resolved}`);
  }

  for (const role of stage.dispatch ?? []) {
    if (typeof role !== "string" || role.trim() === "")
      fail(`${label}: empty dispatch role`);
  }

  for (const playbook of stage.playbooks ?? []) {
    const resolved = `playbooks/${playbook}`;
    if (!exists(resolved)) fail(`${label}: playbook "${playbook}" not found at ${resolved}`);
  }
}

if (!exists("SKILL.md")) fail("SKILL.md missing at skill root");

const width = Math.max(...(index.stages ?? []).map((s) => `Stage ${s.id} — ${s.name}`.length), 1);
for (const stage of index.stages ?? []) {
  const title = `Stage ${stage.id} — ${stage.name}`.padEnd(width);
  const gate = stage.gate ? `GATE: ${stage.gate}` : "(no gate — runs unattended)";
  console.log(`${title}  ${gate}`);
  if (stage.skills?.length) console.log(`${" ".repeat(width)}  skills:    ${stage.skills.join(", ")}`);
  if (stage.dispatch?.length) console.log(`${" ".repeat(width)}  dispatch:  ${stage.dispatch.join(", ")}`);
  if (stage.playbooks?.length) console.log(`${" ".repeat(width)}  playbooks: ${stage.playbooks.join(", ")}`);
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.error("\nAll stages, skills, playbooks, and references valid.");
