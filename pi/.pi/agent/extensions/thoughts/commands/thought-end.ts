/**
 * /thought:end [resolution] — Mark the current thread as resolved
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { THOUGHTS_CUSTOM_TYPE } from "../types.ts";
import { findThoughtAncestor } from "../lib/helpers.ts";

export function registerThoughtEnd(pi: ExtensionAPI): void {
  pi.registerCommand("thought:end", {
    description: "Mark the current thought thread as resolved and exit it",
    handler: async (args, ctx) => {
      const leafId = ctx.sessionManager.getLeafId();
      if (!leafId) {
        ctx.ui.notify("No session loaded", "error");
        return;
      }

      const ancestor = findThoughtAncestor(ctx, leafId);
      if (!ancestor) {
        ctx.ui.notify("No active thought thread to end", "error");
        return;
      }

      let resolution = args as string | undefined;
      if (!resolution) {
        resolution = await ctx.ui.input("How did this thought resolve? (one sentence): ");
      }

      if (!resolution) {
        ctx.ui.notify("Cancelled", "info");
        return;
      }

      ctx.sessionManager.appendCustomEntry(THOUGHTS_CUSTOM_TYPE, {
        kind: "end",
        rootId: ancestor.label,
        resolution,
        endedAt: Date.now(),
      });

      ctx.ui.notify(`✓ Thread resolved: "${resolution}"`, "info");
    },
  });
}
