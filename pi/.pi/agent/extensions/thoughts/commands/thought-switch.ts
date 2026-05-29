/**
 * /thought:switch <slug> — Jump to a thought thread from any working directory
 * Shows the thread summary on landing.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { SessionManager } from "@earendil-works/pi-coding-agent";
import { THOUGHT_LABEL_PREFIX, THOUGHTS_CUSTOM_TYPE, ThoughtAnchor } from "../types.ts";

export function registerThoughtSwitch(pi: ExtensionAPI): void {
  pi.registerCommand("thought:switch", {
    description: "Switch to a thought thread (works across sessions and directories)",
    handler: async (args, ctx) => {
      // No arg → show picker from all threads
      let targetSlug = args as string | undefined;

      if (!targetSlug) {
        const allSessions = await SessionManager.listAll();
        const threads: Array<{ slug: string; displayName: string; file: string }> = [];

        for (const session of allSessions) {
          try {
            const sm = await SessionManager.open(session.file);
            const entries = sm.getEntries();

            for (const entry of entries) {
              if (entry.type === "label") {
                const label = (entry as any).label;
                if (label?.startsWith(THOUGHT_LABEL_PREFIX)) {
                  const slug = label.substring(THOUGHT_LABEL_PREFIX.length);
                  if (!threads.some((t) => t.slug === slug)) {
                    const startEntry = entries.find(
                      (e) =>
                        e.type === "custom" &&
                        (e as any).customType === THOUGHTS_CUSTOM_TYPE &&
                        (e as any).data?.kind === "start" &&
                        ((e as any).data as ThoughtAnchor).name === slug
                    );
                    const displayName = startEntry
                      ? ((startEntry as any).data as ThoughtAnchor).displayName
                      : slug;
                    threads.push({ slug, displayName, file: session.file });
                  }
                }
              }
            }
          } catch {
            // Skip
          }
        }

        if (threads.length === 0) {
          ctx.ui.notify("No thought threads found. Start one with /thought:start", "info");
          return;
        }

        const choice = await ctx.ui.select(
          "Switch to thought:",
          threads.map((t) => `${t.displayName}  (${t.slug})`)
        );
        if (!choice) return;

        const picked = threads.find((t) => choice.includes(t.slug));
        if (!picked) return;

        await ctx.switchSession(picked.file);
        return;
      }

      // Slug provided → find matching session
      const allSessions = await SessionManager.listAll();
      const candidates: Array<{ file: string }> = [];

      for (const session of allSessions) {
        try {
          const sm = await SessionManager.open(session.file);
          const entries = sm.getEntries();

          for (const entry of entries) {
            if (
              entry.type === "label" &&
              (entry as any).label === `${THOUGHT_LABEL_PREFIX}${targetSlug}`
            ) {
              candidates.push({ file: session.file });
              break;
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

      let targetFile = candidates[0].file;

      if (candidates.length > 1) {
        const choice = await ctx.ui.select(
          "Multiple sessions found. Pick one:",
          candidates.map((c) => c.file)
        );
        if (!choice) return;
        targetFile = choice;
      }

      await ctx.switchSession(targetFile);
    },
  });
}
