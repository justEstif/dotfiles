/**
 * Event hooks: session_start, session_shutdown, input, context,
 * tool_call, agent_end.
 */

import {
  isToolCallEventType,
  type ExtensionAPI,
  type ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import {
  installSelectionDefineSupport,
  uninstallSelectionDefineSupport,
} from "../lib/definition.js";
import { recordLearnerTurn } from "../engine/index.js";
import { renderPrompt } from "../lib/prompts.js";
import {
  saveToIndex,
  loadFromIndex,
} from "../lib/persistence.js";
import { CONTEXT_CUSTOM_TYPE, sendAsUser } from "../lib/state.js";
import type { StateContainer } from "../lib/state-container.js";
import { extractLearningSummary } from "../lib/summary.js";
import {
  READINESS_RE,
  isCommentOnlyEdit,
  isCommentOnlyWrite,
  isProbablyReadOnlyBash,
  userRequestedCommentEdit,
} from "../lib/tool-gates.js";

export function registerHooks(pi: ExtensionAPI, sc: StateContainer): void {
  // ── session_start ──────────────────────────────────────────────

  pi.on("session_start", async (_event, ctx) => {
    // Clean up previous selection support
    uninstallSelectionDefineSupport(ctx, sc.selectionSupport);
    sc.selectionSupport = undefined;

    // Restore state from session entries
    sc.restore(ctx);

    // Merge in cross-session persistence data (concepts, difficulty, metacognition, connections)
    if (sc.state.goal) {
      const persisted = loadFromIndex(sc.state.goal);
      if (persisted) {
        // Merge persisted concepts into restored state (persisted wins for encoding depth)
        sc.state = {
          ...sc.state,
          concepts: persisted.concepts
            ? { ...persisted.concepts, ...sc.state.concepts }
            : sc.state.concepts,
          conceptConnections: persisted.conceptConnections
            ? [...persisted.conceptConnections, ...sc.state.conceptConnections]
            : sc.state.conceptConnections,
          difficulty: persisted.difficulty ?? sc.state.difficulty,
          metacognition: persisted.metacognition
            ? { ...persisted.metacognition, ...sc.state.metacognition }
            : sc.state.metacognition,
        };
      }
    }

    // Reset legacy edit modes
    if (
      sc.state.editMode.phase === "draft" ||
      sc.state.editMode.phase === "awaiting-approval"
    ) {
      sc.state = { ...sc.state, editMode: { phase: "off" } };
      sc.persist();
    }

    // Re-enable selection support if learning is active
    if (sc.state.active && ctx.hasUI) {
      sc.selectionSupport = installSelectionDefineSupport(ctx, () => sc.state);
    }

    sc.updateStatus(ctx);
  });

  // ── session_shutdown ───────────────────────────────────────────

  pi.on("session_shutdown", async () => {
    // Persist learning state to cross-session index
    if (sc.state.active && sc.state.goal) {
      try {
        saveToIndex(sc.state, process.cwd());
      } catch {
        // Silently fail — persistence is best-effort
      }
    }
    uninstallSelectionDefineSupport(undefined, sc.selectionSupport);
    sc.selectionSupport = undefined;
  });

  // ── input ──────────────────────────────────────────────────────

  pi.on("input", async (event) => {
    if (
      !sc.state.active ||
      event.source === "extension" ||
      event.text.trim().startsWith("/")
    ) {
      return { action: "continue" };
    }

    // Track learner turn for metacognition scheduling
    sc.state.metacognition = recordLearnerTurn(sc.state.metacognition);

    if (READINESS_RE.test(event.text)) {
      sc.state.lastLearnerSignal = event.text.trim();
      sc.persist();
      return {
        action: "transform",
        text: renderPrompt("review-signal", {
          signal: JSON.stringify(event.text),
        }),
      };
    }

    return { action: "continue" };
  });

  // ── turn_end: background summary + cross-session persistence ────

  pi.on("turn_end", async (_event, ctx) => {
    if (!sc.state.active || !sc.state.goal) return;

    // Persist to cross-session index every few turns
    const exerciseCount = sc.state.exercisesGiven.length;
    if (exerciseCount > 0 && exerciseCount % 3 === 0) {
      try {
        saveToIndex(sc.state, ctx.cwd ?? process.cwd());
      } catch {
        // Silently fail — persistence is best-effort
      }
    }

    // Generate heuristic summary for compaction survival
    const entries = ctx.sessionManager.getEntries();
    const lastSummary = entries
      .slice()
      .reverse()
      .find(
        (e: any) =>
          e.type === "custom" &&
          e.customType === "learning-tutor-summary",
      );

    // Skip if a recent summary exists (< 8 entries old)
    if (lastSummary) {
      const lastIdx = entries.indexOf(lastSummary);
      if (entries.length - lastIdx < 8) return;
    }

    try {
      const summary = extractLearningSummary(entries, sc.state);
      sc.pi.appendEntry(
        "learning-tutor-summary",
        { kind: "summary", summary, generatedAt: Date.now() },
      );
    } catch {
      // Silently fail — summaries are optional
    }
  });

  // ── context ────────────────────────────────────────────────────

  pi.on("context", async (event) => {
    const messages = event.messages.filter(
      (message: any) =>
        !(message?.role === "custom" && message.customType === CONTEXT_CUSTOM_TYPE),
    );
    if (messages.length === event.messages.length) return;
    return { messages };
  });

  // ── tool_call ──────────────────────────────────────────────────

  pi.on("tool_call", async (event, ctx) => {
    if (!sc.state.active) return;
    const executing =
      sc.state.editMode.phase === "act" ||
      sc.state.editMode.phase === "execute" ||
      sc.state.editMode.phase === "apply";

    if (isToolCallEventType("bash", event)) {
      if (executing) return;
      const command = event.input.command ?? "";
      if (!isProbablyReadOnlyBash(command)) {
        return {
          block: true,
          reason: `Learning tutor blocked a mutating bash command. Default learning mode is read-only for local changes, but external/research tools are allowed. Use /learn act <request> to run a scoped code change.\nCommand: ${command}`,
        };
      }
      return;
    }

    if (isToolCallEventType("edit", event)) {
      if (executing) return;
      if (userRequestedCommentEdit(ctx) && isCommentOnlyEdit(event.input)) {
        return;
      }
      return {
        block: true,
        reason:
          "Learning tutor blocked AI file edits. The learner should type code changes. User-requested comment-only explanatory edits are allowed; broader edits need /learn act <request>.",
      };
    }

    if (isToolCallEventType("write", event)) {
      if (executing) return;
      if (
        userRequestedCommentEdit(ctx) &&
        isCommentOnlyWrite(ctx.cwd, event.input)
      ) {
        return;
      }
      return {
        block: true,
        reason:
          "Learning tutor blocked AI file writes. The learner should type code changes. User-requested comment-only explanatory edits to existing files are allowed; broader writes need /learn act <request>.",
      };
    }
  });

  // ── agent_end ──────────────────────────────────────────────────

  pi.on("agent_end", async (_event, ctx) => {
    if (!sc.state.active) return;

    if (
      sc.state.editMode.phase === "draft" ||
      sc.state.editMode.phase === "awaiting-approval"
    ) {
      sc.state = { ...sc.state, editMode: { phase: "off" } };
      sc.persist();
      sc.updateStatus(ctx);
      return;
    }

    if (
      sc.state.editMode.phase === "act" ||
      sc.state.editMode.phase === "execute" ||
      sc.state.editMode.phase === "apply"
    ) {
      sc.state = { ...sc.state, editMode: { phase: "off" } };
      sc.persist();
      sc.updateStatus(ctx);
    }
  });
}
