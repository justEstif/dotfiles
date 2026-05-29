/**
 * /thoughts:start [name] — Begin a new thought thread
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
import { indexThread } from "../lib/index-file.ts";

export function registerThoughtsStart(pi: ExtensionAPI): void {
  pi.registerCommand("thoughts:start", {
    description: "Start a new thought thread",
    handler: async (args, ctx) => {
      let name = args as string | undefined;

      if (!name) {
        name = await ctx.ui.input("What's the question or decision you're thinking through?");
        if (!name) {
          ctx.ui.notify("Cancelled", "info");
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
      const sessionFile = ctx.sessionManager.getSessionFile();
      const cwd = ctx.sessionManager.getCwd();
      const now = Date.now();

      if (!sessionFile) {
        ctx.ui.notify("No session file — run pi with a session to track thoughts", "error");
        return;
      }

      ctx.sessionManager.appendSessionInfo(name);
      ctx.sessionManager.appendLabelChange(leafId, `${THOUGHT_LABEL_PREFIX}${slug}`);

      const anchor: ThoughtAnchor = {
        kind: "start",
        anchorId,
        name: slug,
        displayName: name,
        snapshot,
        createdAt: now,
      };
      ctx.sessionManager.appendCustomEntry(THOUGHTS_CUSTOM_TYPE, anchor);

      // Write to persistent index
      indexThread({ slug, displayName: name, sessionFile, cwd, createdAt: now, updatedAt: now });

      ctx.ui.notify(`✓ Thought started: "${name}"`, "info");
    },
  });
}
