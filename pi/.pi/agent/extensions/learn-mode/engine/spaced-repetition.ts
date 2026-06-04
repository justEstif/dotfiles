/**
 * Spaced repetition engine — SM-2-lite, revised for encoding checks.
 *
 * Schedules *encoding checks* (connection questions, comparison prompts)
 * instead of fact reviews. The goal is to strengthen relational understanding
 * at increasing intervals, not to re-memorize facts.
 *
 * Intervals: 1 day, 7 days, 30 days (Cepeda et al., 2006)
 * Confidence adjusts ease factor and thus interval length.
 *
 * What gets scheduled:
 *   - "How does X relate to Y?" (relational check)
 *   - "Compare X and Z — what's the key difference?" (analysis check)
 *   - "Why does X work this way?" (deep encoding check)
 *   - NOT "What is X?" (recall check — that's Bloom's 1)
 */

import type {
  ConfidenceRating,
  ConceptMastery,
  EncodingDepth,
} from "./types.js";
import { ENCODING_DEPTH_ORDER } from "./types.js";

const INTERVALS = {
  day: 1 * 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
};

const BASE_EASE = 2.5;
const MIN_EASE = 1.3;

/** Create a new concept record (surface encoding, not yet reviewed). */
export function createConcept(
  id: string,
  label: string,
  prerequisites: string[] = [],
  tags: string[] = [],
): ConceptMastery {
  return {
    id,
    label,
    encodingDepth: "surface",
    connections: [],
    easeFactor: BASE_EASE,
    repetitions: 0,
    nextReview: 0,
    avgConfidence: 0,
    prerequisites,
    tags,
  };
}

/**
 * Record an encoding check result and update depth + scheduling.
 *
 * High confidence (3) + passing → depth advances, ease increases
 * Medium confidence (2) + passing → depth stays, normal scheduling
 * Low confidence (1) or failing → depth may regress, ease decreases, re-check soon
 */
export function recordReview(
  concept: ConceptMastery,
  confidence: ConfidenceRating,
  passed: boolean = true,
  now: number = Date.now(),
): ConceptMastery {
  const updated = { ...concept, lastReview: now };

  // Update running average confidence
  const totalReviews = concept.repetitions + 1;
  updated.avgConfidence =
    (concept.avgConfidence * concept.repetitions + confidence) / totalReviews;

  // Adjust ease factor
  const easeDelta = confidence >= 3 ? 0.15 : confidence <= 1 ? -0.25 : 0;
  updated.easeFactor = Math.max(MIN_EASE, concept.easeFactor + easeDelta);

  if (!passed || confidence < 2) {
    // Failed or low confidence — regress depth, re-check soon
    updated.repetitions = 0;
    updated.nextReview = now + INTERVALS.day;
    updated.encodingDepth = regressDepth(concept.encodingDepth);
  } else {
    updated.repetitions = concept.repetitions + 1;
    updated.nextReview = calculateInterval(
      updated.repetitions,
      updated.easeFactor,
      now,
    );
    // High confidence + passing → advance depth
    if (confidence >= 3) {
      updated.encodingDepth = advanceDepth(concept.encodingDepth);
    }
  }

  return updated;
}

/**
 * Get concepts due for an encoding check.
 * Only includes concepts that have been introduced (not surface-only with no review).
 */
export function getDueConcepts(
  concepts: Record<string, ConceptMastery>,
  now: number = Date.now(),
): ConceptMastery[] {
  return Object.values(concepts).filter(
    (c) =>
      c.encodingDepth !== "surface" &&
      c.nextReview > 0 &&
      c.nextReview <= now &&
      // Don't re-check transferable concepts too often
      !(c.encodingDepth === "transferable" && c.repetitions > 10),
  );
}

/**
 * Get the next review label (human-readable).
 */
export function getNextReviewLabel(concept: ConceptMastery): string {
  if (concept.encodingDepth === "surface" && concept.repetitions === 0)
    return "not yet introduced";
  if (concept.encodingDepth === "transferable" && concept.repetitions > 10)
    return "deeply encoded";
  if (concept.nextReview === 0) return "pending first check";

  const now = Date.now();
  const diff = concept.nextReview - now;
  if (diff <= 0) return "due now";

  const hours = Math.floor(diff / (60 * 60 * 1000));
  if (hours < 24) return `in ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `in ${days}d`;
  const weeks = Math.floor(days / 7);
  return `in ${weeks}w`;
}

// ── Internals ──────────────────────────────────────────────────

function calculateInterval(
  repetitions: number,
  easeFactor: number,
  now: number,
): number {
  let baseInterval: number;
  if (repetitions <= 1) {
    baseInterval = INTERVALS.day;
  } else if (repetitions <= 3) {
    baseInterval = INTERVALS.week;
  } else {
    baseInterval = INTERVALS.month;
  }

  const adjustedInterval = Math.round(baseInterval * (easeFactor / BASE_EASE));
  return now + adjustedInterval;
}

function advanceDepth(current: EncodingDepth): EncodingDepth {
  const idx = ENCODING_DEPTH_ORDER.indexOf(current);
  if (idx < ENCODING_DEPTH_ORDER.length - 1) {
    return ENCODING_DEPTH_ORDER[idx + 1];
  }
  return current; // already at max
}

function regressDepth(current: EncodingDepth): EncodingDepth {
  const idx = ENCODING_DEPTH_ORDER.indexOf(current);
  if (idx > 0) {
    return ENCODING_DEPTH_ORDER[idx - 1];
  }
  return current; // already at min
}
