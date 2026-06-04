/**
 * Learning Science Engine — types for encoding-depth tracking,
 * connection density, adaptive difficulty, and metacognition.
 *
 * Philosophy (Bloom's 4-6 focus):
 * - EncodingDepth replaces MasteryLevel — measures understanding quality, not recall strength
 * - Connection tracking: relational learning > isolated facts
 * - Spaced repetition schedules encoding checks, not fact reviews
 * - Difficulty tiers control relational depth, not hint amount
 *
 * References:
 *   - Justin Sung: encoding = where actual learning happens
 *   - Bjork: desirable difficulties strengthen long-term retention
 *   - Bloom's taxonomy: analyze/evaluate/create are where human value concentrates in the AI era
 */

// ── Encoding Depth ─────────────────────────────────────────────

/**
 * How deeply a concept is encoded.
 *   surface        = can recognize the term, basic familiarity
 *   relational     = can compare/contrast with related concepts
 *   deep           = can explain *why* it works, predict behavior in new contexts
 *   transferable   = can apply to novel problems, teach it to others
 */
export type EncodingDepth = "surface" | "relational" | "deep" | "transferable";

/** Ordered depth levels for comparison. */
export const ENCODING_DEPTH_ORDER: EncodingDepth[] = [
  "surface",
  "relational",
  "deep",
  "transferable",
];

/** Numeric weight for each depth level (used in density computation). */
export const ENCODING_DEPTH_WEIGHT: Record<EncodingDepth, number> = {
  surface: 0.25,
  relational: 0.5,
  deep: 0.75,
  transferable: 1.0,
};

// ── Connections ────────────────────────────────────────────────

/**
 * A bidirectional connection between two concepts.
 * Tracks *why* they're related — the learner should articulate this.
 */
export interface ConceptConnection {
  /** One concept ID. */
  from: string;
  /** The other concept ID. */
  to: string;
  /** Why they're related (learner's own articulation or tutor's summary). */
  reason?: string;
  /** When this connection was first made. */
  createdAt: number;
}

// ── Confidence ─────────────────────────────────────────────────

/** Confidence rating the learner gives after an encoding check. */
export type ConfidenceRating = 1 | 2 | 3;

// ── Concept Mastery (revised) ──────────────────────────────────

/**
 * Per-concept state tracking encoding depth and connections.
 * Replaces the old MasteryLevel model.
 */
export interface ConceptMastery {
  /** Normalized concept key, e.g. "rust.borrow_checker" */
  id: string;
  /** Human-readable label, e.g. "Borrow Checker" */
  label: string;
  /** How deeply this concept is encoded. */
  encodingDepth: EncodingDepth;
  /** IDs of concepts this one is connected to (bidirectional). */
  connections: string[];
  /** 0–5 SM-2 ease factor (starts at 2.5). Higher = longer intervals. */
  easeFactor: number;
  /** Successful encoding checks completed. */
  repetitions: number;
  /** Next scheduled encoding check (epoch ms). */
  nextReview: number;
  /** Last encoding check (epoch ms). */
  lastReview?: number;
  /** Running average confidence (1–3). */
  avgConfidence: number;
  /** IDs of prerequisite concepts. */
  prerequisites: string[];
  /** Free-form tags for grouping. */
  tags: string[];
}

// ── Adaptive Difficulty ─────────────────────────────────────────

export type DifficultyTier = "guided" | "scaffolded" | "independent";

/**
 * Tracks learner performance to calibrate difficulty.
 * Tiers now control relational depth, not hint amount:
 *   - guided:     tutor suggests connections ("have you noticed X resembles Y?")
 *   - scaffolded: tutor asks for connections ("how is X related to Y?")
 *   - independent: learner volunteers connections spontaneously
 */
export interface AdaptiveDifficulty {
  tier: DifficultyTier;
  /** Consecutive successful encoding checks. */
  consecutiveCorrect: number;
  /** Consecutive shallow or low-confidence responses. */
  consecutiveStruggle: number;
  /** Total encoding checks attempted. */
  totalChecks: number;
  /** Total successful (depth maintained or improved). */
  totalCorrect: number;
}

// ── Metacognition ───────────────────────────────────────────────

export interface MetacognitionState {
  /** How many tutor turns since last metacognition prompt. */
  turnsSinceLastPrompt: number;
  /** Whether a connection prompt is pending. */
  connectionCheckPending: boolean;
  /** Concepts the learner showed shallow encoding on. */
  shallowConcepts: string[];
}

// ── Learning session analytics ──────────────────────────────────

export interface LearningAnalytics {
  /** Concepts introduced this session. */
  conceptsIntroduced: string[];
  /** Connections made this session. */
  connectionsMade: ConceptConnection[];
  /** Encoding check results this session. */
  checkResults: EncodingCheckResult[];
  /** Metacognition prompts given this session. */
  metacognitionPromptsGiven: number;
  /** Articles/resources read this session. */
  resourcesRead: string[];
}

export interface EncodingCheckResult {
  conceptId?: string;
  topic?: string;
  /** Did the learner demonstrate the expected encoding depth? */
  passed: boolean;
  /** What depth was demonstrated. */
  depth: EncodingDepth;
  /** Self-reported confidence. */
  confidence?: ConfidenceRating;
  attemptedAt: number;
}

// ── Priming ─────────────────────────────────────────────────────

/**
 * Tracks priming state for pre-reading schema activation.
 * Before the learner reads new content, the tutor activates prior knowledge.
 */
export interface PrimingState {
  /** Whether the learner has been primed for the current topic/section. */
  isPrimed: boolean;
  /** What the learner predicted/hypothesized before reading. */
  predictions: string[];
  /** Prior concepts identified as relevant. */
  activatedSchemas: string[];
  /** When priming was done. */
  primedAt?: number;
}

// ── State additions for Phase 2R ────────────────────────────────

/**
 * Phase 2R additions to LearningState.
 * These fields are merged into the existing LearningState via the state module.
 */
export interface LearningEngineState {
  /** Per-concept encoding depth tracking. */
  concepts: Record<string, ConceptMastery>;
  /** Bidirectional connections between concepts. */
  conceptConnections: ConceptConnection[];
  /** Adaptive difficulty calibrator. */
  difficulty: AdaptiveDifficulty;
  /** Metacognition tracking. */
  metacognition: MetacognitionState;
  /** Priming state for pre-reading activation. */
  priming: PrimingState;
  /** Session analytics (reset each session). */
  analytics: LearningAnalytics;
}
