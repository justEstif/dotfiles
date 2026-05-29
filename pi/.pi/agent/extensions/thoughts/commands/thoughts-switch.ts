/**
 * /thoughts:switch [slug] — Jump to a thought thread
 * No arg → picker. With slug → direct jump.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readIndex } from "../lib/index-file.ts";

export function registerThoughtsSwitch(pi: ExtensionAPI): void {
  pi.registerCommand("thoughts:switch", {
    description: "Switch to a thought thread (works across sessions and directories)",
    handler: async (args, ctx) => {
      const threads = readIndex();

      if (threads.length === 0) {
        ctx.ui.notify("No thought threads yet. Start one with /thoughts:start", "info");
        return;
      }

      const targetSlug = args as string | undefined;

      if (!targetSlug) {
        // Show picker
        const choice = await ctx.ui.select(
          "Switch to thought:",
          threads.map((t) => `${t.displayName}  (${t.slug})`)
        );
        if (!choice) return;

        const picked = threads.find((t) => choice.includes(t.slug));
        if (!picked) return;

        await ctx.switchSession(picked.sessionFile);
        return;
      }

      // Direct slug lookup
      const thread = threads.find((t) => t.slug === targetSlug);
      if (!thread) {
        ctx.ui.notify(`Thread not found: "${targetSlug}"`, "error");
        return;
      }

      await ctx.switchSession(thread.sessionFile);
    },
  });
}
