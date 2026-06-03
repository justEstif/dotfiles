/**
 * before_agent_start handler: inject active mode reference into system prompt
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { THOUGHTS_CUSTOM_TYPE } from "../types.ts";
import type { ModeChange } from "../types.ts";
import { loadReferenceContent, getModeDefinition, buildRoutingInstruction } from "./registry.ts";

export function registerModeInjector(pi: ExtensionAPI): void {
  // ── Clean up status bar on session shutdown ─────────────────────────────
  pi.on("session_shutdown", async (_event, ctx) => {
    ctx.ui.setStatus("thoughts-v2", "");
  });

  // ── Restore status bar on session load / reload ──────────────────────────
  // Note on compaction resilience: custom entries (type="custom") are
  // session metadata, not messages — they survive compaction natively.
  // The before_agent_start hook re-reads mode_change entries every turn.
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
