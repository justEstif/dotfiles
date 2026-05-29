/**
 * /thought:view [name] [full] — View a thought thread with summaries
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  THOUGHT_LABEL_PREFIX,
  THOUGHTS_CUSTOM_TYPE,
  ThoughtAnchor,
  ThoughtLabel,
} from "../types.ts";
import { findThoughtAncestor } from "../lib/helpers.ts";

export function registerThoughtView(pi: ExtensionAPI): void {
  pi.registerCommand("thought:view", {
    description: "View a thought thread with summaries",
    handler: async (args, ctx) => {
      const leafId = ctx.sessionManager.getLeafId();
      if (!leafId && !args) {
        ctx.ui.notify("Usage: /thought:view [name] [full]", "error");
        return;
      }

      let targetSlug: string | undefined;
      let showFull = false;

      if (args) {
        const parts = (args as string).split(/\s+/);
        targetSlug = parts[0];
        showFull = parts.some((p) => p === "full");
      } else {
        const ancestor = findThoughtAncestor(ctx, leafId);
        if (ancestor) {
          targetSlug = ancestor.label.substring(THOUGHT_LABEL_PREFIX.length);
        }
      }

      if (!targetSlug) {
        ctx.ui.notify("No active thought thread", "error");
        return;
      }

      const entries = ctx.sessionManager.getEntries();

      const startEntry = entries.find(
        (e) =>
          e.type === "custom" &&
          (e as any).customType === THOUGHTS_CUSTOM_TYPE &&
          (e as any).data?.kind === "start" &&
          ((e as any).data as ThoughtAnchor).name === targetSlug
      );

      if (!startEntry) {
        ctx.ui.notify(`Thread not found: "${targetSlug}"`, "error");
        return;
      }

      const start = (startEntry as any).data as ThoughtAnchor;
      let output = `# ${start.displayName}\n\n## Anchors\n\n**Start**: ${start.displayName}\n`;

      if (showFull) {
        output += `\n\`\`\`\n${start.snapshot}\n\`\`\`\n\n`;
      } else {
        const preview = start.snapshot.substring(0, 200);
        output += `${preview}${preview.length >= 200 ? "..." : ""}\n\n`;
      }

      const labels = entries.filter(
        (e) =>
          e.type === "custom" &&
          (e as any).customType === THOUGHTS_CUSTOM_TYPE &&
          (e as any).data?.kind === "label" &&
          ((e as any).data as ThoughtLabel).rootId === `${THOUGHT_LABEL_PREFIX}${targetSlug}`
      );

      for (const labelEntry of labels) {
        const label = (labelEntry as any).data as ThoughtLabel;
        output += `**Label**: ${label.displayName}\n`;
        if (showFull) {
          output += `\n\`\`\`\n${label.snapshot}\n\`\`\`\n\n`;
        } else {
          const preview = label.snapshot.substring(0, 200);
          output += `${preview}${preview.length >= 200 ? "..." : ""}\n\n`;
        }
      }

      const summaryEntry = entries.find(
        (e) =>
          e.type === "custom" &&
          (e as any).customType === THOUGHTS_CUSTOM_TYPE &&
          (e as any).data?.kind === "summary" &&
          ((e as any).data as any).rootId === `${THOUGHT_LABEL_PREFIX}${targetSlug}`
      );

      if (summaryEntry) {
        const summary = (summaryEntry as any).data as any;
        output += `## Summary\n\n${summary.summary}\n\n`;
      }

      ctx.ui.notify(output, "info");

      if (ctx.ui.copyToClipboard) {
        ctx.ui.copyToClipboard(output);
      }
    },
  });
}
