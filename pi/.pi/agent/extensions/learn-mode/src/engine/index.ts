/**
 * Learning Science Engine — public facade.
 *
 * Re-exports all engine modules for Bloom's 4-6 learning:
 *   - Encoding depth tracking (replaces mastery levels)
 *   - Connection density (relational learning quality)
 *   - Adaptive difficulty (relational depth, not hint amount)
 *   - Metacognition (connection prompts, not confidence ratings)
 *   - Priming (pre-reading schema activation)
 *   - Concept tracking with prerequisite chains
 */

// Spaced repetition — schedules encoding checks
export {
  createConcept,
  recordReview,
  getDueConcepts,
  getNextReviewLabel,
} from "./spaced-repetition.js";

// Adaptive difficulty — controls relational depth
export {
  recordCorrect,
  recordStruggle,
  getDifficultyPromptHint,
  getTiers,
  DEFAULT_DIFFICULTY,
} from "./adaptive-difficulty.js";

// Concepts — tracking, connections, graph display
export {
  arePrerequisitesMet,
  getNextConcepts,
  addConnection,
  getConnectionDensity,
  getAverageEncodingDepth,
  getSuggestedConnections,
  buildConceptGraph,
  conceptGraphPrompt,
  canUseTerm,
  introduceConcept,
} from "./concepts.js";
export type { ConceptGraphNode } from "./concepts.js";

// Metacognition — connection-focused prompts
export {
  shouldPromptMetacognition,
  markMetacognitionPrompted,
  recordLearnerTurn,
  recordShallowConcept,
  getMetacognitionPromptInstruction,
  DEFAULT_METACOGNITION,
} from "./metacognition.js";

// Priming — pre-reading schema activation
export {
  findRelevantSchemas,
  generatePrimingPrompt,
  markPrimed,
  resetPriming,
  DEFAULT_PRIMING,
} from "./priming.js";

// Types
export type {
  EncodingDepth,
  ConceptConnection,
  ConfidenceRating,
  ConceptMastery,
  DifficultyTier,
  AdaptiveDifficulty,
  MetacognitionState,
  PrimingState,
  LearningAnalytics,
  EncodingCheckResult,
  LearningEngineState,
} from "./types.js";
export { ENCODING_DEPTH_ORDER, ENCODING_DEPTH_WEIGHT } from "./types.js";
