/**
 * /thought:start [name] — Begin a new thought thread
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  THOUGHT_LABEL_PREFIX,
  THOUGHTS_CUSTOM_TYPE,
  ThoughtAnchor,
  slugify,
  validateThoughtName,
  generateAnchorId,
} from "../types.ts";
import { captureSnapshot } from "../lib/helpers.ts";

export function registerThoughtStart(pi: ExtensionAPI): void {
  pi.registerCommand("thought:start", {
    description: "Start a new thought thread",
    handler: async (args, ctx) => {
      let name = args as string | undefined;

      if (!name) {
        const prompt = `Name this thought thread.

A good name is the live question or tension, not the topic.

  ✓ "Lead with 1 Gig or 500 on Frontier offer page?"
  ✓ "Does a thought tracker belong inside pk?"

  ✗ "Frontier review"        (topic, not question)
  ✗ "thoughts about pricing" (vague)
  ✗ "meeting notes"          (container, not thought)`;

        name = await ctx.ui.input(prompt);
        if (!name) {
          ctx.ui.notify("Cancelled", "info");
          return;
        }

        const validation = validateThoughtName(name);
        if (validation.suggestion) {
          const retry = await ctx.ui.confirm(
            "Naming",
            `${validation.suggestion} Continue anyway?`
          );
          if (!retry) {
            ctx.ui.notify("Cancelled", "info");
            return;
          }
        } else if (!validation.valid) {
          ctx.ui.notify(`Invalid: ${validation.error}`, "error");
          return;
        }
      } else {
        const validation = validateThoughtName(name);
        if (!validation.valid) {
          ctx.ui.notify(`Invalid: ${validation.error}`, "error");
          return;
        }
      }

      const leafId = ctx.sessionManager.getLeafId();
      if (!leafId) {
        ctx.ui.notify("No session loaded", "error");
        return;
      }

      const slug = slugify(name);
      const anchorId = generateAnchorId();
      const snapshot = captureSnapshot(ctx, leafId);

      ctx.sessionManager.appendSessionInfo(name);
      ctx.sessionManager.appendLabelChange(leafId, `${THOUGHT_LABEL_PREFIX}${slug}`);

      const anchor: ThoughtAnchor = {
        kind: "start",
        anchorId,
        name: slug,
        displayName: name,
        snapshot,
        createdAt: Date.now(),
      };

      ctx.sessionManager.appendCustomEntry(THOUGHTS_CUSTOM_TYPE, anchor);
      ctx.ui.notify(`✓ Thought thread started: "${name}" (id: ${anchorId})`, "info");
    },
  });
}
