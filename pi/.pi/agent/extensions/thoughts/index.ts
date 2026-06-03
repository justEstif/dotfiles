/**
 * thoughts extension: unified thinking modes + named thought threads
 *
 * Commands: /thoughts:start <name>  — start a thread (auto-detects mode)
 *           /thoughts:switch        — switch between threads
 * Tools:    set_thinking_mode       — LLM-controlled mode activation (+ thread creation)
 *           thought_recall          — recover anchor text after compaction
 * Hooks:    before_agent_start      — inject active mode reference
 *           session_start           — restore status bar
 *           turn_end                — background summary
 *           input                   — thread prefix routing
 *           session_before_tree     — auto-label branches
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import { registerThoughtsStart } from "./commands/thoughts-start.ts";
import { registerThoughtsSwitch } from "./commands/thoughts-switch.ts";
import { registerSetThinkingMode } from "./tools/set-thinking-mode.ts";
import { registerThoughtRecall } from "./tools/thought-recall.ts";
import { registerModeInjector } from "./modes/injector.ts";
import { registerHooks } from "./lib/hooks.ts";

export default function (pi: ExtensionAPI) {
  // Mode + thread system
  registerSetThinkingMode(pi);
  registerModeInjector(pi);

  // Thread commands
  registerThoughtsStart(pi);
  registerThoughtsSwitch(pi);
  registerThoughtRecall(pi);

  // Background hooks
  registerHooks(pi);
}
