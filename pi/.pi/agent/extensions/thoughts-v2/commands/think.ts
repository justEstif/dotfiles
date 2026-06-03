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
      const items = THINKING_MODES.map((m) => {
        const def = getModeDefinition(m);
        return {
          value: m,
          label: def ? `${m} — ${def.description.split(".")[0]}` : m,
        };
      });
      const filtered = items.filter((i) => i.value.startsWith(prefix));
      return filtered.length > 0 ? filtered : null;
    },
    handler: async (args, ctx) => {
      const currentMode = findActiveMode(ctx);
      const arg = (args as string | undefined)?.trim();

      // No arg → show status
      if (!arg) {
        if (!currentMode || currentMode === "off") {
          const modes = MODE_DEFINITIONS.map((d) => `  ${d.id.padEnd(12)} ${d.description.split(".")[0]}`).join("\n");
          ctx.ui.notify(`No thinking mode active.\n\nAvailable:\n${modes}\n\nUsage: /think <mode>`, "info");
        } else {
          const def = getModeDefinition(currentMode);
          ctx.ui.notify(`${def?.label ?? currentMode}\n${def?.description ?? ""}`, "info");
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
