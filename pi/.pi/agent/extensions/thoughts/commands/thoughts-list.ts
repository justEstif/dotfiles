/**
 * /thoughts — List all thought threads from the index
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readIndex } from "../lib/index-file.ts";

export function registerThoughtsList(pi: ExtensionAPI): void {
  pi.registerCommand("thoughts", {
    description: "List all thought threads",
    handler: async (_args, ctx) => {
      const threads = readIndex();

      if (threads.length === 0) {
        ctx.ui.notify("No thought threads yet. Start one with /thoughts:start", "info");
        return;
      }

      let output = "Thought Threads:\n\n";
      for (const thread of threads) {
        const age = Math.round((Date.now() - thread.updatedAt) / 60000);
        const ageStr = age < 1 ? "just now" : age < 60 ? `${age}m ago` : `${Math.round(age / 60)}h ago`;
        output += `  ${thread.displayName}\n`;
        output += `    slug: ${thread.slug}\n`;
        output += `    cwd:  ${thread.cwd}\n`;
        output += `    last: ${ageStr}\n\n`;
      }

      ctx.ui.notify(output, "info");
    },
  });
}
