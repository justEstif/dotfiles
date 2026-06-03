/**
 * /thoughts:start [mode] — Begin a new thought thread with optional mode
 * - Mode is optional arg (autocomplete from registry)
 * - Name is always prompted
 * - No mode → auto-detect from prompted name, or LLM picks
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  THOUGHT_LABEL_PREFIX,
  THOUGHTS_CUSTOM_TYPE,
  slugify,
  validateThoughtName,
  generateAnchorId,
} from "../types.ts";
import type { ThoughtAnchor, ModeChange } from "../types.ts";
import { captureSnapshot } from "../lib/helpers.ts";
import { indexThread } from "../lib/index-file.ts";
import { detectMode, getModeDefinition, getModeIds, loadModes } from "../modes/registry.ts";

export function registerThoughtsStart(pi: ExtensionAPI): void {
  pi.registerCommand("thoughts:start", {
    description: "Start a new thought thread (optional mode arg, name prompted)",
    getArgumentCompletions(prefix: string) {
      const items = loadModes().map((m) => ({
        value: m.id,
        label: `${m.id} — ${m.description.split(".")[0]}`,
      }));
      const filtered = items.filter((i) => i.value.startsWith(prefix));
      return filtered.length > 0 ? filtered : null;
    },
    handler: async (args, ctx) => {
      const modeArg = (args as string | undefined)?.trim() || undefined;

      const leafId = ctx.sessionManager.getLeafId();
      if (!leafId) {
        ctx.ui.notify("No session loaded", "error");
        return;
      }

      const sessionFile = ctx.sessionManager.getSessionFile();
      if (!sessionFile) {
        ctx.ui.notify("No session file — run pi with a session to track thoughts", "error");
        return;
      }

      // Validate mode arg if provided
      if (modeArg) {
        const validIds = getModeIds();
        if (!validIds.includes(modeArg)) {
          ctx.ui.notify(`Unknown mode "${modeArg}". Valid: ${validIds.join(", ")}`, "error");
          return;
        }
      }

      // Always prompt for name
      const name = await ctx.ui.input("What's the question or decision you're thinking through?");
      if (!name) {
        ctx.ui.notify("Cancelled", "info");
        return;
      }

      // Validate name
      const validation = validateThoughtName(name);
      if (!validation.valid) {
        ctx.ui.notify(validation.error ?? "Invalid name", "error");
        return;
      }
      if (validation.suggestion) {
        ctx.ui.notify(validation.suggestion, "info");
      }

      const slug = slugify(name);
      const anchorId = generateAnchorId();
      const snapshot = captureSnapshot(ctx, leafId);
      const cwd = ctx.sessionManager.getCwd();
      const now = Date.now();

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

      // Determine mode: explicit arg > auto-detect from name > none (LLM picks)
      const activeMode = modeArg || detectMode(name);
      let modeLabel: string | null = null;

      if (activeMode) {
        const modeDef = getModeDefinition(activeMode);
        const modeChange: ModeChange = {
          kind: "mode_change",
          mode: activeMode,
          changedAt: now,
        };
        ctx.sessionManager.appendCustomEntry(THOUGHTS_CUSTOM_TYPE, modeChange);
        modeLabel = modeDef?.label ?? activeMode;

        ctx.ui.setStatus("thoughts", `🧠 ${modeLabel} · ${slug}`);
        ctx.ui.notify(`✓ Thought started: "${name}" with mode: ${modeLabel}`, "info");
      } else {
        ctx.ui.setStatus("thoughts", `💭 ${slug}`);
        ctx.ui.notify(`✓ Thought started: "${name}"`, "info");
      }
    },
  });
}
