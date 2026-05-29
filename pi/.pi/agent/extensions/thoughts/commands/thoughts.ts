/**
 * /thoughts — List all threads across all working directories
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { SessionManager } from "@earendil-works/pi-coding-agent";
import { THOUGHT_LABEL_PREFIX, THOUGHTS_CUSTOM_TYPE, ThoughtAnchor } from "../types.ts";

interface ThreadInfo {
  name: string;
  displayName: string;
  cwd: string;
  sessionFile: string;
  labelCount: number;
  lastModified: number;
}

export function registerThoughts(pi: ExtensionAPI): void {
  pi.registerCommand("thoughts", {
    description: "List all thought threads across all working directories",
    handler: async (_args, ctx) => {
      const allSessions = await SessionManager.listAll();
      const threadMap = new Map<string, ThreadInfo>();

      for (const session of allSessions) {
        try {
          const sm = await SessionManager.open(session.file);
          const entries = sm.getEntries();

          for (const entry of entries) {
            if (entry.type === "label") {
              const label = (entry as any).label;
              if (label && label.startsWith(THOUGHT_LABEL_PREFIX)) {
                const slug = label.substring(THOUGHT_LABEL_PREFIX.length);
                const timestamp = new Date((entry as any).timestamp).getTime();

                if (!threadMap.has(slug)) {
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

                  threadMap.set(slug, {
                    name: slug,
                    displayName,
                    cwd: sm.getCwd(),
                    sessionFile: session.file,
                    labelCount: 0,
                    lastModified: timestamp,
                  });
                }

                const thread = threadMap.get(slug)!;
                thread.labelCount++;
                thread.lastModified = Math.max(thread.lastModified, timestamp);
              }
            }
          }
        } catch {
          // Skip sessions that fail to open
        }
      }

      if (threadMap.size === 0) {
        ctx.ui.notify("No thought threads found", "info");
        return;
      }

      const threads = Array.from(threadMap.values()).sort(
        (a, b) => b.lastModified - a.lastModified
      );

      let output = "Thought Threads:\n\n";
      for (const thread of threads) {
        const age = Math.round((Date.now() - thread.lastModified) / 60000);
        const ageStr = age < 1 ? "just now" : `${age}m ago`;
        output += `  ${thread.displayName}\n`;
        output += `    slug: ${thread.name}\n`;
        output += `    cwd: ${thread.cwd}\n`;
        output += `    labels: ${thread.labelCount}\n`;
        output += `    modified: ${ageStr}\n\n`;
      }

      ctx.ui.notify(output, "info");
    },
  });
}
