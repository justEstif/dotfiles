/**
 * thoughts extension: track named thought threads across sessions
 *
 * Manual:    /thoughts:start   /thoughts:switch
 * Automatic: branch labeling on /tree, summary generation each turn
 * Tool:      thought_recall
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import { registerThoughtsStart } from "./commands/thoughts-start.ts";
import { registerThoughtsSwitch } from "./commands/thoughts-switch.ts";
import { registerThoughtRecall } from "./lib/tool-recall.ts";
import { registerHooks } from "./lib/hooks.ts";

export default function (pi: ExtensionAPI) {
  registerThoughtRecall(pi);
  registerThoughtsStart(pi);
  registerThoughtsSwitch(pi);
  registerHooks(pi);
}
