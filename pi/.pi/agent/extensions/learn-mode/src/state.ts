import type {
  ExtensionAPI,
  ExtensionCommandContext,
  ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import {
  DEFAULT_DIFFICULTY,
  DEFAULT_METACOGNITION,
  DEFAULT_PRIMING,
} from "./engine/index.js";
import type { EditModeState, LearningState } from "./types.js";

export const STATE_ENTRY_TYPE = "learning-tutor-state";
export const CONTEXT_CUSTOM_TYPE = "learning-tutor-context";

export const DEFAULT_STATE: LearningState = {
  active: false,
  goal: undefined,
  currentStep: undefined,
  workingGoal: undefined,
  relevantFiles: [],
  reviewedDiffRefs: [],
  lastLearnerSignal: undefined,
  exercisesGiven: [],
  progressNotes: [],
  editMode: { phase: "off" },
  updatedAt: Date.now(),
  concepts: {},
  conceptConnections: [],
  difficulty: { ...DEFAULT_DIFFICULTY },
  metacognition: { ...DEFAULT_METACOGNITION },
  priming: { ...DEFAULT_PRIMING },
  analytics: {
    conceptsIntroduced: [],
    connectionsMade: [],
    checkResults: [],
    metacognitionPromptsGiven: 0,
    resourcesRead: [],
  },
};

export function cloneState(state: LearningState): LearningState {
  return {
    ...state,
    relevantFiles: [...state.relevantFiles],
    reviewedDiffRefs: [...state.reviewedDiffRefs],
    exercisesGiven: [...state.exercisesGiven],
    progressNotes: [...state.progressNotes],
    editMode: { ...state.editMode } as EditModeState,
    concepts: { ...state.concepts },
    conceptConnections: [...state.conceptConnections],
    difficulty: { ...state.difficulty },
    metacognition: { ...state.metacognition },
    priming: { ...state.priming },
    analytics: {
      conceptsIntroduced: [...state.analytics.conceptsIntroduced],
      connectionsMade: [...state.analytics.connectionsMade],
      checkResults: [...state.analytics.checkResults],
      metacognitionPromptsGiven: state.analytics.metacognitionPromptsGiven,
      resourcesRead: [...state.analytics.resourcesRead],
    },
  };
}

export function restoreState(ctx: ExtensionContext): LearningState {
  const latest = ctx.sessionManager
    .getEntries()
    .filter(
      (entry: any) =>
        entry?.type === "custom" && entry.customType === STATE_ENTRY_TYPE,
    )
    .pop() as { data?: Partial<LearningState> } | undefined;

  if (!latest?.data) return cloneState(DEFAULT_STATE);

  return {
    ...cloneState(DEFAULT_STATE),
    ...latest.data,
    relevantFiles: Array.isArray(latest.data.relevantFiles)
      ? latest.data.relevantFiles
      : [],
    reviewedDiffRefs: Array.isArray(latest.data.reviewedDiffRefs)
      ? latest.data.reviewedDiffRefs
      : [],
    exercisesGiven: Array.isArray(latest.data.exercisesGiven)
      ? latest.data.exercisesGiven
      : [],
    progressNotes: Array.isArray(latest.data.progressNotes)
      ? latest.data.progressNotes
      : [],
    editMode: latest.data.editMode ?? { phase: "off" },
    updatedAt: latest.data.updatedAt ?? Date.now(),
    concepts:
      typeof latest.data.concepts === "object" && latest.data.concepts !== null
        ? { ...latest.data.concepts }
        : {},
    conceptConnections: Array.isArray(latest.data.conceptConnections)
      ? [...latest.data.conceptConnections]
      : [],
    difficulty:
      typeof latest.data.difficulty === "object" &&
      latest.data.difficulty !== null
        ? { ...DEFAULT_DIFFICULTY, ...latest.data.difficulty }
        : { ...DEFAULT_DIFFICULTY },
    metacognition:
      typeof latest.data.metacognition === "object" &&
      latest.data.metacognition !== null
        ? { ...DEFAULT_METACOGNITION, ...latest.data.metacognition }
        : { ...DEFAULT_METACOGNITION },
    priming:
      typeof latest.data.priming === "object" && latest.data.priming !== null
        ? { ...DEFAULT_PRIMING, ...latest.data.priming }
        : { ...DEFAULT_PRIMING },
    analytics:
      typeof latest.data.analytics === "object" &&
      latest.data.analytics !== null
        ? {
            conceptsIntroduced: Array.isArray(
              latest.data.analytics.conceptsIntroduced,
            )
              ? latest.data.analytics.conceptsIntroduced
              : [],
            connectionsMade: Array.isArray(latest.data.analytics.connectionsMade)
              ? latest.data.analytics.connectionsMade
              : [],
            checkResults: Array.isArray(latest.data.analytics.checkResults)
              ? latest.data.analytics.checkResults
              : [],
            metacognitionPromptsGiven:
              latest.data.analytics.metacognitionPromptsGiven ?? 0,
            resourcesRead: Array.isArray(latest.data.analytics.resourcesRead)
              ? latest.data.analytics.resourcesRead
              : [],
          }
        : {
            conceptsIntroduced: [],
            connectionsMade: [],
            checkResults: [],
            metacognitionPromptsGiven: 0,
            resourcesRead: [],
          },
  };
}

export function updateStatus(
  ctx: ExtensionContext,
  state: LearningState,
): void {
  if (!state.active) {
    ctx.ui.setStatus("learning-tutor", undefined);
    ctx.ui.setWidget("learning-tutor", undefined);
    return;
  }

  const phase =
    state.editMode.phase === "off"
      ? "encoding"
      : state.editMode.phase === "act" ||
          state.editMode.phase === "execute" ||
          state.editMode.phase === "apply"
        ? "act mode"
        : "encoding";
  ctx.ui.setStatus(
    "learning-tutor",
    ctx.ui.theme.fg("warning", `🎓 ${phase}`),
  );

  const conceptCount = Object.keys(state.concepts).length;
  const connCount = state.conceptConnections.length;
  const learningPurpose = state.workingGoal?.trim();

  // Build mini concept graph (top 5 non-surface concepts)
  const activeConcepts = Object.values(state.concepts)
    .filter((c) => c.encodingDepth !== "surface" || c.repetitions > 0)
    .sort((a, b) => {
      const depthOrder = ["surface", "relational", "deep", "transferable"];
      return depthOrder.indexOf(b.encodingDepth) - depthOrder.indexOf(a.encodingDepth);
    })
    .slice(0, 5);

  const depthSymbol: Record<string, string> = {
    surface: "○",
    relational: "◐",
    deep: "◑",
    transferable: "●",
  };
  const depthColor: Record<string, "dim" | "muted" | "success" | "warning"> = {
    surface: "dim",
    relational: "muted",
    deep: "success",
    transferable: "warning",
  };

  const graphLine = activeConcepts.length > 0
    ? activeConcepts
            .map((c) => ctx.ui.theme.fg(depthColor[c.encodingDepth], `${depthSymbol[c.encodingDepth]}${c.label}`))
            .join(ctx.ui.theme.fg("dim", " · "))
    : ctx.ui.theme.fg("dim", "no concepts yet");

  ctx.ui.setWidget("learning-tutor", [
    ctx.ui.theme.fg("accent", `🎓 ${state.difficulty.tier} │ ${conceptCount} concepts │ ${connCount} connections`),
    graphLine,
    ctx.ui.theme.fg(
      "muted",
      `${
        learningPurpose
          ? learningPurpose.slice(0, 100)
          : "inferring the why-level goal..."
      }`,
    ),
    ctx.ui.theme.fg(
      "dim",
      "ctrl+shift+l = dashboard | ctrl+shift+d = define | /learn settings",
    ),
  ]);
}

export function persist(pi: ExtensionAPI, state: LearningState): void {
  state.updatedAt = Date.now();
  pi.appendEntry(STATE_ENTRY_TYPE, cloneState(state));
}

export async function sendAsUser(
  pi: ExtensionAPI,
  ctx: ExtensionCommandContext,
  message: string,
): Promise<void> {
  if (ctx.isIdle()) {
    pi.sendUserMessage(message);
  } else {
    pi.sendUserMessage(message, { deliverAs: "followUp" });
    ctx.ui.notify("Learning tutor request queued as a follow-up", "info");
  }
}
