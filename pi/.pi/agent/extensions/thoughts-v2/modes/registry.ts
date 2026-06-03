/**
 * Mode definitions and reference file registry
 */

import { join, dirname } from "path";
import { readFileSync, existsSync } from "fs";
import type { ThinkingMode } from "../types.ts";

const REF_DIR = join(dirname(import.meta.url.replace("file://", "")), "..", "references");

export interface ModeDefinition {
  id: ThinkingMode;
  label: string;
  description: string;
  referenceFile: string; // relative to references/
  routingHints: string[]; // keywords that suggest this mode
}

export const MODE_DEFINITIONS: ModeDefinition[] = [
  {
    id: "sycophancy",
    label: "Sycophancy (Adversarial)",
    description:
      "Constructive disagreement. Argue the strongest opposing case. Challenge assumptions. Default for general adversarial thinking.",
    referenceFile: "sycophancy.md",
    routingHints: [
      "push back", "challenge", "stress test", "devil's advocate",
      "adversarial", "what am i missing", "disagree",
    ],
  },
  {
    id: "root-ask",
    label: "Root-Ask (Investigation)",
    description:
      "Investigate the underlying need behind a stated request. Ask about pain, not intent. Use when the request may be a proxy for a deeper problem.",
    referenceFile: "root-ask.md",
    routingHints: [
      "root cause", "behind the request", "real need", "investigate",
      "is this the right problem",
    ],
  },
  {
    id: "grill-me",
    label: "Grill-Me (Interrogation)",
    description:
      "Walk down each branch of a design tree, resolving dependencies one-by-one. Force decisions. Use for specific plans or designs to resolve end-to-end.",
    referenceFile: "grill-me.md",
    routingHints: [
      "grill me", "interrogate", "plan review", "design review",
      "resolve decisions",
    ],
  },
];

/**
 * Get a mode definition by id
 */
export function getModeDefinition(mode: ThinkingMode): ModeDefinition | undefined {
  return MODE_DEFINITIONS.find((m) => m.id === mode);
}

/**
 * Load the reference content for a mode
 */
export function loadReferenceContent(mode: ThinkingMode): string | null {
  const def = getModeDefinition(mode);
  if (!def) return null;

  const filePath = join(REF_DIR, def.referenceFile);
  if (!existsSync(filePath)) return null;

  return readFileSync(filePath, "utf8");
}

/**
 * Auto-detect mode from user text (returns null if no match)
 */
export function detectMode(text: string): ThinkingMode | null {
  const lower = text.toLowerCase();
  let best: { mode: ThinkingMode; score: number } | null = null;

  for (const def of MODE_DEFINITIONS) {
    let score = 0;
    for (const hint of def.routingHints) {
      if (lower.includes(hint)) score++;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { mode: def.id, score };
    }
  }

  return best?.mode ?? null;
}
