/**
 * /thought:resume <slug> — Jump to a thread from any working directory
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { SessionManager } from "@earendil-works/pi-coding-agent";
import { THOUGHT_LABEL_PREFIX } from "../types.ts";

export function registerThoughtResume(pi: ExtensionAPI): void {
  pi.registerCommand("thought:resume", {
    description: "Resume a thought thread from any working directory",
    handler: async (args, ctx) => {
      if (!args) {
        ctx.ui.notify("Usage: /thought:resume <name>", "error");
        return;
      }

      const targetSlug = args as string;
      const allSessions = await SessionManager.listAll();
      const candidates: Array<{ cwd: string; file: string }> = [];

      for (const session of allSessions) {
        try {
          const sm = await SessionManager.open(session.file);
          const entries = sm.getEntries();

          for (const entry of entries) {
            if (entry.type === "label") {
              const label = (entry as any).label;
              if (label === `${THOUGHT_LABEL_PREFIX}${targetSlug}`) {
                candidates.push({ cwd: sm.getCwd(), file: session.file });
                break;
              }
            }
          }
        } catch {
          // Skip
        }
      }

      if (candidates.length === 0) {
        ctx.ui.notify(`Thread not found: "${targetSlug}"`, "error");
        return;
      }

      let targetSessionFile = candidates[0].file;

      if (candidates.length > 1) {
        const choice = await ctx.ui.select(
          "Multiple sessions found. Pick one:",
          candidates.map((c) => c.file)
        );
        if (!choice) {
          ctx.ui.notify("Cancelled", "info");
          return;
        }
        targetSessionFile = choice;
      }

      await ctx.switchSession(targetSessionFile);
    },
  });
}
