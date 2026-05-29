/**
 * /thought:status — Show current thread metadata
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { THOUGHT_LABEL_PREFIX, THOUGHTS_CUSTOM_TYPE, ThoughtAnchor } from "../types.ts";
import { findThoughtAncestor } from "../lib/helpers.ts";

export function registerThoughtStatus(pi: ExtensionAPI): void {
  pi.registerCommand("thought:status", {
    description: "Show the current thought thread status",
    handler: async (_args, ctx) => {
      const leafId = ctx.sessionManager.getLeafId();
      if (!leafId) {
        ctx.ui.notify("No session loaded", "error");
        return;
      }

      const ancestor = findThoughtAncestor(ctx, leafId);
      if (!ancestor) {
        ctx.ui.notify("No active thought thread on this branch.", "error");
        return;
      }

      const entries = ctx.sessionManager.getEntries();
      const rootSlug = ancestor.label.substring(THOUGHT_LABEL_PREFIX.length);

      const startEntry = entries.find(
        (e) =>
          e.type === "custom" &&
          (e as any).customType === THOUGHTS_CUSTOM_TYPE &&
          (e as any).data?.kind === "start" &&
          ((e as any).data as ThoughtAnchor).name === rootSlug
      );

      if (!startEntry) {
        ctx.ui.notify("Could not find thought start entry", "error");
        return;
      }

      const start = (startEntry as any).data as ThoughtAnchor;

      let labelCount = 0;
      for (const entry of entries) {
        if (
          entry.type === "custom" &&
          (entry as any).customType === THOUGHTS_CUSTOM_TYPE &&
          (entry as any).data?.kind === "label"
        ) {
          labelCount++;
        }
      }

      let summaryAge = "no summary yet";
      for (let i = entries.length - 1; i >= 0; i--) {
        const e = entries[i];
        if (
          e.type === "custom" &&
          (e as any).customType === THOUGHTS_CUSTOM_TYPE &&
          (e as any).data?.kind === "summary"
        ) {
          const ageMs = Date.now() - (e as any).data.generatedAt;
          const ageMins = Math.round(ageMs / 60000);
          summaryAge = ageMins < 1 ? "just now" : `${ageMins}m ago`;
          break;
        }
      }

      ctx.ui.notify(
        `Thread: "${start.displayName}"\nSlug: ${start.name}\nAnchor ID: ${start.anchorId}\nCheckpoints: ${labelCount}\nSummary: ${summaryAge}`,
        "info"
      );
    },
  });
}
