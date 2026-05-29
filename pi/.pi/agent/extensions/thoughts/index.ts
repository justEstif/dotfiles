/**
 * thoughts extension: track named thought threads across sessions
 *
 * Manual:    /thought:start   /thought:switch   /thoughts
 * Automatic: branch labeling on /tree, summary generation each turn
 * Tool:      thought_recall
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import { registerThoughtStart } from "./commands/thought-start.ts";
import { registerThoughtSwitch } from "./commands/thought-switch.ts";
import { registerThoughts } from "./commands/thoughts.ts";
import { registerThoughtRecall } from "./lib/tool-recall.ts";
import { registerHooks } from "./lib/hooks.ts";

export default function (pi: ExtensionAPI) {
  registerThoughtRecall(pi);
  registerThoughtStart(pi);
  registerThoughtSwitch(pi);
  registerThoughts(pi);
  registerHooks(pi);
}
