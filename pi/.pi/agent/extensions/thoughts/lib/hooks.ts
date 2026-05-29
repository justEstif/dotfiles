/**
 * pi event hooks: turn_end, input, session_before_tree
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { THOUGHT_LABEL_PREFIX, THOUGHTS_CUSTOM_TYPE } from "../types.ts";
import { findThoughtAncestor, parseThreadPrefix } from "./helpers.ts";
import { generateSummaryInBackground } from "./summary.ts";

interface ThoughtsSettings {
  enabled?: boolean;
  passive?: boolean;
  model?: { provider: string; id: string };
}

export function registerHooks(pi: ExtensionAPI): void {
  let summaryInFlight: Promise<void> | null = null;

  // ──────────────────────────────────────────────────────────────────────────
  // turn_end: schedule background summary generation
  // ──────────────────────────────────────────────────────────────────────────
  pi.on("turn_end", async (_event, ctx) => {
    const settings = ctx.getSettings?.("thoughts") as ThoughtsSettings | undefined;
    if (settings?.passive) return;

    const leafId = ctx.sessionManager.getLeafId();
    if (!leafId) return;

    const ancestor = findThoughtAncestor(ctx, leafId);
    if (!ancestor) return;

    const entries = ctx.sessionManager.getEntries();
    const rootLabel = ancestor.label;

    // Skip if a recent summary exists (< 10 entries old)
    const lastSummary = entries
      .slice()
      .reverse()
      .find(
        (e) =>
          e.type === "custom" &&
          (e as any).customType === THOUGHTS_CUSTOM_TYPE &&
          (e as any).data?.kind === "summary" &&
          ((e as any).data as any).rootId === rootLabel
      );

    if (lastSummary) {
      const lastSummaryIdx = entries.indexOf(lastSummary);
      if (entries.length - lastSummaryIdx < 10) return;
    }

    if (!summaryInFlight) {
      summaryInFlight = generateSummaryInBackground(pi, ctx, rootLabel, leafId)
        .catch(() => {})
        .finally(() => {
          summaryInFlight = null;
        });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // input: detect "/thread-name: message" prefix routing
  // ──────────────────────────────────────────────────────────────────────────
  pi.on("input", async (event, ctx) => {
    const text = event.text as string;
    if (!text) return;

    const { threadSlug } = parseThreadPrefix(text);
    if (!threadSlug) return;

    const entries = ctx.sessionManager.getEntries();
    const threadExists = entries.some(
      (e) =>
        e.type === "label" &&
        (e as any).label === `${THOUGHT_LABEL_PREFIX}${threadSlug}`
    );

    if (threadExists) {
      ctx.ui.notify(`📌 Routing to thread: ${threadSlug}`, "info");
    }

    return { action: "continue" };
  });

  // ──────────────────────────────────────────────────────────────────────────
  // session_before_tree: return pre-generated summary when branching away
  // ──────────────────────────────────────────────────────────────────────────
  pi.on("session_before_tree", async (_event, ctx) => {
    const leafId = ctx.sessionManager.getLeafId();
    if (!leafId) return;

    const ancestor = findThoughtAncestor(ctx, leafId);
    if (!ancestor) return;

    const entries = ctx.sessionManager.getEntries();
    const rootLabel = ancestor.label;

    const summaryEntry = entries
      .slice()
      .reverse()
      .find(
        (e) =>
          e.type === "custom" &&
          (e as any).customType === THOUGHTS_CUSTOM_TYPE &&
          (e as any).data?.kind === "summary" &&
          ((e as any).data as any).rootId === rootLabel
      );

    if (summaryEntry && (summaryEntry as any).data?.summary) {
      const data = (summaryEntry as any).data as any;
      return {
        summary: {
          summary: data.summary,
          details: {
            thoughtThread:
              data.displayName ?? rootLabel.substring(THOUGHT_LABEL_PREFIX.length),
          },
        },
      };
    }
  });
}
