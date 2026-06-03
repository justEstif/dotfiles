/**
 * thoughts-v2 extension: unified thinking modes + named thought threads
 *
 * Commands: /think [mode]           — set or display thinking mode
 *           /thoughts:start <name>  — start a thought thread (M2)
 *           /thoughts:switch        — switch between threads (M2)
 * Tools:    set_thinking_mode       — LLM-controlled mode activation
 *           thought_recall          — recover anchor text after compaction (M2)
 * Hooks:    before_agent_start      — inject active mode reference
 *           turn_end                — background summary (M2)
 *           input                   — thread prefix routing (M2)
 *           session_before_tree     — auto-label branches (M2)
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import { registerThinkCommand } from "./commands/think.ts";
import { registerSetThinkingMode } from "./tools/set-thinking-mode.ts";
import { registerModeInjector } from "./modes/injector.ts";

export default function (pi: ExtensionAPI) {
  // M0: Skeleton
  registerThinkCommand(pi);
  registerSetThinkingMode(pi);
  registerModeInjector(pi);
}
