/**
 * Heuristic session summary extraction.
 *
 * Generates a learning-progress summary from conversation entries without
 * any LLM calls. Survives compaction by being stored as a custom entry.
 *
 * Pattern borrowed from the thoughts extension's extractSummaryHeuristic.
 */

import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { LearningState } from "./types.js";

/**
 * Extract a learning-shaped summary from conversation entries.
 * Zero LLM calls — fast, faithful, durable through compaction.
 */
export function extractLearningSummary(
  entries: any[],
  state: LearningState,
): string {
  const conceptsMentioned: string[] = [];
  const exercisesAttempted: string[] = [];
  const questionsAsked: string[] = [];
  const codeWritten: string[] = [];

  // Walk entries backwards (most recent first)
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    if (entry.type !== "message") continue;

    const msg = entry.message;
    if (!msg) continue;

    const content =
      typeof msg.content === "string"
        ? msg.content
        : msg.content
            ?.map((c: any) => (c.type === "text" ? c.text : ""))
            .join(" ");

    if (!content || typeof content !== "string") continue;

    if (msg.role === "user") {
      // Extract questions
      const lines = content.split("\n").filter((l: string) => l.trim());
      for (const line of lines) {
        const trimmed = line.trim();
        if (
          trimmed.includes("?") &&
          !questionsAsked.some((q) => q.includes(trimmed.substring(0, 30)))
        ) {
          questionsAsked.push(trimmed.substring(0, 120));
        }
      }

      // Detect code snippets from user
      const codeBlocks = content.match(/```[\s\S]*?```/g);
      if (codeBlocks) {
        for (const block of codeBlocks) {
          const preview = block.replace(/```\w*\n?/, "").substring(0, 80);
          if (
            preview.length > 10 &&
            !codeWritten.some((c) => c.includes(preview.substring(0, 30)))
          ) {
            codeWritten.push(preview);
          }
        }
      }
    } else if (msg.role === "assistant") {
      // Extract concept introductions (heuristic: bold terms or "concept" keyword)
      const boldTerms = content.match(/\*\*([^*]{3,40})\*\*/g) ?? [];
      for (const term of boldTerms) {
        const clean = term.replace(/\*\*/g, "");
        if (
          !conceptsMentioned.some((c) => c.includes(clean.substring(0, 20)))
        ) {
          conceptsMentioned.push(clean);
        }
      }

      // Detect exercise prompts
      if (
        content.match(/exercise|challenge|try this|your turn|write a|implement/i)
      ) {
        const preview = content.substring(0, 100).replace(/\n/g, " ");
        if (
          !exercisesAttempted.some((e) =>
            e.includes(preview.substring(0, 30)),
          )
        ) {
          exercisesAttempted.push(preview);
        }
      }
    }
  }

  // Build summary
  const parts: string[] = [];

  parts.push("## Learning Context");
  parts.push(
    `Goal: ${state.workingGoal || state.goal || "(not specified)"}`,
  );
  parts.push(
    `Difficulty: ${state.difficulty.tier} | Exercises: ${state.exercisesGiven.length}`,
  );

  const conceptCount = Object.keys(state.concepts).length;
  if (conceptCount > 0) {
    const deep = Object.values(state.concepts).filter(
      (c) => c.encodingDepth === "deep" || c.encodingDepth === "transferable",
    ).length;
    const inProgress = Object.values(state.concepts).filter(
      (c) => c.encodingDepth === "relational",
    ).length;
    parts.push(
      `Concepts: ${conceptCount} tracked (${deep} deep/transferable, ${inProgress} relational, ${conceptCount - deep - inProgress} surface)`,
    );
  }
  parts.push("");

  if (conceptsMentioned.length > 0) {
    parts.push("## Concepts Discussed");
    for (const c of conceptsMentioned.slice(0, 8)) {
      parts.push(`- ${c}`);
    }
    parts.push("");
  }

  if (exercisesAttempted.length > 0) {
    parts.push("## Exercises Given");
    for (const e of exercisesAttempted.slice(0, 4)) {
      parts.push(`- ${e}`);
    }
    parts.push("");
  }

  if (questionsAsked.length > 0) {
    parts.push("## Recent Questions");
    for (const q of questionsAsked.slice(0, 4)) {
      parts.push(`- ${q}`);
    }
    parts.push("");
  }

  parts.push("## Resume Here");
  parts.push(
    "Continue from where the learner left off. Check if any concepts need review.",
  );

  return parts.join("\n");
}
