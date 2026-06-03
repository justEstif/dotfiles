/**
 * Summary generation: heuristic extraction from conversation branches
 * Ported from v1 thoughts extension
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { THOUGHTS_CUSTOM_TYPE } from "../types.ts";

/**
 * Extract a thought-shaped summary from conversation entries using heuristics.
 * Zero LLM calls — fast, faithful, durable through compaction.
 */
export function extractSummaryHeuristic(
  entries: any[],
  _rootLabel: string
): string {
  const liveEdges: string[] = [];
  const tried: string[] = [];
  const decided: string[] = [];
  const openQuestions: string[] = [];

  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    if (entry.type !== "message") continue;

    const msg = (entry as any).message;
    if (!msg) continue;

    const content =
      typeof msg.content === "string"
        ? msg.content
        : msg.content
            ?.map((c: any) => (c.type === "text" ? c.text : ""))
            .join(" ");

    if (!content || typeof content !== "string") continue;

    if (msg.role === "user") {
      const lines = content.split("\n").filter((l: string) => l.trim());
      for (const line of lines) {
        const trimmed = line.trim();
        if (
          trimmed.includes("?") &&
          !openQuestions.some((q) => q.includes(trimmed.substring(0, 30)))
        ) {
          openQuestions.push(trimmed.substring(0, 100));
        }
        if (
          trimmed.match(/^(what|why|how|should|can|does)\s/i) &&
          !liveEdges.some((e) => e.includes(trimmed.substring(0, 30)))
        ) {
          liveEdges.push(trimmed.substring(0, 120));
        }
      }
    } else if (msg.role === "assistant") {
      const lines = content.split("\n").filter((l: string) => l.trim());
      for (const line of lines) {
        const trimmed = line.trim();
        if (
          trimmed.match(/(decided|conclusion|recommend|should|best|proposed)/i) &&
          trimmed.length > 10 &&
          !decided.some((d) => d.includes(trimmed.substring(0, 30)))
        ) {
          decided.push(trimmed.substring(0, 100));
        }
        if (
          trimmed.match(/(tried|explored|attempted|considered|approach)/i) &&
          !tried.some((t) => t.includes(trimmed.substring(0, 30)))
        ) {
          tried.push(trimmed.substring(0, 100));
        }
      }
    }
  }

  let summary = "## Live edge\n";
  summary += liveEdges.length > 0
    ? liveEdges[0] + "\n\n"
    : "Thread exploration ongoing.\n\n";

  summary += "## What was tried\n";
  summary += tried.length > 0
    ? tried.slice(0, 3).map((t) => `- ${t}`).join("\n") + "\n\n"
    : "- See conversation above.\n\n";

  summary += "## What was decided\n";
  summary += decided.length > 0
    ? decided.slice(0, 3).map((d) => `- ${d}`).join("\n") + "\n\n"
    : "- Nothing committed.\n\n";

  summary += "## Open questions\n";
  summary += openQuestions.length > 0
    ? openQuestions.slice(0, 3).map((q) => `- ${q}`).join("\n") + "\n\n"
    : "- None.\n\n";

  summary += "## Resume here\n";
  summary += "Review above and continue from the open edge.\n";

  return summary;
}

/**
 * Generate and persist a heuristic summary for the current branch
 */
export async function generateSummaryInBackground(
  _pi: ExtensionAPI,
  ctx: ExtensionContext,
  rootLabel: string,
  leafId: string
): Promise<void> {
  const entries = ctx.sessionManager.getEntries();
  const leafIndex = entries.findIndex((e) => e.id === leafId);
  if (leafIndex < 0) return;

  try {
    const summary = extractSummaryHeuristic(entries, rootLabel);

    ctx.sessionManager.appendCustomEntry(THOUGHTS_CUSTOM_TYPE, {
      kind: "summary",
      rootId: rootLabel,
      summary,
      generatedAt: Date.now(),
    });
  } catch {
    // Silently fail; summaries are optional
  }
}
