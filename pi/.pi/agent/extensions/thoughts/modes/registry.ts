/**
 * Mode registry: scans references/ dir for .md files with YAML frontmatter.
 * Adding a new mode = adding one .md file. No TypeScript changes needed.
 */

import { join, dirname } from "path";
import { readFileSync, readdirSync, existsSync } from "fs";
import matter from "gray-matter";

const REF_DIR = join(dirname(import.meta.url.replace("file://", "")), "..", "references");

export interface ModeDefinition {
  id: string;
  label: string;
  description: string;
  routingHints: string[];
  routing: Record<string, string>;
  content: string; // body (after frontmatter)
  filename: string;
}

let _cache: ModeDefinition[] | null = null;

/**
 * Load all mode definitions from reference files.
 * Results are cached for the process lifetime.
 */
export function loadModes(): ModeDefinition[] {
  if (_cache) return _cache;

  if (!existsSync(REF_DIR)) {
    _cache = [];
    return _cache;
  }

  const files = readdirSync(REF_DIR).filter((f) => f.endsWith(".md"));
  const modes: ModeDefinition[] = [];

  for (const file of files) {
    const raw = readFileSync(join(REF_DIR, file), "utf8");
    const { data, content } = matter(raw);

    if (!data.id) {
      console.warn(`[thoughts] skipping ${file}: missing frontmatter "id"`);
      continue;
    }

    modes.push({
      id: data.id,
      label: data.label ?? data.id,
      description: data.description ?? "",
      routingHints: data.routingHints ?? [],
      routing: data.routing ?? {},
      content,
      filename: file,
    });
  }

  _cache = modes;
  return modes;
}

/**
 * Get a mode definition by id
 */
export function getModeDefinition(mode: string): ModeDefinition | undefined {
  return loadModes().find((m) => m.id === mode);
}

/**
 * Load the reference content (body) for a mode
 */
export function loadReferenceContent(mode: string): string | null {
  const def = getModeDefinition(mode);
  return def?.content ?? null;
}

/**
 * Get all valid mode ids (for validation, autocomplete, tool enum)
 */
export function getModeIds(): string[] {
  return loadModes().map((m) => m.id);
}

/**
 * Auto-detect mode from user text (returns null if no match)
 */
export function detectMode(text: string): string | null {
  const lower = text.toLowerCase();
  let best: { mode: string; score: number } | null = null;

  for (const def of loadModes()) {
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

/**
 * Build routing instruction string from mode's frontmatter routing field.
 * Returns an HTML comment injected into the system prompt.
 */
export function buildRoutingInstruction(mode: string): string {
  const def = getModeDefinition(mode);
  if (!def || Object.keys(def.routing).length === 0) return "";

  const parts = Object.entries(def.routing).map(([condition, suggestion]) => {
    // Convert camelCase/ifPrefix to readable: "ifPlan" → "if plan reveals a specific plan/design"
    const readable = condition
      .replace(/^if/, "")
      .replace(/([A-Z])/g, " $1")
      .toLowerCase()
      .trim();
    return `if ${readable}, ${suggestion}`;
  });

  return `<!-- routing: ${parts.join(". ")}. -->`;
}
