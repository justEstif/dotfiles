/**
 * /learn command — unified entry point with subcommand dispatch.
 *
 * Subcommands: off, exercise, review, define, act, status
 * Default (no subcommand): treat input as learning topic and start.
 */

import type { ExtensionAPI, ExtensionCommandContext, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { LEARN_SUBCOMMANDS } from "../lib/constants.js";
import type { StateContainer } from "../lib/state-container.js";
import { log } from "../lib/logger.js";
import {
  getConnectionDensity,
  getAverageEncodingDepth,
  getSuggestedConnections,
  getDueConcepts,
  getNextReviewLabel,
} from "../engine/index.js";
import { showDashboard } from "../tui/dashboard/index.js";

export function registerLearnCommand(pi: ExtensionAPI, sc: StateContainer): void {
  pi.registerCommand("learn", {
    description:
      "Learning mode: /learn <topic> | off | exercise [topic] | review [scope] | define [text] | act <request> | status",
    getArgumentCompletions(prefix: string) {
      const subs = LEARN_SUBCOMMANDS.filter((s) => s.startsWith(prefix));
      return subs.map((s) => ({ value: s, label: s }));
    },
    handler: async (args, ctx) => {
      const trimmed = args.trim();
      log("cmd", `handler invoked args=${JSON.stringify(trimmed.slice(0, 80))} active=${sc.state.active}`);

      const subMatch = trimmed.match(/^(\w+)\s*(.*)$/s);
      if (subMatch) {
        const [, sub, subArgs] = subMatch;
        const handler = SUBCOMMAND_MAP[sub.toLowerCase()];
        log("cmd", `matched sub=${sub} hasHandler=${!!handler}`);
        if (handler) {
          try {
            await handler(subArgs, ctx, sc);
          } catch (err) {
            log("cmd", `ERROR in ${sub}: ${err}`);
            throw err;
          }
          return;
        }
      }

      if (!trimmed) {
        ctx.ui.notify(
          "Usage: /learn <topic> | off | exercise | review | define | act | status",
          "warning",
        );
        return;
      }

      await handleStart(trimmed, ctx, sc);
    },
  });

  // Keyboard shortcut: dashboard overlay
  pi.registerShortcut("ctrl+shift+l", {
    description: "Show learning dashboard overlay",
    handler: async (ctx) => {
      if (!sc.state.active) {
        ctx.ui.notify("Learning mode is not active. Start with /learn <topic>.", "info");
        return;
      }
      if (!ctx.hasUI) return;
      await openDashboard(ctx, sc);
    },
  });

  // Keyboard shortcut for define
  pi.registerShortcut("ctrl+shift+d", {
    description: "Define selected/current text in learning overlay fallback",
    handler: async (ctx) => {
      const {
        askModelForDefinition,
        showDefinitionOverlay,
      } = await import("../lib/definition.js");
      const editorText = ctx.ui.getEditorText()?.trim();
      const text =
        editorText ||
        (await ctx.ui.input("Define what word or sentence?", "term to define"))
          ?.trim();
      if (!text) return;
      ctx.ui.notify("Preparing definition overlay...", "info");
      const definition = await askModelForDefinition(ctx, sc.state, text);
      await showDefinitionOverlay(ctx, text, definition);
    },
  });
}

// ── Dashboard ──────────────────────────────────────────────────

async function openDashboard(
  ctx: ExtensionContext,
  sc: StateContainer,
): Promise<void> {
  const result = await showDashboard(ctx, sc);

  // Handle action selection
  if (result) {
    const pi = sc.pi;
    switch (result) {
      case "exercise": {
        sc.state.exercisesGiven.push({ createdAt: Date.now() });
        sc.persist();
        const { renderPrompt } = await import("../lib/prompts.js");
        const prompt = renderPrompt("exercise-request", { topic: "Focus: infer from current context." });
        pi.sendUserMessage(prompt);
        break;
      }
      case "review": {
        const { renderPrompt } = await import("../lib/prompts.js");
        const prompt = renderPrompt("broad-review", { scope: "current learning thread" });
        pi.sendUserMessage(prompt);
        break;
      }
      case "define": {
        const text = await ctx.ui.input("Define what word or sentence?", "term to define");
        if (text?.trim()) {
          const { askModelForDefinition, showDefinitionOverlay } = await import("../lib/definition.js");
          ctx.ui.notify("Preparing definition overlay...", "info");
          const definition = await askModelForDefinition(ctx, sc.state, text.trim());
          await showDefinitionOverlay(ctx, text.trim(), definition);
        }
        break;
      }
      case "status": {
        const goal = sc.state.workingGoal || sc.state.goal || "(not set)";
        const conceptCount = Object.keys(sc.state.concepts).length;
        const connCount = sc.state.conceptConnections.length;
        const density = getConnectionDensity(sc.state.concepts, sc.state.conceptConnections);
        const avgDepth = getAverageEncodingDepth(sc.state.concepts);
        pi.sendUserMessage(
          `[LEARNING STATUS] Goal: ${goal} | Tier: ${sc.state.difficulty.tier} | Concepts: ${conceptCount} | Connections: ${connCount} | Density: ${Math.round(density * 100)}% | Avg depth: ${Math.round(avgDepth * 100)}%`,
        );
        break;
      }
      case "off": {
        sc.state = { ...sc.state, active: false, editMode: { phase: "off" } };
        sc.updateStatus(ctx);
        sc.persist();
        ctx.ui.notify("Learning mode off", "info");
        break;
      }
    }
  }
}

// ── Subcommand handlers ────────────────────────────────────────

type Handler = (
  args: string,
  ctx: ExtensionCommandContext,
  sc: StateContainer,
) => Promise<void>;

async function handleStart(
  args: string,
  ctx: ExtensionCommandContext,
  sc: StateContainer,
): Promise<void> {
  // Show onboarding on first use
  if (ctx.hasUI) {
    const { hasCompletedOnboarding, markOnboardingComplete } = await import("../lib/persistence.js");
    if (!hasCompletedOnboarding()) {
      const { showOnboarding } = await import("../tui/onboarding/index.js");
      await showOnboarding(ctx);
      markOnboardingComplete();
    }
  }

  enableLearning(sc, ctx, args);

  const { renderPrompt } = await import("../lib/prompts.js");
  const { sendAsUser } = await import("../lib/state.js");
  const { buildTemplateVars, buildResourceInfo } = await import("./command-helpers.js");

  const vars = buildTemplateVars(sc.state);
  const resourceInfo = buildResourceInfo(sc.state.goal);

  const sections = ["opening"];
  if (resourceInfo.hasResource) {
    vars.resourceReason = resourceInfo.vars!.resourceReason;
    vars.resourceList = resourceInfo.vars!.resourceList;
    sections.push("resource_following");
  }
  sections.push("context", "instructions");

  const prompt = renderPrompt(
    "start-learning-thread",
    { ...vars, context: args.trim() },
    sections,
  );
  await sendAsUser(sc.pi, ctx, prompt);
}

async function handleOff(
  _args: string,
  ctx: ExtensionCommandContext,
  sc: StateContainer,
): Promise<void> {
  disableLearning(sc, ctx);
  ctx.ui.notify("Learning mode off", "info");
}

async function handleExercise(
  args: string,
  ctx: ExtensionCommandContext,
  sc: StateContainer,
): Promise<void> {
  if (!sc.state.active) {
    ctx.ui.notify(
      "Tip: start learning mode with /learn <anything> for context-aware build challenges.",
      "info",
    );
  }
  const topic = args.trim();
  sc.state.exercisesGiven.push({
    topic: topic || undefined,
    createdAt: Date.now(),
  });
  sc.persist();

  const { renderPrompt } = await import("../lib/prompts.js");
  const { sendAsUser } = await import("../lib/state.js");
  const subject = topic ? `Focus: ${topic}` : "Focus: infer from current context.";
  const prompt = renderPrompt("exercise-request", { topic: subject });
  await sendAsUser(sc.pi, ctx, prompt);
}

async function handleReview(
  args: string,
  ctx: ExtensionCommandContext,
  sc: StateContainer,
): Promise<void> {
  const { renderPrompt } = await import("../lib/prompts.js");
  const { sendAsUser } = await import("../lib/state.js");
  const prompt = renderPrompt("broad-review", {
    scope: args.trim() || "current learning thread",
  });
  await sendAsUser(sc.pi, ctx, prompt);
}

async function handleDefine(
  args: string,
  ctx: ExtensionCommandContext,
  sc: StateContainer,
): Promise<void> {
  const {
    askModelForDefinition,
    showDefinitionOverlay,
    readTextFromClipboard,
  } = await import("../lib/definition.js");

  const explicitText = args.trim();
  const clipboard = explicitText ? undefined : readTextFromClipboard();
  const clipboardText = clipboard?.ok === true ? clipboard.text.trim() : "";
  const text =
    explicitText ||
    clipboardText ||
    (await ctx.ui.input("Define what word or sentence?", "borrow checker"))
      ?.trim();
  if (!text) return;
  if (!explicitText && clipboard && clipboard.ok === false) {
    ctx.ui.notify(`Could not read clipboard: ${clipboard.error}`, "warning");
  }
  ctx.ui.notify("Preparing definition overlay...", "info");
  const definition = await askModelForDefinition(ctx, sc.state, text);
  await showDefinitionOverlay(ctx, text, definition);
}

async function handleAct(
  args: string,
  ctx: ExtensionCommandContext,
  sc: StateContainer,
): Promise<void> {
  if (!sc.state.active) {
    ctx.ui.notify(
      "Act is only available inside learning mode. Start with /learn <anything>.",
      "warning",
    );
    return;
  }

  const request = args.trim();
  if (!request) {
    ctx.ui.notify("Usage: /learn act <request>", "warning");
    return;
  }

  if (!ctx.isIdle()) {
    ctx.ui.notify(
      "Act request will run after the current agent turn finishes.",
      "info",
    );
    await ctx.waitForIdle();
  }

  sc.state.editMode = { phase: "act", request, startedAt: Date.now() };
  sc.persist();
  sc.updateStatus(ctx);
  sc.pi.sendUserMessage(request);
}

async function handleRead(
  args: string,
  ctx: ExtensionCommandContext,
  sc: StateContainer,
): Promise<void> {
  log("read", `enter active=${sc.state.active} args=${JSON.stringify(args.slice(0, 80))}`);

  if (!sc.state.active) {
    log("read", "blocked: learning not active");
    ctx.ui.notify(
      "Start learning mode first with /learn <topic>, then use /learn read <url>.",
      "info",
    );
    return;
  }

  const input = args.trim();
  if (!input) {
    log("read", "blocked: empty input");
    ctx.ui.notify("Usage: /learn read <url_or_title>", "warning");
    return;
  }

  log("read", `hasUI=${ctx.hasUI}`);
  if (!ctx.hasUI) {
    log("read", "blocked: no TUI");
    ctx.ui.notify("Reading companion requires a TUI.", "warning");
    return;
  }

  // Extract title from URL or use input as-is
  let title = input;
  let source = input;
  try {
    const url = new URL(input);
    title = url.pathname.split("/").filter(Boolean).pop() || url.hostname;
    source = input;
    log("read", `parsed URL title=${title}`);
  } catch {
    log("read", `not a URL, using as title`);
  }

  log("read", `showing companion overlay title=${title}`);
  try {
    const { showReadingCompanion } = await import("../tui/reading-companion/index.js");
    await showReadingCompanion(ctx, sc, title, source);
    log("read", "overlay done");
  } catch (err) {
    log("read", `ERROR showReadingCompanion: ${err}`);
    throw err;
  }

  // Inject reading-companion prompt into system prompt
  const { renderPrompt } = await import("../lib/prompts.js");
  const { sendAsUser } = await import("../lib/state.js");
  const { findRelevantSchemas } = await import("../engine/index.js");

  const relevantSchemas = findRelevantSchemas(title, sc.state.concepts);
  const priorConcepts = relevantSchemas.map((c) => c.label).join(", ") || "(none)";

  const prompt = renderPrompt("reading-companion", {
    resourceTitle: title,
    resourceSource: source,
    priorConcepts,
    encodingDepth: `${Math.round(getAverageEncodingDepth(sc.state.concepts) * 100)}%`,
  });
  await sendAsUser(sc.pi, ctx, prompt);

  // Track resource read
  sc.state.analytics.resourcesRead.push(source);
  sc.persist();
}

async function handleStatus(
  _args: string,
  ctx: ExtensionCommandContext,
  sc: StateContainer,
): Promise<void> {
  if (!sc.state.active) {
    ctx.ui.notify("Learning mode is not active.", "info");
    return;
  }

  if (!ctx.hasUI) {
    // Fallback: text-based status
    const goal = sc.state.workingGoal || sc.state.goal || "(inferring goal...)";
    ctx.ui.notify(`🎓 Learning: ${goal}`, "info");
    return;
  }

  await openDashboard(ctx, sc);
}

// ── Subcommand dispatch map ────────────────────────────────────

const SUBCOMMAND_MAP: Record<string, Handler> = {
  off: handleOff,
  exercise: handleExercise,
  review: handleReview,
  define: handleDefine,
  act: handleAct,
  read: handleRead,
  settings: handleSettings,
  status: handleStatus,
};

// ── Helpers ────────────────────────────────────────────────────

async function handleSettings(
  _args: string,
  ctx: ExtensionCommandContext,
  _sc: StateContainer,
): Promise<void> {
  if (!ctx.hasUI) {
    ctx.ui.notify("Settings requires a TUI.", "warning");
    return;
  }

  const { showSettingsPanel } = await import("../tui/settings/index.js");
  const result = await showSettingsPanel(ctx);
  if (result) {
    ctx.ui.notify("Learning preferences saved.", "info");
  }
}

function enableLearning(
  sc: StateContainer,
  ctx: ExtensionCommandContext,
  goal: string,
): void {
  const startingContext = goal || sc.state.goal;
  sc.state = {
    ...sc.state,
    active: true,
    goal: startingContext,
    workingGoal: undefined,
    editMode: { phase: "off" },
  };
  enableSelectionSupport(sc, ctx);
  sc.updateStatus(ctx);
  sc.persist();
}

function disableLearning(
  sc: StateContainer,
  ctx: ExtensionCommandContext,
): void {
  sc.state = { ...sc.state, active: false, editMode: { phase: "off" } };
  disableSelectionSupport(sc, ctx);
  sc.updateStatus(ctx);
  sc.persist();
}

async function enableSelectionSupport(
  sc: StateContainer,
  ctx: ExtensionCommandContext,
): Promise<void> {
  if (!ctx.hasUI || sc.selectionSupport) return;
  const { installSelectionDefineSupport } = await import("../lib/definition.js");
  sc.selectionSupport = installSelectionDefineSupport(ctx, () => sc.state);
}

async function disableSelectionSupport(
  sc: StateContainer,
  ctx?: ExtensionCommandContext,
): Promise<void> {
  const { uninstallSelectionDefineSupport } = await import("../lib/definition.js");
  uninstallSelectionDefineSupport(ctx, sc.selectionSupport);
  sc.selectionSupport = undefined;
}
