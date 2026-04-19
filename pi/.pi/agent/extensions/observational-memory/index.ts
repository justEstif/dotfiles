import type { Model } from "@mariozechner/pi-ai";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

import * as fs from "node:fs";

import { completeSimple } from "@mariozechner/pi-ai";
import {
  convertToLlm,
  serializeConversation,
} from "@mariozechner/pi-coding-agent";

import { DEFAULT_CONFIG, loadConfig, saveConfig } from "./config";
import {
  buildObserverPrompt,
  buildReflectorPrompt,
  getObserverInstructions,
  getReflectorInstructions,
} from "./prompts";
import {
  appendDebugLog,
  getLastObservationAttempt,
  getThreadObservations,
  readResourceMemory,
  writeResourceMemory,
  writeResponseSnapshot,
} from "./storage";
import { updateStatus } from "./status";
import type {
  ObservationAttemptRecord,
  ObservationRecord,
  OmConfig,
  OmRuntimeState,
  ReflectorResult,
  ObserverResult,
} from "./types";

function formatModelId(model: Model<any> | null) {
  return model ? `${model.provider}/${model.id}` : "none";
}

function chooseDefaultModel(
  ctx: any,
  preferred?: string | null,
  fallback?: Model<any> | null,
) {
  const configured = ctx.modelRegistry
    .getAll()
    .filter((m: Model<any>) => ctx.modelRegistry.hasConfiguredAuth(m));

  if (preferred) {
    const exact = configured.find(
      (m: Model<any>) => `${m.provider}/${m.id}` === preferred,
    );
    if (exact) return exact;
  }

  if (fallback) {
    const current = configured.find(
      (m: Model<any>) =>
        m.provider === fallback.provider && m.id === fallback.id,
    );
    if (current) return current;
  }

  return configured[0] || null;
}

function extractRawText(response: any) {
  const chunks: string[] = [];
  const content = Array.isArray(response?.content) ? response.content : [];
  for (const part of content) {
    if (typeof part?.text === "string") chunks.push(part.text);
    if (typeof part?.content === "string") chunks.push(part.content);
  }
  if (typeof response?.text === "string") chunks.push(response.text);
  if (typeof response?.content === "string") chunks.push(response.content);
  return chunks.join("\n").trim();
}

function extractJsonObject(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = (fenced || text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function getUnobservedContext(ctx: any) {
  const branch = ctx.sessionManager.getBranch();

  let lastObservedIndex = -1;
  for (let i = branch.length - 1; i >= 0; i--) {
    const entry = branch[i];
    if (entry.type === "compaction") {
      lastObservedIndex = i;
      break;
    }
    if (entry.type === "custom" && entry.customType === "om-observation") {
      lastObservedIndex = i;
      break;
    }
  }

  const unobservedEntries = branch
    .slice(lastObservedIndex + 1)
    .filter((e: any) => e.type === "message");
  const unobservedMessages = unobservedEntries.map((e: any) => e.message);
  const conversationText = serializeConversation(convertToLlm(unobservedMessages));
  const tokens = conversationText.length / 4;
  return { tokens, unobservedMessages, conversationText };
}

function shouldSkipObservation(branch: any[], config: OmConfig, tokens: number) {
  const lastAttempt = getLastObservationAttempt(branch);
  if (!lastAttempt) return false;
  if (lastAttempt.status === "success") return false;
  const tokenDelta = tokens - lastAttempt.estimatedTokens;
  return tokenDelta < config.observationThreshold * 0.2;
}

async function runObserver(args: {
  ctx: any;
  config: OmConfig;
  model: Model<any>;
  conversationText: string;
}) {
  const { ctx, config, model, conversationText } = args;
  const auth = await ctx.modelRegistry.getApiKeyAndHeaders(model);
  if (!auth.ok) {
    throw new Error(`Observer auth failed for ${formatModelId(model)}`);
  }

  const response = await completeSimple(
    model,
    {
      systemPrompt: getObserverInstructions(),
      messages: [
        {
          role: "user",
          timestamp: Date.now(),
          content: [{ type: "text", text: buildObserverPrompt(conversationText) }],
        },
      ],
    },
    {
      apiKey: auth.apiKey || "",
      headers: auth.headers,
      maxTokens: 4096,
      signal: ctx.signal,
    },
  );

  writeResponseSnapshot(ctx.cwd, config.debug, "om-last-observer-response.json", response);
  const rawText = extractRawText(response);
  const parsed = extractJsonObject(rawText);
  return {
    rawText,
    summary: typeof parsed?.summary === "string" ? parsed.summary.trim() : rawText,
    currentTask:
      typeof parsed?.currentTask === "string" ? parsed.currentTask.trim() : undefined,
    suggestedResponse:
      typeof parsed?.suggestedResponse === "string"
        ? parsed.suggestedResponse.trim()
        : undefined,
  } satisfies ObserverResult;
}

async function runReflector(args: {
  ctx: any;
  config: OmConfig;
  model: Model<any>;
  conversationText: string;
  existingResourceSummary: string;
  existingThreadSummary: string;
  signal?: AbortSignal;
}) {
  const { ctx, config, model, conversationText, existingResourceSummary, existingThreadSummary, signal } = args;
  const auth = await ctx.modelRegistry.getApiKeyAndHeaders(model);
  if (!auth.ok || !auth.apiKey) {
    throw new Error(`Reflector auth failed for ${formatModelId(model)}`);
  }

  const response = await completeSimple(
    model,
    {
      systemPrompt: getReflectorInstructions(),
      messages: [
        {
          role: "user",
          timestamp: Date.now(),
          content: [
            {
              type: "text",
              text: buildReflectorPrompt({
                conversationText,
                existingResourceSummary,
                existingThreadSummary,
              }),
            },
          ],
        },
      ],
    },
    {
      apiKey: auth.apiKey,
      headers: auth.headers,
      maxTokens: 8192,
      signal,
    },
  );

  writeResponseSnapshot(
    ctx.cwd,
    config.debug,
    "om-last-reflector-response.json",
    response,
  );
  const rawText = extractRawText(response);
  const parsed = extractJsonObject(rawText);
  return {
    rawText,
    resourceSummary:
      typeof parsed?.resourceSummary === "string"
        ? parsed.resourceSummary.trim()
        : "",
    threadSummary:
      typeof parsed?.threadSummary === "string"
        ? parsed.threadSummary.trim()
        : rawText,
  } satisfies ReflectorResult;
}

function buildInjectedMemory(ctx: any, config: OmConfig) {
  const branch = ctx.sessionManager.getBranch();
  const threadObservations = getThreadObservations(branch);
  const resourceSummary = readResourceMemory(ctx.cwd, config);

  const parts: string[] = [];
  if (resourceSummary.trim()) {
    parts.push(
      "RESOURCE-SCOPED OBSERVATIONS (Cross-session Project Memory):",
      resourceSummary.trim(),
    );
  }

  if (threadObservations.length > 0) {
    parts.push(
      "THREAD-SCOPED OBSERVATIONS (Current Session Logs):",
      threadObservations.map((entry) => entry.summary).join("\n\n"),
    );
    const latest = threadObservations[threadObservations.length - 1];
    if (latest?.currentTask) parts.push("CURRENT TASK:", latest.currentTask);
    if (latest?.suggestedResponse) {
      parts.push("SUGGESTED CONTINUATION:", latest.suggestedResponse);
    }
  }

  return parts.join("\n\n").trim();
}

export default function (pi: ExtensionAPI) {
  let config = { ...DEFAULT_CONFIG };
  let runtime: OmRuntimeState = {
    observerModel: null,
    reflectorModel: null,
    isObserving: false,
    isReflecting: false,
    lastStatusNote: undefined,
    lastObservationError: undefined,
    lastReflectionError: undefined,
  };

  async function refresh(ctx: any) {
    config = loadConfig(ctx.cwd);
    runtime.observerModel = chooseDefaultModel(ctx, config.observerModel, ctx.model);
    runtime.reflectorModel = chooseDefaultModel(
      ctx,
      config.reflectorModel || config.observerModel,
      runtime.observerModel || ctx.model,
    );
    const { tokens } = await getUnobservedContext(ctx);
    appendDebugLog(
      ctx.cwd,
      config.debug,
      `refresh enabled=${config.enabled} scope=${config.scope} observer=${formatModelId(runtime.observerModel)} reflector=${formatModelId(runtime.reflectorModel)} tokens=${tokens}`,
    );
    updateStatus(ctx, config, runtime, tokens, config.enabled ? undefined : "disabled");
  }

  async function performObservation(ctx: any, reason: string) {
    if (!config.enabled) return;
    if (!runtime.observerModel) {
      runtime.lastObservationError = "No configured observer model available";
      runtime.lastStatusNote = "no model";
      appendDebugLog(ctx.cwd, config.debug, `observe skipped: no model (${reason})`);
      return;
    }
    if (runtime.isObserving) return;

    const branch = ctx.sessionManager.getBranch();
    const { tokens, unobservedMessages, conversationText } = await getUnobservedContext(ctx);
    updateStatus(ctx, config, runtime, tokens);
    appendDebugLog(
      ctx.cwd,
      config.debug,
      `observe check reason=${reason} tokens=${tokens} threshold=${config.observationThreshold} messages=${unobservedMessages.length}`,
    );

    if (tokens < config.observationThreshold) return;
    if (shouldSkipObservation(branch, config, tokens)) {
      appendDebugLog(ctx.cwd, config.debug, "observe skipped due to retry backoff");
      runtime.lastStatusNote = runtime.lastObservationError
        ? `backoff (${runtime.lastObservationError})`
        : "backoff";
      updateStatus(ctx, config, runtime, tokens, runtime.lastStatusNote);
      return;
    }

    runtime.isObserving = true;
    runtime.lastStatusNote = undefined;
    updateStatus(ctx, config, runtime, tokens);
    appendDebugLog(ctx.cwd, config.debug, "observation started");

    try {
      const result = await runObserver({
        ctx,
        config,
        model: runtime.observerModel,
        conversationText,
      });
      appendDebugLog(
        ctx.cwd,
        config.debug,
        `observation result rawChars=${result.rawText.length} summaryChars=${result.summary.length}`,
      );

      const observerSnapshot = fs.existsSync(`${ctx.cwd}/.pi/om-last-observer-response.json`)
        ? JSON.parse(fs.readFileSync(`${ctx.cwd}/.pi/om-last-observer-response.json`, "utf8"))
        : null;
      const observerError = typeof observerSnapshot?.errorMessage === "string"
        ? observerSnapshot.errorMessage
        : undefined;

      if (result.summary.trim()) {
        runtime.lastObservationError = undefined;
        runtime.lastStatusNote = "observed";
        const record: ObservationRecord = {
          summary: result.summary.trim(),
          currentTask: result.currentTask,
          suggestedResponse: result.suggestedResponse,
          sourceMessageCount: unobservedMessages.length,
          estimatedTokens: tokens,
          model: formatModelId(runtime.observerModel),
          createdAt: Date.now(),
        };
        pi.appendEntry("om-observation", record);
        pi.appendEntry("om-observation-attempt", {
          status: "success",
          estimatedTokens: tokens,
          messageCount: unobservedMessages.length,
          model: formatModelId(runtime.observerModel),
          createdAt: Date.now(),
        } satisfies ObservationAttemptRecord);
      } else {
        runtime.lastObservationError = observerError || "empty response";
        runtime.lastStatusNote = observerError
          ? `error: ${observerError}`
          : "empty response";
        pi.appendEntry("om-observation-attempt", {
          status: "empty",
          estimatedTokens: tokens,
          messageCount: unobservedMessages.length,
          model: formatModelId(runtime.observerModel),
          createdAt: Date.now(),
          error: observerError,
        } satisfies ObservationAttemptRecord);
        updateStatus(ctx, config, runtime, tokens, runtime.lastStatusNote);
      }
    } catch (error: any) {
      const errorText = error?.message || String(error);
      runtime.lastObservationError = errorText;
      runtime.lastStatusNote = `error: ${errorText}`;
      pi.appendEntry("om-observation-attempt", {
        status: "error",
        estimatedTokens: tokens,
        messageCount: unobservedMessages.length,
        model: formatModelId(runtime.observerModel),
        createdAt: Date.now(),
        error: errorText,
      } satisfies ObservationAttemptRecord);
      appendDebugLog(
        ctx.cwd,
        config.debug,
        `observation error: ${errorText}`,
      );
      updateStatus(ctx, config, runtime, tokens, runtime.lastStatusNote);
    } finally {
      runtime.isObserving = false;
      const latest = await getUnobservedContext(ctx);
      updateStatus(ctx, config, runtime, latest.tokens);
      appendDebugLog(ctx.cwd, config.debug, `observation finished tokens=${latest.tokens}`);
    }
  }

  pi.on("session_start", async (_event, ctx) => {
    await refresh(ctx);
  });

  pi.on("before_agent_start", async (event, ctx) => {
    if (!config.enabled) return;
    const memory = buildInjectedMemory(ctx, config);
    if (!memory) return;
    return {
      systemPrompt:
        "=== OBSERVATIONAL MEMORY ===\n" +
        memory +
        "\n===========================\n\n" +
        event.systemPrompt,
    };
  });

  pi.on("turn_end", async (_event, ctx) => {
    await performObservation(ctx, "turn_end");
  });

  pi.on("session_before_compact", async (event, ctx) => {
    if (!config.enabled || !runtime.reflectorModel) return;
    runtime.isReflecting = true;
    ctx.ui.setStatus("om-reflect", "Reflecting on observations...");
    try {
      const threadObservations = getThreadObservations(event.branchEntries);
      const existingThreadSummary = threadObservations
        .map((entry) => entry.summary)
        .join("\n\n");
      const existingResourceSummary = readResourceMemory(ctx.cwd, config);
      const allMessages = [
        ...event.preparation.messagesToSummarize,
        ...event.preparation.turnPrefixMessages,
      ];
      const conversationText = serializeConversation(convertToLlm(allMessages));

      const result = await runReflector({
        ctx,
        config,
        model: runtime.reflectorModel,
        conversationText,
        existingResourceSummary,
        existingThreadSummary,
        signal: event.signal,
      });

      appendDebugLog(
        ctx.cwd,
        config.debug,
        `reflection result rawChars=${result.rawText.length} threadChars=${result.threadSummary.length} resourceChars=${result.resourceSummary.length}`,
      );

      if (result.resourceSummary.trim()) {
        writeResourceMemory(ctx.cwd, config, result.resourceSummary.trim());
      }

      if (result.threadSummary.trim()) {
        return {
          compaction: {
            firstKeptEntryId: event.preparation.firstKeptEntryId,
            summary: result.threadSummary.trim(),
            tokensBefore: event.preparation.tokensBefore,
          },
        };
      }
    } catch (error: any) {
      runtime.lastReflectionError = error?.message || String(error);
      runtime.lastStatusNote = `reflection error: ${runtime.lastReflectionError}`;
      appendDebugLog(
        ctx.cwd,
        config.debug,
        `reflection error: ${runtime.lastReflectionError}`,
      );
    } finally {
      runtime.isReflecting = false;
      ctx.ui.setStatus("om-reflect", undefined);
      const latest = await getUnobservedContext(ctx);
      updateStatus(ctx, config, runtime, latest.tokens);
    }
  });

  async function showStatus(ctx: any) {
    await refresh(ctx);
    const { tokens, unobservedMessages } = await getUnobservedContext(ctx);
    const statusBits = [
      `OM ${config.enabled ? "enabled" : "disabled"}`,
      `observer=${formatModelId(runtime.observerModel)}`,
      `reflector=${formatModelId(runtime.reflectorModel)}`,
      `tokens=${Math.round(tokens)}`,
      `messages=${unobservedMessages.length}`,
    ];
    if (runtime.lastObservationError) {
      statusBits.push(`lastObservationError=${runtime.lastObservationError}`);
    }
    if (runtime.lastReflectionError) {
      statusBits.push(`lastReflectionError=${runtime.lastReflectionError}`);
    }
    ctx.ui.notify(statusBits.join(" · "), "info");
  }

  pi.registerCommand("om", {
    description: "Configure and inspect Observational Memory",
    handler: async (args, ctx) => {
      await refresh(ctx);
      const command = args.trim();

      if (!command || command === "status") {
        await showStatus(ctx);
        return;
      }

      if (command === "enable") {
        config.enabled = true;
        saveConfig(ctx.cwd, config);
        await refresh(ctx);
        ctx.ui.notify("Observational Memory enabled", "success");
        return;
      }

      if (command === "disable") {
        config.enabled = false;
        saveConfig(ctx.cwd, config);
        await refresh(ctx);
        ctx.ui.notify("Observational Memory disabled", "info");
        return;
      }

      if (command === "observe" || command === "observe-now") {
        await performObservation(ctx, "manual");
        return;
      }

      if (command === "debug on" || command === "debug off") {
        config.debug = command.endsWith("on");
        saveConfig(ctx.cwd, config);
        await refresh(ctx);
        ctx.ui.notify(`OM debug ${config.debug ? "enabled" : "disabled"}`, "info");
        return;
      }

      if (command === "config") {
        ctx.ui.notify(
          `Config is stored in .pi/settings.json under observationalMemory: ${JSON.stringify(config)}`,
          "info",
        );
        return;
      }

      ctx.ui.notify(
        "Usage: /om [status|enable|disable|observe|debug on|debug off|config]",
        "info",
      );
    },
  });

  pi.registerCommand("om:status", {
    description: "Show Observational Memory status",
    handler: async (_args, ctx) => {
      await showStatus(ctx);
    },
  });

  pi.registerCommand("om:observe", {
    description: "Force an Observational Memory observation run",
    handler: async (_args, ctx) => {
      await refresh(ctx);
      await performObservation(ctx, "manual-command");
    },
  });
}
