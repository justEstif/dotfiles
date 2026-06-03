/**
 * /think [mode] — Set or display active thinking mode
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { THOUGHTS_CUSTOM_TYPE } from "../types.ts";
import type { ModeChange } from "../types.ts";
import { getModeDefinition, getModeIds, loadModes } from "../modes/registry.ts";

export function registerThinkCommand(pi: ExtensionAPI): void {
  pi.registerCommand("think", {
    description: "Set or display active thinking mode",
    getArgumentCompletions(prefix: string) {
      const items = [...loadModes().map((m) => ({
        value: m.id,
        label: `${m.id} — ${m.description.split(".")[0]}`,
      })), { value: "off", label: "off — disable thinking mode" }];
      const filtered = items.filter((i) => i.value.startsWith(prefix));
      return filtered.length > 0 ? filtered : null;
    },
    handler: async (args, ctx) => {
      const currentMode = findActiveMode(ctx);
      const arg = (args as string | undefined)?.trim();

      // No arg → show status
      if (!arg) {
        if (!currentMode || currentMode === "off") {
          const modes = loadModes().map((d) => `  ${d.id.padEnd(12)} ${d.description.split(".")[0]}`).join("\n");
          ctx.ui.notify(`No thinking mode active.\n\nAvailable:\n${modes}\n  off          disable\n\nUsage: /think <mode>`, "info");
        } else {
          const def = getModeDefinition(currentMode);
          ctx.ui.notify(`${def?.label ?? currentMode}\n${def?.description ?? ""}`, "info");
        }
        return;
      }

      // Validate
      const validIds = [...getModeIds(), "off"];
      if (!validIds.includes(arg)) {
        ctx.ui.notify(
          `Unknown mode "${arg}". Valid: ${validIds.join(", ")}`,
          "error",
        );
        return;
      }

      // Persist
      const modeChange: ModeChange = {
        kind: "mode_change",
        mode: arg,
        changedAt: Date.now(),
      };
      ctx.sessionManager.appendCustomEntry(THOUGHTS_CUSTOM_TYPE, modeChange);

      if (arg === "off") {
        ctx.ui.setStatus("thoughts-v2", "");
        ctx.ui.notify("Thinking mode disabled.", "info");
      } else {
        const def = getModeDefinition(arg);
        ctx.ui.setStatus("thoughts-v2", `🧠 ${def?.label ?? arg}`);
        ctx.ui.notify(`🧠 ${def?.label ?? arg}\n${def?.description ?? ""}`, "info");
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
