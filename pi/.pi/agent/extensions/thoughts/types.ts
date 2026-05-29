/**
 * Types and constants for the thoughts extension
 */

export const THOUGHT_LABEL_PREFIX = "thought:";
export const THOUGHTS_CUSTOM_TYPE = "thoughts";

export const RESERVED_STEMS = new Set([
  "notes",
  "thoughts",
  "misc",
  "todo",
  "temp",
  "untitled",
]);

/**
 * Discriminated union for custom entries stored by the extension
 */
export type ThoughtsCustomData =
  | ThoughtAnchor
  | ThoughtLabel
  | ThoughtSummary
  | ThoughtEnd;

export interface ThoughtAnchor {
  kind: "start";
  anchorId: string; // 12-char hex
  name: string; // slug: "lead-with-1g-or-500"
  displayName: string; // original: "Lead with 1G or 500?"
  snapshot: string; // verbatim text
  createdAt: number; // ms since epoch
}

export interface ThoughtLabel {
  kind: "label";
  anchorId: string; // unique for this label
  rootId: string; // the start anchor's ID
  name: string; // e.g., "lead-with-1g-or-500/sub-point"
  displayName: string; // original user text
  snapshot: string;
  createdAt: number;
}

export interface ThoughtSummary {
  kind: "summary";
  rootId: string; // links to the start anchor
  summary: string; // the thought-shaped summary text
  generatedAt: number;
  modelId?: string;
  parentTurnId?: string; // the turn after which this summary was generated
}

export interface ThoughtEnd {
  kind: "end";
  rootId: string; // links to the start anchor
  resolution: string; // how the thread resolved
  endedAt: number;
}

/**
 * Slugify a name: lowercase, replace spaces and special chars with hyphens
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9?]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

/**
 * Validate a thought name
 * @returns { valid: boolean, error?: string, suggestion?: string }
 */
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

  // Check for reserved stems
  for (const stem of RESERVED_STEMS) {
    if (slug === stem || slug.startsWith(stem + "-")) {
      return {
        valid: false,
        error: `Name cannot start with reserved word "${stem}"`,
      };
    }
  }

  // Soft check: if no question mark and no obvious verb, suggest rephrasing
  const hasQuestion = name.includes("?");
  const verbs = [
    "should",
    "should-i",
    "will",
    "can",
    "is",
    "does",
    "how",
    "why",
    "what",
  ];
  const hasVerb = verbs.some((v) =>
    name.toLowerCase().startsWith(v.replace(/-/g, " "))
  );

  if (!hasQuestion && !hasVerb) {
    return {
      valid: true, // still valid, but suggest rephrasing
      suggestion:
        'That looks like a topic. What\'s the actual question or tension?',
    };
  }

  return { valid: true };
}

/**
 * Generate a short random hex ID for anchors
 */
export function generateAnchorId(): string {
  return Math.random().toString(16).substring(2, 14); // 12 chars
}
