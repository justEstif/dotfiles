/**
 * Shared types for the thoughts extension.
 * Mode definitions live in references/*.md frontmatter — no hardcoded mode list.
 */

// ─── Custom entry shapes ───────────────────────────────────────────────────

export const THOUGHTS_CUSTOM_TYPE = "thoughts";

export const THOUGHT_LABEL_PREFIX = "thought:";
export const RESERVED_STEMS = new Set([
  "notes", "thoughts", "misc", "todo", "temp", "untitled",
]);

export type ThoughtsCustomData =
  | ThoughtAnchor
  | ThoughtLabel
  | ThoughtSummary
  | ThoughtEnd
  | ModeChange;

export interface ThoughtAnchor {
  kind: "start";
  anchorId: string;
  name: string;
  displayName: string;
  snapshot: string;
  createdAt: number;
}

export interface ThoughtLabel {
  kind: "label";
  anchorId: string;
  rootId: string;
  name: string;
  displayName: string;
  snapshot: string;
  createdAt: number;
}

export interface ThoughtSummary {
  kind: "summary";
  rootId: string;
  summary: string;
  generatedAt: number;
  modelId?: string;
  parentTurnId?: string;
}

export interface ThoughtEnd {
  kind: "end";
  rootId: string;
  resolution: string;
  endedAt: number;
}

export interface ModeChange {
  kind: "mode_change";
  mode: string; // mode id from reference .md frontmatter, or "off"
  anchorId?: string;
  changedAt: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9?]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export function generateAnchorId(): string {
  return Math.random().toString(16).substring(2, 14);
}

export function validateThoughtName(name: string): {
  valid: boolean;
  error?: string;
  suggestion?: string;
} {
  if (!name || name.trim().length < 8) {
    return { valid: false, error: "Name must be at least 8 characters" };
  }

  const slug = slugify(name);
  if (!slug) {
    return { valid: false, error: "Name must contain alphanumeric characters" };
  }

  for (const stem of RESERVED_STEMS) {
    if (slug === stem || slug.startsWith(stem + "-")) {
      return {
        valid: false,
        error: `Name cannot start with reserved word "${stem}"`,
      };
    }
  }

  const hasQuestion = name.includes("?");
  const verbs = [
    "should", "should-i", "will", "can", "is", "does", "how", "why", "what",
  ];
  const hasVerb = verbs.some((v) =>
    name.toLowerCase().startsWith(v.replace(/-/g, " "))
  );

  if (!hasQuestion && !hasVerb) {
    return {
      valid: true,
      suggestion: "That looks like a topic. What's the actual question or tension?",
    };
  }

  return { valid: true };
}
