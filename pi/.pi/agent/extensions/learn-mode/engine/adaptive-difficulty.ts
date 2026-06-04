/**
 * Adaptive difficulty engine — revised for relational depth.
 *
 * 3-tier model: guided → scaffolded → independent
 *
 * Tiers now control *what kind of relational thinking* is expected:
 *   - guided:     tutor suggests connections ("have you noticed X resembles Y?")
 *   - scaffolded: tutor asks for connections ("how is X related to Y?")
 *   - independent: learner volunteers connections spontaneously
 *
 * Transition rules:
 *   - 3+ consecutive successful encoding checks → tier up
 *   - 2+ consecutive shallow/struggling responses → tier down
 *
 * Reference: Vygotsky's ZPD — optimal challenge is just beyond current ability.
 */

import type { AdaptiveDifficulty, DifficultyTier } from "./types.js";

const TIERS: DifficultyTier[] = ["guided", "scaffolded", "independent"];

const TIER_PROMPT_HINTS: Record<DifficultyTier, string> = {
  guided:
    'GUIDED mode: Suggest connections to the learner. "Have you noticed how X resembles Y?" Offer comparisons: "Here are two approaches — notice the key difference." Provide the relationship, then ask the learner to elaborate on why it matters.',
  scaffolded:
    'SCAFFOLDED mode: Ask the learner to find connections. "How is X related to Y?" "What\'s the key difference between these two approaches?" Guide with questions, not statements. Praise the process of connecting ideas, not just correct answers.',
  independent:
    'INDEPENDENT mode: Expect the learner to volunteer connections and comparisons unprompted. Challenge them to evaluate: "Which approach would you choose for X, and why?" Focus feedback on missed connections and deeper "why" questions.',
};

export const DEFAULT_DIFFICULTY: AdaptiveDifficulty = {
  tier: "scaffolded",
  consecutiveCorrect: 0,
  consecutiveStruggle: 0,
  totalChecks: 0,
  totalCorrect: 0,
};

/** Record a successful encoding check and possibly tier up. */
export function recordCorrect(d: AdaptiveDifficulty): AdaptiveDifficulty {
  const totalChecks = d.totalChecks + 1;
  const totalCorrect = d.totalCorrect + 1;
  const consecutiveCorrect = d.consecutiveCorrect + 1;
  const consecutiveStruggle = 0;

  const tierIndex = TIERS.indexOf(d.tier);
  const shouldTierUp =
    consecutiveCorrect >= 3 && tierIndex < TIERS.length - 1;
  const tier = shouldTierUp ? TIERS[tierIndex + 1] : d.tier;

  return {
    tier,
    consecutiveCorrect: shouldTierUp ? 0 : consecutiveCorrect,
    consecutiveStruggle,
    totalChecks,
    totalCorrect,
  };
}

/** Record a shallow/struggling response and possibly tier down. */
export function recordStruggle(d: AdaptiveDifficulty): AdaptiveDifficulty {
  const totalChecks = d.totalChecks + 1;
  const consecutiveCorrect = 0;
  const consecutiveStruggle = d.consecutiveStruggle + 1;

  const tierIndex = TIERS.indexOf(d.tier);
  const shouldTierDown = consecutiveStruggle >= 2 && tierIndex > 0;
  const tier = shouldTierDown ? TIERS[tierIndex - 1] : d.tier;

  return {
    tier,
    consecutiveCorrect,
    consecutiveStruggle: shouldTierDown ? 0 : consecutiveStruggle,
    totalChecks,
    totalCorrect: d.totalCorrect,
  };
}

/** Get the prompt instruction fragment for the current difficulty tier. */
export function getDifficultyPromptHint(tier: DifficultyTier): string {
  return TIER_PROMPT_HINTS[tier];
}

/** Get all tiers (for settings UI). */
export function getTiers(): DifficultyTier[] {
  return [...TIERS];
}
