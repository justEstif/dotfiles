/**
 * Priming engine — pre-reading schema activation.
 *
 * Before the learner reads new content, activate prior knowledge:
 *   - Scan headings/titles to predict what's coming
 *   - Identify relevant concepts the learner already knows
 *   - Form hypotheses about how new content relates to existing knowledge
 *
 * This is Justin Sung's "priming" step — it creates mental scaffolding
 * that makes encoding during reading much more effective.
 *
 * Reference: priming activates prior knowledge schemas, making new information
 * easier to encode relationally rather than in isolation.
 */

import type { ConceptMastery, PrimingState } from "./types.js";

export const DEFAULT_PRIMING: PrimingState = {
  isPrimed: false,
  predictions: [],
  activatedSchemas: [],
};

/**
 * Find concepts in the learner's existing knowledge that are relevant
 * to a new topic or section title. Used to activate schemas before reading.
 */
export function findRelevantSchemas(
  topic: string,
  concepts: Record<string, ConceptMastery>,
  maxResults: number = 3,
): ConceptMastery[] {
  const introduced = Object.values(concepts).filter(
    (c) => c.encodingDepth !== "surface" || c.repetitions > 0,
  );
  if (introduced.length === 0) return [];

  // Simple keyword matching — split topic into words and match against labels/tags
  const topicWords = topic.toLowerCase().split(/\s+/);
  const scored = introduced.map((c) => {
    const label = c.label.toLowerCase();
    const tags = c.tags.map((t) => t.toLowerCase());
    const id = c.id.toLowerCase();

    let score = 0;
    for (const word of topicWords) {
      if (word.length < 3) continue;
      if (label.includes(word)) score += 3;
      if (tags.some((t) => t.includes(word))) score += 2;
      if (id.includes(word)) score += 1;
      // Check prerequisites chain — concepts that depend on this topic
      if (c.prerequisites.some((p) => p.toLowerCase().includes(word))) score += 2;
    }

    return { concept: c, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((s) => s.concept);
}

/**
 * Generate a priming prompt — activates prior knowledge before reading.
 */
export function generatePrimingPrompt(
  topic: string,
  relevantSchemas: ConceptMastery[],
): string {
  const parts: string[] = [];

  parts.push(`PRIMING: Before diving into "${topic}", activate your existing knowledge.`);

  if (relevantSchemas.length > 0) {
    const schemaLabels = relevantSchemas.map((c) => c.label).join(", ");
    parts.push(
      `You already know about: ${schemaLabels}.`,
      `How do you think "${topic}" relates to what you already know?`,
    );
  } else {
    parts.push(
      `Scan the headings and key terms. What do you predict this will cover?`,
      `What do you already know that might be relevant?`,
    );
  }

  parts.push(
    "Form a quick hypothesis — you'll encode better if you have a mental model before reading.",
  );

  return parts.join(" ");
}

/**
 * Mark that priming has been done for the current topic.
 */
export function markPrimed(
  priming: PrimingState,
  predictions: string[],
  activatedSchemas: string[],
): PrimingState {
  return {
    isPrimed: true,
    predictions,
    activatedSchemas,
    primedAt: Date.now(),
  };
}

/**
 * Reset priming state (e.g., when topic changes).
 */
export function resetPriming(): PrimingState {
  return { ...DEFAULT_PRIMING };
}
