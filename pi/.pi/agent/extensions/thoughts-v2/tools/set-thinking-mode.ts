/**
 * set_thinking_mode tool — let the LLM activate a thinking mode explicitly
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { THOUGHTS_CUSTOM_TYPE } from "../types.ts";
import type { ModeChange } from "../types.ts";
import { getModeDefinition, getModeIds, loadModes } from "../modes/registry.ts";

export function registerSetThinkingMode(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "set_thinking_mode",
    label: "Set Thinking Mode",
    description:
      "Activate a structured thinking mode that changes how you reason about the conversation. " +
      "Use when the user wants to think through something with a specific framework, " +
      "or when you detect thinking-mode keywords (push back, challenge, root cause, grill me, etc.). " +
      "The mode persists across turns and survives compaction.",
    promptSnippet: "Activate or change the active thinking mode",
    promptGuidelines: [
      "Use set_thinking_mode when the user says 'help me think', 'push back', 'challenge', 'grill me', 'root cause', 'behind the request', or similar thinking-mode triggers.",
      "Auto-detect the best mode from the user's intent, but let the user override.",
    ],
    parameters: Type.Object({
      mode: Type.String({
        description:
          "Which thinking mode to activate (e.g. sycophancy, root-ask, grill-me). Use 'off' to disable.",
      }),
      reason: Type.Optional(Type.String({
        description: "Brief explanation of why this mode was chosen (shown to user)",
      })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const mode = params.mode as string;
      const reason = params.reason as string | undefined;

      const validIds = [...getModeIds(), "off"];
      if (!validIds.includes(mode)) {
        const available = loadModes().map((m) => `${m.id}: ${m.description.split(".")[0]}`).join("\n");
        return {
          content: [{ type: "text", text: `Invalid mode: "${mode}". Available modes:\n${available}\noff: disable thinking mode` }],
          isError: true,
        };
      }

      const def = getModeDefinition(mode);

      // Persist mode change as a custom entry
      const modeChange: ModeChange = {
        kind: "mode_change",
        mode,
        changedAt: Date.now(),
      };
      ctx.sessionManager.appendCustomEntry(THOUGHTS_CUSTOM_TYPE, modeChange);

      if (mode === "off") {
        ctx.ui.setStatus("thoughts-v2", "");
        return {
          content: [{ type: "text", text: "Thinking mode disabled." }],
          details: { mode: "off" },
        };
      }

      // Update status bar
      ctx.ui.setStatus("thoughts-v2", `🧠 ${def?.label ?? mode}`);

      const msg = reason
        ? `Thinking mode activated: **${def?.label ?? mode}** — ${reason}\n${def?.description ?? ""}`
        : `Thinking mode activated: **${def?.label ?? mode}**\n${def?.description ?? ""}`;

      return {
        content: [{ type: "text", text: msg }],
        details: { mode, label: def?.label },
      };
    },
  });
}
