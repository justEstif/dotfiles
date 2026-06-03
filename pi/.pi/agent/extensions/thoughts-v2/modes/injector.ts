/**
 * before_agent_start handler: inject active mode reference into system prompt
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { THOUGHTS_CUSTOM_TYPE } from "../types.ts";
import type { ThinkingMode, ModeChange } from "../types.ts";
import { loadReferenceContent, getModeDefinition } from "./registry.ts";

export function registerModeInjector(pi: ExtensionAPI): void {
  // ── Restore status bar on session load / reload ──────────────────────────
  pi.on("session_start", async (_event, ctx) => {
    const mode = findActiveMode(ctx);
    if (mode && mode !== "off") {
      const def = getModeDefinition(mode);
      ctx.ui.setStatus("thoughts-v2", `🧠 ${def?.label ?? mode}`);
    }
  });

  // ── Inject active mode reference into system prompt ──────────────────────
  pi.on("before_agent_start", async (event, ctx) => {
    const activeMode = findActiveMode(ctx);
    if (!activeMode || activeMode === "off") return;

    const content = loadReferenceContent(activeMode);
    if (!content) return;

    const def = getModeDefinition(activeMode);
    const header = `\n\n## Active Thinking Mode: ${def?.label ?? activeMode}\n> Mode is active. Apply these instructions to every response until switched off.\n\n`;
    const routing = buildRoutingInstruction(activeMode);

    return {
      systemPrompt: event.systemPrompt + header + content + "\n\n" + routing,
    };
  });
}

/**
 * Walk custom entries backwards to find the latest mode_change.
 * Returns null if no mode has ever been set.
 */
function findActiveMode(ctx: any): ThinkingMode | null {
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

function buildRoutingInstruction(mode: ThinkingMode): string {
  // Sequencing hint so the model knows when to suggest switching
  if (mode === "root-ask") {
    return "<!-- routing: if investigation reveals a specific plan/design to resolve, suggest switching to grill-me. If it reveals a contested claim, suggest sycophancy. -->";
  }
  if (mode === "grill-me") {
    return "<!-- routing: once all design branches are resolved, mode is complete. Suggest switching off. -->";
  }
  if (mode === "sycophancy") {
    return "<!-- routing: if pushback reveals the real question is wrong, suggest root-ask. If it reveals an unresolved plan, suggest grill-me. -->";
  }
  return "";
}
