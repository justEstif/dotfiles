/**
 * /thought:label [sub-name] — Add a checkpoint within the current thread
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  THOUGHT_LABEL_PREFIX,
  THOUGHTS_CUSTOM_TYPE,
  ThoughtLabel,
  slugify,
  generateAnchorId,
} from "../types.ts";
import { captureSnapshot, findThoughtAncestor } from "../lib/helpers.ts";

export function registerThoughtLabel(pi: ExtensionAPI): void {
  pi.registerCommand("thought:label", {
    description: "Add a checkpoint label within the current thought thread",
    handler: async (args, ctx) => {
      const leafId = ctx.sessionManager.getLeafId();
      if (!leafId) {
        ctx.ui.notify("No session loaded", "error");
        return;
      }

      const ancestor = findThoughtAncestor(ctx, leafId);
      if (!ancestor) {
        ctx.ui.notify("No active thought thread. Run `/thought:start` first.", "error");
        return;
      }

      let subName = args as string | undefined;
      if (!subName) {
        subName = await ctx.ui.input("Enter sub-checkpoint name (optional, can be empty): ");
      }

      const rootSlug = ancestor.label.substring(THOUGHT_LABEL_PREFIX.length);
      const labelSlug = subName ? `${rootSlug}/${slugify(subName)}` : rootSlug;
      const displayName = subName || rootSlug;
      const anchorId = generateAnchorId();
      const snapshot = captureSnapshot(ctx, leafId);

      ctx.sessionManager.appendLabelChange(leafId, `${THOUGHT_LABEL_PREFIX}${labelSlug}`);

      const label: ThoughtLabel = {
        kind: "label",
        anchorId,
        rootId: ancestor.label,
        name: labelSlug,
        displayName,
        snapshot,
        createdAt: Date.now(),
      };

      ctx.sessionManager.appendCustomEntry(THOUGHTS_CUSTOM_TYPE, label);
      ctx.ui.notify(`✓ Label added: "${displayName}" (id: ${anchorId})`, "info");
    },
  });
}
