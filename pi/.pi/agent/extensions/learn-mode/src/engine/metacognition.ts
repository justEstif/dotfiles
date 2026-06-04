/**
 * Metacognition engine — revised for connection-focused prompts.
 *
 * Instead of "how confident are you?" (self-assessment of recall),
 * prompts now target relational thinking:
 *   - "How does X connect to Y?"
 *   - "What's the key difference between X and Y?"
 *   - "If you had to teach this, what insight would you emphasize?"
 *
 * These force encoding at Bloom's 4-6 (analyze, evaluate, create),
 * not Bloom's 1-2 (remember, understand).
 *
 * References:
 *   - Chi et al. (1989): self-explanation protocols → 2x improvement
 *   - Justin Sung: relational learning > isolated learning
 *   - Elaborative interrogation: "why" questions deepen encoding
 */

import type { MetacognitionState } from "./types.js";

/** How many tutor turns between metacognition prompts. Adjusts with difficulty. */
const TURNS_BETWEEN_PROMPTS: Record<string, number> = {
  guided: 4,
  scaffolded: 6,
  independent: 8,
};

export const DEFAULT_METACOGNITION: MetacognitionState = {
  turnsSinceLastPrompt: 0,
  connectionCheckPending: false,
  shallowConcepts: [],
};

/**
 * Should a metacognition (connection) prompt be injected now?
 */
export function shouldPromptMetacognition(
  meta: MetacognitionState,
  difficultyTier: string,
): boolean {
  if (meta.connectionCheckPending) return false;

  const threshold =
    TURNS_BETWEEN_PROMPTS[difficultyTier] ??
    TURNS_BETWEEN_PROMPTS["scaffolded"];

  return meta.turnsSinceLastPrompt >= threshold;
}

/**
 * Record that a metacognition prompt was just given.
 */
export function markMetacognitionPrompted(
  meta: MetacognitionState,
): MetacognitionState {
  return {
    ...meta,
    turnsSinceLastPrompt: 0,
    connectionCheckPending: true,
  };
}

/**
 * Record a learner turn (increment counter, clear pending if answered).
 */
export function recordLearnerTurn(
  meta: MetacognitionState,
  answeredConnectionCheck: boolean = false,
): MetacognitionState {
  return {
    ...meta,
    turnsSinceLastPrompt: meta.turnsSinceLastPrompt + 1,
    connectionCheckPending: answeredConnectionCheck
      ? false
      : meta.connectionCheckPending,
  };
}

/**
 * Record a concept where the learner showed shallow encoding.
 */
export function recordShallowConcept(
  meta: MetacognitionState,
  conceptId: string,
): MetacognitionState {
  if (meta.shallowConcepts.includes(conceptId)) return meta;
  return {
    ...meta,
    shallowConcepts: [...meta.shallowConcepts, conceptId],
  };
}

/**
 * Generate metacognition prompt instructions — now focused on connections
 * and relational thinking, not confidence ratings.
 */
export function getMetacognitionPromptInstruction(
  recentConcepts: string[],
  hasShallowConcepts: boolean,
  suggestedConnection?: { fromLabel: string; toLabel: string },
): string {
  const parts: string[] = [
    "ENCODING CHECK: Before continuing, do one of the following:",
  ];

  if (suggestedConnection) {
    parts.push(
      `- Ask: "How does ${suggestedConnection.fromLabel} relate to ${suggestedConnection.toLabel}? What's the key similarity or difference?" (connection prompt)`,
    );
  } else if (recentConcepts.length > 0) {
    const latest = recentConcepts[recentConcepts.length - 1];
    parts.push(
      `- Ask the learner to explain "${latest}" in their own words, focusing on WHY it works that way — not just WHAT it does. (elaborative self-explanation)`,
    );
  }

  if (hasShallowConcepts) {
    parts.push(
      "- The learner showed shallow encoding on a concept. Ask them to compare it with something they already know well: 'How is [concept] similar to or different from [related concept]?'" ,
    );
  }

  parts.push(
    '- "If you had to teach this to someone, what\'s the one insight you\'d emphasize?" (forces synthesis)',
    "Keep this brief — one short question, don't break the learning flow.",
  );

  return parts.join("\n");
}
