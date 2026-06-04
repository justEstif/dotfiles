export type EditModeState =
  | { phase: "off" }
  | { phase: "act"; request: string; startedAt: number }
  // Legacy phases kept so restored sessions from older versions can be reset safely.
  | { phase: "execute"; request: string; startedAt: number }
  | { phase: "draft"; request: string; startedAt: number }
  | { phase: "awaiting-approval"; request: string; startedAt: number }
  | { phase: "apply"; request: string; startedAt: number };

export interface ExerciseRecord {
  topic?: string;
  createdAt: number;
}

export interface LearningState {
  active: boolean;
  goal?: string;
  currentStep?: string;
  workingGoal?: string;
  relevantFiles: string[];
  reviewedDiffRefs: string[];
  lastLearnerSignal?: string;
  exercisesGiven: ExerciseRecord[];
  progressNotes: string[];
  editMode: EditModeState;
  updatedAt: number;

  // Phase 2R: Encoding-depth engine (Bloom's 4-6)
  concepts: Record<string, import("../engine/types.js").ConceptMastery>;
  conceptConnections: import("../engine/types.js").ConceptConnection[];
  difficulty: import("../engine/types.js").AdaptiveDifficulty;
  metacognition: import("../engine/types.js").MetacognitionState;
  priming: import("../engine/types.js").PrimingState;
  analytics: import("../engine/types.js").LearningAnalytics;
}

/** User preferences — persisted globally, not per-session. */
export interface LearningPreferences {
  /** How the learner prefers to learn. */
  style: "reading" | "exercise" | "mixed";
  /** How often to inject encoding checks (in tutor turns). */
  checkFrequency: number;
  /** Starting scaffolding level. */
  scaffoldingLevel: "guided" | "scaffolded" | "independent";
  /** Whether to prime before reading new content. */
  primingEnabled: boolean;
  /** Whether to show the concept graph widget. */
  showConceptWidget: boolean;
}

export const DEFAULT_PREFERENCES: LearningPreferences = {
  style: "reading",
  checkFrequency: 6,
  scaffoldingLevel: "scaffolded",
  primingEnabled: true,
  showConceptWidget: true,
};

export interface LanguageHint {
  name: string;
  fence: string;
  source: string;
}

export interface CommentSyntax {
  line: string[];
  block: Array<{ start: string; end: string }>;
  backtickStrings?: boolean;
}
