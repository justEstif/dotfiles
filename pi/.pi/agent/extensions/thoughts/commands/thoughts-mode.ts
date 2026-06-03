/**
 * /thoughts:mode [mode] — Switch thinking mode on the current thread
 * Errors if not in a thread.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { THOUGHTS_CUSTOM_TYPE } from "../types.ts";
import type { ModeChange } from "../types.ts";
import { findThoughtAncestor } from "../lib/helpers.ts";
import { getModeDefinition, getModeIds, loadModes } from "../modes/registry.ts";

export function registerThoughtsMode(pi: ExtensionAPI): void {
  pi.registerCommand("thoughts:mode", {
    description: "Switch thinking mode on the current thread",
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

      // Must be in a thread
      const leafId = ctx.sessionManager.getLeafId();
      const activeThread = leafId ? findThoughtAncestor(ctx, leafId) : null;
      if (!activeThread) {
        ctx.ui.notify("Not in a thread. Use /thoughts:start first.", "error");
        return;
      }

      const threadSlug = activeThread.label.substring("thought:".length);

      // No arg → show current mode + available modes
      if (!modeArg) {
        const currentMode = findActiveMode(ctx);
        if (!currentMode || currentMode === "off") {
          const modes = loadModes().map((d) => `  ${d.id.padEnd(12)} ${d.description.split(".")[0]}`).join("\n");
          ctx.ui.notify(`No mode active on thread "${threadSlug}".\n\nAvailable:\n${modes}`, "info");
        } else {
          const def = getModeDefinition(currentMode);
          ctx.ui.notify(`${def?.label ?? currentMode} on "${threadSlug}"\n${def?.description ?? ""}`, "info");
        }
        return;
      }

      // Validate mode
      const validIds = [...getModeIds(), "off"];
      if (!validIds.includes(modeArg)) {
        ctx.ui.notify(`Unknown mode "${modeArg}". Valid: ${validIds.join(", ")}`, "error");
        return;
      }

      // Persist mode change
      const modeChange: ModeChange = {
        kind: "mode_change",
        mode: modeArg,
        changedAt: Date.now(),
      };
      ctx.sessionManager.appendCustomEntry(THOUGHTS_CUSTOM_TYPE, modeChange);

      if (modeArg === "off") {
        ctx.ui.setStatus("thoughts", `💭 ${threadSlug}`);
        ctx.ui.notify(`Mode disabled on "${threadSlug}".`, "info");
      } else {
        const def = getModeDefinition(modeArg);
        ctx.ui.setStatus("thoughts", `🧠 ${def?.label ?? modeArg} · ${threadSlug}`);
        ctx.ui.notify(`🧠 Mode switched to ${def?.label ?? modeArg} on "${threadSlug}"`, "info");
      }
    },
  });
}

/**
 * Walk custom entries backwards to find the latest mode_change.
 */
function findActiveMode(ctx: any): string | null {
  const entries = ctx.sessionManager.getEntries();
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    if (
      entry.type === "custom" &&
      (entry as any).customType === THOUGHTS_CUSTOM_TYPE
    ) {
      const data = (entry as any).data as ModeChange;
      if (data.kind === "mode_change") {
        return data.mode;
      }
    }
  }
  return null;
}
