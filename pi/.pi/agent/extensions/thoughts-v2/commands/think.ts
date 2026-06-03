/**
 * /think [mode] — Set or display active thinking mode
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { THINKING_MODES, THOUGHTS_CUSTOM_TYPE, isValidMode } from "../types.ts";
import type { ModeChange } from "../types.ts";
import { getModeDefinition, MODE_DEFINITIONS } from "../modes/registry.ts";

export function registerThinkCommand(pi: ExtensionAPI): void {
  pi.registerCommand("think", {
    description: "Set or display active thinking mode (sycophancy | root-ask | grill-me | off)",
    getArgumentCompletions(prefix: string) {
      const modes = [...THINKING_MODES];
      const filtered = modes.filter((m) => m.startsWith(prefix));
      return filtered.length > 0
        ? filtered.map((m) => ({ value: m, label: m }))
        : null;
    },
    handler: async (args, ctx) => {
      const entries = ctx.sessionManager.getEntries();

      // Find current mode
      let currentMode: string | null = null;
      for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i];
        if (
          entry.type === "custom" &&
          (entry as any).customType === THOUGHTS_CUSTOM_TYPE
        ) {
          const data = (entry as any).data as ModeChange;
          if (data.kind === "mode_change") {
            currentMode = data.mode;
            break;
          }
        }
      }

      const arg = (args as string | undefined)?.trim();

      // No arg → show status
      if (!arg) {
        if (!currentMode || currentMode === "off") {
          ctx.ui.notify("No thinking mode active. Usage: /think <sycophancy|root-ask|grill-me|off>", "info");
        } else {
          const def = getModeDefinition(currentMode);
          ctx.ui.notify(`Active: ${def?.label ?? currentMode}`, "info");
        }
        return;
      }

      // Validate
      if (!isValidMode(arg)) {
        ctx.ui.notify(
          `Unknown mode "${arg}". Valid: ${THINKING_MODES.join(", ")}`,
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
        ctx.ui.notify(`Thinking mode: ${def?.label ?? arg}`, "info");
      }
    },
  });
}
