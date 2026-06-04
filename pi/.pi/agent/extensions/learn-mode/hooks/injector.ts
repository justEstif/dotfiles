/**
 * before_agent_start handler: inject active learning prompt into system prompt.
 *
 * Builds the system prompt from YAML templates, injecting:
 * - Concept graph (encoding depth + connections)
 * - Difficulty tier, metacognition, due encoding checks
 * - Suggested connections (relational learning prompts)
 * - Resource-following / reading-companion mode
 * - Act mode state
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  conceptGraphPrompt,
  getDifficultyPromptHint,
  getDueConcepts,
  getSuggestedConnections,
  shouldPromptMetacognition,
  markMetacognitionPrompted,
  getMetacognitionPromptInstruction,
  getAverageEncodingDepth,
} from "../src/engine/index.js";
import { detectCurrentLanguage } from "../src/language.js";
import { renderPrompt } from "../src/prompts.js";
import type { StateContainer } from "../src/state-container.js";
import { buildTemplateVars, buildResourceInfo } from "../commands/command-helpers.js";

export function registerInjector(pi: ExtensionAPI, sc: StateContainer): void {
  pi.on("before_agent_start", async (event, ctx) => {
    if (!sc.state.active) return;

    const language = detectCurrentLanguage(ctx.cwd);
    const vars = buildTemplateVars(sc.state, language);
    const resourceInfo = buildResourceInfo(sc.state.goal);

    // Concept graph (encoding depth + connections)
    const graphText = conceptGraphPrompt(
      sc.state.concepts,
      sc.state.conceptConnections,
    );
    vars.conceptGraph = graphText || "No concepts introduced yet.";

    // Suggested connections (unconnected concept pairs)
    const suggestions = getSuggestedConnections(
      sc.state.concepts,
      sc.state.conceptConnections,
    );
    if (suggestions.length > 0) {
      vars.suggestedConnections =
        "Suggested connections to explore:\n" +
        suggestions
          .map((s) => `- "${s.fromLabel}" ↔ "${s.toLabel}"`)
          .join("\n");
    } else {
      vars.suggestedConnections = "";
    }

    // Difficulty tier
    vars.difficultyTier = sc.state.difficulty.tier;
    vars.difficultyPrompt = getDifficultyPromptHint(sc.state.difficulty.tier);

    // Metacognition (connection-focused)
    const shouldMeta = shouldPromptMetacognition(
      sc.state.metacognition,
      sc.state.difficulty.tier,
    );
    if (shouldMeta) {
      const suggested = suggestions[0];
      vars.metacognitionInstruction = getMetacognitionPromptInstruction(
        sc.state.analytics.conceptsIntroduced,
        sc.state.metacognition.shallowConcepts.length > 0,
        suggested
          ? { fromLabel: suggested.fromLabel, toLabel: suggested.toLabel }
          : undefined,
      );
      sc.state.metacognition = markMetacognitionPrompted(sc.state.metacognition);
      sc.state.analytics.metacognitionPromptsGiven++;
      sc.persist();
    } else {
      vars.metacognitionInstruction =
        "No metacognition check needed right now. Continue the learning flow.";
    }

    // Due encoding checks (spaced repetition)
    const dueConcepts = getDueConcepts(sc.state.concepts);
    if (dueConcepts.length > 0) {
      vars.dueReviews = dueConcepts
        .map(
          (c) =>
            `- ${c.label} (${c.encodingDepth} encoding, last checked: ${c.lastReview ? new Date(c.lastReview).toLocaleDateString() : "never"})`,
        )
        .join("\n");
    } else {
      vars.dueReviews = "";
    }

    // Build ordered section list
    const sections = [
      "header",
      "role",
      "dynamic_goal_rules",
      "concept_scaffolding",
      "tutor_checks",
      "difficulty",
    ];

    if (shouldMeta) {
      sections.push("metacognition");
    }

    if (resourceInfo.hasResource) {
      vars.resourceReason = resourceInfo.vars!.resourceReason;
      vars.resourceList = resourceInfo.vars!.resourceList;
      sections.push("resource_following");
    }

    sections.push("tools");

    const actActive =
      sc.state.editMode.phase === "act" ||
      sc.state.editMode.phase === "execute" ||
      sc.state.editMode.phase === "apply";
    sections.push(actActive ? "act_active" : "act_off");

    sections.push("response");

    if (dueConcepts.length > 0) {
      sections.push("due_reviews");
    }

    const rendered = renderPrompt("learning-instructions", vars, sections);

    return {
      systemPrompt: `${event.systemPrompt}\n\n${rendered}`,
    };
  });
}
