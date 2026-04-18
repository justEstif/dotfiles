import { complete, estimateTokens } from "@mariozechner/pi-ai";
import type { ExtensionAPI, Model } from "@mariozechner/pi-coding-agent";
import {
  convertToLlm,
  serializeConversation,
  DynamicBorder,
} from "@mariozechner/pi-coding-agent";
import { Container, SelectList, Text } from "@mariozechner/pi-tui";

// Token limit before we trigger a background Observation
const OBSERVATION_THRESHOLD = 10000;

export default function (pi: ExtensionAPI) {
  let observerModel: Model | null = null;
  let isObserving = false;

  // Helper to update the footer status bar
  function updateStatus(ctx: any, tokens: number) {
    const k = (tokens / 1000).toFixed(1);
    const tk = (OBSERVATION_THRESHOLD / 1000).toFixed(1);
    const text = isObserving ? `Observing...` : `msg ${k}k/${tk}k`;
    ctx.ui.setStatus("om-status", text);
  }

  // Helper to count tokens of raw messages since our last Observation
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

    let tokens = 0;
    if (unobservedMessages.length > 0) {
      try {
        const llmMessages = convertToLlm(unobservedMessages);
        tokens = estimateTokens(llmMessages);
      } catch (e) {
        // Fallback heuristic if conversion/estimation fails
        tokens = JSON.stringify(unobservedMessages).length / 4;
      }
    }
    return { unobservedMessages, tokens };
  }

  pi.on("session_start", async (_event, ctx) => {
    observerModel = ctx.modelRegistry.find("google", "gemini-2.5-flash");
    const { tokens } = await getUnobservedContext(ctx);
    updateStatus(ctx, tokens);
  });

  pi.registerCommand("om", {
    description: "Configure Observational Memory",
    handler: async (_args, ctx) => {
      // Group models to make them easier to navigate and only show configured ones
      const models = ctx.modelRegistry
        .getAll()
        .filter((m: Model) => ctx.modelRegistry.hasConfiguredAuth(m));
      const items = models.map((m: Model) => {
        const id = `${m.provider}/${m.id}`;
        return { label: id, value: id };
      });

      const choice = await ctx.ui.custom(
        (tui: any, theme: any, kb: any, done: any) => {
          const container = new Container();
          container.addChild(
            new Text(theme.fg("accent", "Select OM Model:"), 0, 0),
          );

          const list = new SelectList(items, 10, {
            selectedPrefix: (t: string) => theme.fg("accent", t),
            selectedText: (t: string) => theme.fg("accent", t),
            description: (t: string) => theme.fg("muted", t),
            scrollInfo: (t: string) => theme.fg("muted", t),
            noMatch: (t: string) => theme.fg("muted", t),
          });

          const currentId = observerModel
            ? `${observerModel.provider}/${observerModel.id}`
            : null;
          const currentIdx = items.findIndex((i) => i.value === currentId);
          if (currentIdx !== -1) {
            list.setSelectedIndex(currentIdx);
          }

          list.onSelect = (item: any) => done(item.value);
          list.onCancel = () => done(undefined);

          container.addChild(list);
          container.addChild(new DynamicBorder());

          container.handleInput = (data: string) => {
            list.handleInput(data);
          };

          return container;
        },
      );

      if (choice) {
        const [provider, id] = choice.split("/", 2);
        observerModel =
          models.find((m: Model) => m.provider === provider && m.id === id) ||
          null;
        ctx.ui.notify(`OM Model set to ${observerModel?.id}`, "info");

        const { tokens } = await getUnobservedContext(ctx);
        updateStatus(ctx, tokens);
      }
    },
  });

  // Inject Observational Memory logs into the system prompt before the agent runs
  pi.on("before_agent_start", async (event, ctx) => {
    const branch = ctx.sessionManager.getBranch();
    const observations = branch
      .filter(
        (e: any) => e.type === "custom" && e.customType === "om-observation",
      )
      .map((e: any) => e.data.summary);

    if (observations.length > 0) {
      const obsText = "OBSERVATIONAL MEMORY LOG:\n" + observations.join("\n\n");
      return {
        systemPrompt: obsText + "\n\n" + event.systemPrompt,
      };
    }
  });

  // Check unobserved tokens after every turn and buffer an observation if needed
  pi.on("turn_end", async (_event, ctx) => {
    if (!observerModel || isObserving) return;

    const { unobservedMessages, tokens } = await getUnobservedContext(ctx);
    updateStatus(ctx, tokens);

    if (tokens >= OBSERVATION_THRESHOLD) {
      isObserving = true;
      updateStatus(ctx, tokens);

      try {
        const conversationText = serializeConversation(
          convertToLlm(unobservedMessages),
        );
        const auth = await ctx.modelRegistry.getApiKeyAndHeaders(observerModel);

        if (auth.ok && auth.apiKey) {
          const summaryMessages = [
            {
              role: "user" as const,
              content: [
                {
                  type: "text" as const,
                  text: `Extract dense observations from this conversation log. Use emojis (🔴 important, 🟡 maybe important, 🟢 info only) to signify importance. Make it concise.\n\n<conversation>\n${conversationText}\n</conversation>`,
                },
              ],
              timestamp: Date.now(),
            },
          ];

          const response = await complete(
            observerModel,
            { messages: summaryMessages },
            {
              apiKey: auth.apiKey,
              headers: auth.headers,
              maxTokens: 4096,
            },
          );

          const summary = response.content
            .filter((c: any) => c.type === "text")
            .map((c: any) => c.text)
            .join("\n");

          if (summary.trim()) {
            pi.appendEntry("om-observation", { summary });
          }
        }
      } catch (e) {
        // Ignore error, will naturally retry next turn
      } finally {
        isObserving = false;
        // Recalculate tokens (should be near 0 now that an observation was appended)
        const { tokens: newTokens } = await getUnobservedContext(ctx);
        updateStatus(ctx, newTokens);
      }
    }
  });

  // Handle Reflector step via custom compaction
  pi.on("session_before_compact", async (event, ctx) => {
    const { preparation, branchEntries, signal } = event;
    const {
      messagesToSummarize,
      turnPrefixMessages,
      tokensBefore,
      firstKeptEntryId,
    } = preparation;

    if (!observerModel) return;

    ctx.ui.setStatus("om-reflect", "Reflecting on observations...");

    // Combine existing observations with raw messages
    const customObservations = branchEntries
      .filter(
        (e: any) => e.type === "custom" && e.customType === "om-observation",
      )
      .map((e: any) => e.data.summary)
      .join("\n");

    const allMessages = [...messagesToSummarize, ...turnPrefixMessages];
    const conversationText = serializeConversation(convertToLlm(allMessages));

    let promptText = `Extract dense observations from this conversation log. Consolidate and refine any existing observations into a cohesive new log. Use emojis (🔴 important, 🟡 maybe important, 🟢 info only) to signify importance.\n\n`;

    if (customObservations) {
      promptText += `<existing_observations>\n${customObservations}\n</existing_observations>\n\n`;
    }

    promptText += `<conversation>\n${conversationText}\n</conversation>`;

    const summaryMessages = [
      {
        role: "user" as const,
        content: [{ type: "text" as const, text: promptText }],
        timestamp: Date.now(),
      },
    ];

    try {
      const auth = await ctx.modelRegistry.getApiKeyAndHeaders(observerModel);
      if (!auth.ok || !auth.apiKey) {
        ctx.ui.setStatus("om-reflect", undefined);
        return;
      }

      const response = await complete(
        observerModel,
        { messages: summaryMessages },
        {
          apiKey: auth.apiKey,
          headers: auth.headers,
          maxTokens: 8192,
          signal,
        },
      );

      const summary = response.content
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join("\n");

      ctx.ui.setStatus("om-reflect", undefined);

      if (summary.trim()) {
        return {
          compaction: {
            summary,
            firstKeptEntryId,
            tokensBefore,
          },
        };
      }
    } catch (e) {
      ctx.ui.setStatus("om-reflect", undefined);
      // Fallback to default Pi compaction on failure
    }
  });
}
