/**
 * thoughts extension: track named thought threads across sessions
 *
 * Commands:  /thought:start  /thought:label  /thought:status
 *            /thoughts  /thought:resume  /thought:view  /thought:end
 * Tool:      thought_recall
 * Hooks:     turn_end  input  session_before_tree
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// Commands
import { registerThoughtStart } from "./commands/thought-start.ts";
import { registerThoughtLabel } from "./commands/thought-label.ts";
import { registerThoughtStatus } from "./commands/thought-status.ts";
import { registerThoughts } from "./commands/thoughts.ts";
import { registerThoughtResume } from "./commands/thought-resume.ts";
import { registerThoughtView } from "./commands/thought-view.ts";
import { registerThoughtEnd } from "./commands/thought-end.ts";

// Tool
import { registerThoughtRecall } from "./lib/tool-recall.ts";

// Hooks
import { registerHooks } from "./lib/hooks.ts";

export default function (pi: ExtensionAPI) {
  registerThoughtRecall(pi);
  registerThoughtStart(pi);
  registerThoughtLabel(pi);
  registerThoughtStatus(pi);
  registerThoughts(pi);
  registerThoughtResume(pi);
  registerThoughtView(pi);
  registerThoughtEnd(pi);
  registerHooks(pi);
}
