/**
 * pi-learning-tutor extension: evidence-based learning mode for pi.
 *
 * Commands:  /learn <topic>   — start learning mode
 *            /learn off       — stop
 *            /learn exercise  — build challenge
 *            /learn review    — broad review
 *            /learn define    — definition overlay
 *            /learn act       — scoped code change
 *            /learn status    — show current state
 *
 * Tools:     learning_goal    — LLM-controlled learning purpose
 *
 * Hooks:     before_agent_start — inject learning prompt + engine state
 *            session_start      — restore state
 *            session_shutdown   — cleanup
 *            input              — readiness signals, metacognition tracking
 *            context            — filter internal entries
 *            tool_call          — gate AI edits
 *            agent_end          — cleanup edit modes
 *
 * Architecture: each concern is a module that receives (pi, stateContainer)
 * and registers its own hooks/tools/commands independently.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { StateContainer } from "./lib/state-container.js";
import { log } from "./lib/logger.js";

// Commands
import { registerLearnCommand } from "./commands/learn-command.js";

// Tools
import { registerLearningGoalTool } from "./tools/learning-goal.js";

// Hooks
import { registerInjector } from "./hooks/injector.js";
import { registerHooks } from "./hooks/hooks.js";

export default function learningTutorExtension(pi: ExtensionAPI): void {
  log("init", "extension loading");
  const sc = new StateContainer(pi);

  registerLearnCommand(pi, sc);
  registerLearningGoalTool(pi, sc);
  registerInjector(pi, sc);
  registerHooks(pi, sc);
  log("init", "extension loaded");
}
