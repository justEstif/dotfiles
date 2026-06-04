/**
 * Shared helpers for command handlers.
 */

import { detectCurrentLanguage } from "../lib/language.js";
import { detectObviousLearningResource } from "../lib/resource-detection.js";
import type { LearningState } from "../lib/types.js";

export function buildTemplateVars(
  state: LearningState,
  language?: { name: string; fence: string; source: string },
): Record<string, string> {
  const lang = language ?? {
    name: "the current project language",
    fence: "text",
    source: "fallback",
  };
  return {
    goal: state.goal || "(not specified)",
    language: lang.name,
    languageSource: lang.source,
    languageFence: lang.fence,
    editModeActive:
      state.editMode.phase === "act" ||
      state.editMode.phase === "execute" ||
      state.editMode.phase === "apply"
        ? "active"
        : "off",
  };
}

export function buildResourceInfo(
  goal: string | undefined,
): { hasResource: false } | { hasResource: true; vars: { resourceReason: string; resourceList: string } } {
  if (!goal) return { hasResource: false };

  const signal = detectObviousLearningResource(goal);
  if (!signal) return { hasResource: false };

  return {
    hasResource: true,
    vars: {
      resourceReason: signal.reason,
      resourceList: signal.resources.map((r) => `  - ${r}`).join("\n"),
    },
  };
}
