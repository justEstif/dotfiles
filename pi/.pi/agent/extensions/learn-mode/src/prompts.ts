import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Mustache from "mustache";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = join(__dirname, "..", "prompts");

/**
 * Parsed prompt template with metadata and named sections.
 */
export interface PromptTemplate {
  name: string;
  description: string;
  version: number;
  variables: string[];
  sections: Record<string, string>;
}

const cache = new Map<string, PromptTemplate>();

/**
 * Load and parse a YAML prompt file by name (without extension).
 * Results are cached for the lifetime of the process.
 */
export function loadPrompt(name: string): PromptTemplate {
  const cached = cache.get(name);
  if (cached) return cached;

  const raw = readFileSync(join(PROMPTS_DIR, `${name}.yaml`), "utf8");
  const parsed = parseYamlPrompt(raw);
  cache.set(name, parsed);
  return parsed;
}

/**
 * Render a prompt template with the given variables.
 *
 * @param name - Prompt template name (file name without .yaml)
 * @param vars - Variables to interpolate via mustache
 * @param sections - Optional explicit section order. Defaults to all sections in file order.
 */
export function renderPrompt(
  name: string,
  vars: Record<string, string>,
  sections?: string[],
): string {
  const template = loadPrompt(name);
  const order = sections ?? Object.keys(template.sections);
  const parts: string[] = [];

  for (const key of order) {
    const section = template.sections[key];
    if (!section) continue;
    const rendered = Mustache.render(section, vars);
    const trimmed = rendered.trim();
    if (trimmed) parts.push(trimmed);
  }

  return parts.join("\n\n");
}

/**
 * Get the list of variable names declared in a prompt template.
 * Useful for validation and debugging.
 */
export function getPromptVariables(name: string): string[] {
  return loadPrompt(name).variables;
}

/**
 * Minimal YAML parser for our flat prompt format.
 *
 * We only need: top-level string/array scalars and a `sections` mapping of
 * string values. No nested structures, no types other than string and string[].
 * This avoids adding a YAML dependency.
 *
 * Multi-line values use YAML literal block scalars (`|` and `>`).
 */
function parseYamlPrompt(raw: string): PromptTemplate {
  const lines = raw.split("\n");
  const data: Record<string, string | string[]> = {};
  const sections: Record<string, string> = {};

  let i = 0;

  // Parse top-level scalars until we hit `sections:`
  while (i < lines.length) {
    const line = lines[i];
    if (!line || line.startsWith("#")) {
      i++;
      continue;
    }

    const match = line.match(/^(\w+):\s*(.*)$/);
    if (!match) {
      i++;
      continue;
    }

    const [, key, rest] = match;

    if (key === "sections") {
      i++;
      break;
    }

    if (rest === "") {
      // Could be a list or a block scalar at top level — skip for now
      i++;
      continue;
    }

    // String value
    (data as Record<string, unknown>)[key] = rest;

    // Track variables as array
    if (key === "variables" && typeof rest === "string") {
      // Parse inline array: [var1, var2, var3]
      const arrMatch = rest.match(/^\[(.+)\]$/);
      if (arrMatch) {
        (data as Record<string, unknown>)[key] = arrMatch[1]
          .split(",")
          .map((s) => s.trim().replace(/^['"]|['"]$/g, ""));
      }
    }

    // Parse version as number
    if (key === "version") {
      (data as Record<string, unknown>)[key] = Number(rest) as unknown as string;
    }

    i++;
  }

  // Parse sections block
  while (i < lines.length) {
    const line = lines[i];
    if (!line) {
      i++;
      continue;
    }

    // Section key: indented with 2 spaces, followed by colon and optional block indicator
    const sectionMatch = line.match(/^  (\w+):\s*(\|>)?\s*$/);
    if (!sectionMatch) {
      i++;
      continue;
    }

    const [, sectionKey, blockType] = sectionMatch;
    i++;

    // Collect the block content (indented by 4+ spaces or empty)
    const contentLines: string[] = [];
    while (i < lines.length) {
      const contentLine = lines[i];
      if (
        contentLine === "" &&
        i + 1 < lines.length &&
        !lines[i + 1].startsWith("    ")
      ) {
        // Empty line followed by non-content: end of this section
        break;
      }
      if (contentLine === "") {
        contentLines.push("");
        i++;
        continue;
      }
      if (!contentLine.startsWith("    ")) break;
      contentLines.push(contentLine.slice(4)); // strip 4-space indent
      i++;
    }

    let content: string;
    if (blockType === ">") {
      // Folded: newlines become spaces, double newlines preserved
      content = contentLines
        .join("\n")
        .replace(/(?<!\n)\n(?!\n)/g, " ")
        .trim();
    } else {
      // Literal (default): preserve newlines
      content = contentLines.join("\n").trim();
    }

    sections[sectionKey] = content;
  }

  return {
    name: (data.name as string) ?? "",
    description: (data.description as string) ?? "",
    version: (data.version as unknown as number) ?? 1,
    variables: (data.variables as string[]) ?? [],
    sections,
  };
}

// Pre-load all prompts at module import for early validation
// Auto-discover: scan prompts/ dir for .yaml files
import { readdirSync, existsSync } from "node:fs";

const PROMPT_FILES: string[] = [];
if (existsSync(PROMPTS_DIR)) {
  for (const file of readdirSync(PROMPTS_DIR)) {
    if (file.endsWith(".yaml")) {
      const name = file.replace(/\.yaml$/, "");
      PROMPT_FILES.push(name);
    }
  }
}

for (const name of PROMPT_FILES) {
  try {
    loadPrompt(name);
  } catch (error) {
    console.error(`[learning-tutor] Failed to load prompt: ${name}`, error);
  }
}
