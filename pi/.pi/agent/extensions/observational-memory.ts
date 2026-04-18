import type { Model } from "@mariozechner/pi-ai";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

import { complete } from "@mariozechner/pi-ai";
import { convertToLlm, serializeConversation } from "@mariozechner/pi-coding-agent";
import { Container, SelectList, Text } from "@mariozechner/pi-tui";
import * as fs from "node:fs";
import * as path from "node:path";

// Token limit before we trigger a background Observation
const OBSERVATION_THRESHOLD = 10_000;

export default function (pi: ExtensionAPI) {
  let observerModel: Model<any> | null = null;
  let isObserving = false;
  let resourceMemoryPath = "";

  // Helper to read cross-session memory
  function readResourceMemory(): string {
    if (!resourceMemoryPath || !fs.existsSync(resourceMemoryPath)) return "";
    try {
      return fs.readFileSync(resourceMemoryPath, "utf8");
    } catch {
      return "";
    }
  }

  // Helper to write cross-session memory
  function writeResourceMemory(content: string) {
    if (!resourceMemoryPath) return;
    try {
      const dir = path.dirname(resourceMemoryPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(resourceMemoryPath, content, "utf-8");
    } catch {
      // Ignore write errors
    }
  }

  // Helper to update the footer status bar
  function updateStatus(ctx: any, tokens: number) {
    const k = (tokens / 1000).toFixed(1);
    const tk = (OBSERVATION_THRESHOLD / 1000).toFixed(1);
    const text = isObserving ? `Observing...` : `msg ${k}k/${tk}k`;
    // Force a color to ensure it renders correctly. Let's use accent when over threshold
    const formattedText = tokens >= OBSERVATION_THRESHOLD ? ctx.ui.theme.fg("warning", text) : ctx.ui.theme.fg("dim", text);
    ctx.ui.setStatus("00-om-status", formattedText);
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
      // Fallback heuristic if conversion/estimation fails
      tokens = JSON.stringify(unobservedMessages).length / 4;
    }
    return { tokens, unobservedMessages };
  }

  pi.on("session_start", async (_event, ctx) => {
    // Auto-assign default if missing. Try to find a fast configured model.
    const configured = ctx.modelRegistry.getAll().filter((m: Model<any>) => ctx.modelRegistry.hasConfiguredAuth(m));
    observerModel = configured.find((m: Model<any>) => m.id.includes("flash") || m.id.includes("haiku") || m.id.includes("mini")) || configured[0];
    
    resourceMemoryPath = path.join(ctx.cwd, ".pi", "om-memory.txt");
    const { tokens } = await getUnobservedContext(ctx);
    updateStatus(ctx, tokens);
  });

  pi.registerCommand("om", {
    description: "Configure Observational Memory",
    handler: async (_args, ctx) => {
      // Group models to make them easier to navigate and only show configured ones
      const models = ctx.modelRegistry
        .getAll()
        .filter((m: Model<any>) => ctx.modelRegistry.hasConfiguredAuth(m));
      const items = models.map((m: Model<any>) => {
        const id = `${m.provider}/${m.id}`;
        return { label: id, value: id };
      });

      const choice = (await ctx.ui.custom(
        (tui: any, theme: any, kb: any, done: any) => {
          const container = new Container();
          container.addChild(
            new Text(theme.fg("accent", "Select OM Model:"), 0, 0),
          );

          const list = new SelectList(items, 10, {
            description: (t: string) => theme.fg("muted", t),
            noMatch: (t: string) => theme.fg("muted", t),
            scrollInfo: (t: string) => theme.fg("muted", t),
            selectedPrefix: (t: string) => theme.fg("accent", t),
            selectedText: (t: string) => theme.fg("accent", t),
          });

          const currentId = observerModel
            ? `${observerModel.provider}/${observerModel.id}`
            : null;
          const currentIdx = items.findIndex((i) => i.value === currentId);
          if (currentIdx !== -1) {
            list.setSelectedIndex(currentIdx);
          }

          list.onSelect = (item: any) => done(item.value);
          list.onCancel = () => done();

          container.addChild(list);
          // Remove dynamic border which is not exported from coding-agent

          // Need a wrapper to cast container for input handling
          (container as any).handleInput = (data: string) => {
            (list as any).handleInput(data);
          };

          return container;
        },
      ));

      if (choice) {
        const [provider, id] = choice.split("/", 2);
        observerModel =
          models.find((m: Model<any>) => m.provider === provider && m.id === id) ||
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
    const threadObservations = branch
      .filter(
        (e: any) => e.type === "custom" && e.customType === "om-observation",
      )
      .map((e: any) => e.data.summary);

    const resourceObservations = readResourceMemory();
    
    let obsText = "";
    if (resourceObservations.trim()) {
      obsText += "RESOURCE-SCOPED OBSERVATIONS (Cross-session Project Memory):\n" + resourceObservations.trim() + "\n\n";
    }
    
    if (threadObservations.length > 0) {
      obsText += "THREAD-SCOPED OBSERVATIONS (Current Session Logs):\n" + threadObservations.join("\n\n") + "\n\n";
    }

    if (obsText) {
      return {
        systemPrompt: "=== OBSERVATIONAL MEMORY ===\n" + obsText + "===========================\n\n" + event.systemPrompt,
      };
    }
  });

  pi.on("turn_end", async (_event, ctx) => {
    // Ensure observerModel is defined
    if (!observerModel) {
       // Auto-assign default if missing. Try to find a fast configured model.
       const configured = ctx.modelRegistry.getAll().filter((m: Model<any>) => ctx.modelRegistry.hasConfiguredAuth(m));
       observerModel = configured.find((m: Model<any>) => m.id.includes("flash") || m.id.includes("haiku") || m.id.includes("mini")) || configured[0];
       if (!observerModel) return;
    }
    
    if (isObserving) return;

    const { tokens, unobservedMessages } = await getUnobservedContext(ctx);
    updateStatus(ctx, tokens);

    if (tokens >= OBSERVATION_THRESHOLD) {
      isObserving = true;
      updateStatus(ctx, tokens);

      try {
        const conversationText = serializeConversation(
          convertToLlm(unobservedMessages),
        );
        const auth = await ctx.modelRegistry.getApiKeyAndHeaders(observerModel);

        if (auth.ok) {
          const summaryMessages = [
            {
              content: [
                {
                  text: `Extract dense observations from this conversation log. Use emojis (🔴 important, 🟡 maybe important, 🟢 info only) to signify importance. Make it concise.\n\n<conversation>\n${conversationText}\n</conversation>`,
                  type: "text" as const,
                },
              ],
              role: "user" as const,
              timestamp: Date.now(),
            },
          ];

          const response = await complete(
            observerModel,
            { messages: summaryMessages },
            {
              apiKey: auth.apiKey || "",
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
        } else {
           fs.writeFileSync(path.join(ctx.cwd, ".pi", "om-debug.log"), `Auth failed for ${observerModel.id}: ${JSON.stringify(auth)}`);
        }
      } catch (error: any) {
        // Ignore error, will naturally retry next turn
        fs.writeFileSync(path.join(ctx.cwd, ".pi", "om-debug.log"), `Observation error: ${error.message}\n${error.stack}`);
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
    const { branchEntries, preparation, signal } = event;
    const {
      firstKeptEntryId,
      messagesToSummarize,
      tokensBefore,
      turnPrefixMessages,
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

    const resourceObs = readResourceMemory();

    let promptText = `Extract dense observations from this conversation log. Consolidate and refine any existing thread/resource observations into a cohesive new log. Use emojis (🔴 important, 🟡 maybe important, 🟢 info only) to signify importance. Output exactly two sections separated by "---":
1. RESOURCE OBSERVATIONS: Enduring knowledge about the project/user.
2. THREAD OBSERVATIONS: Useful context specific to this session.

`;

    if (resourceObs.trim()) {
      promptText += `<existing_resource_observations>\n${resourceObs}\n</existing_resource_observations>\n\n`;
    }

    if (customObservations.trim()) {
      promptText += `<existing_thread_observations>\n${customObservations}\n</existing_thread_observations>\n\n`;
    }

    promptText += `<conversation>\n${conversationText}\n</conversation>`;

    const summaryMessages = [
      {
        content: [{ text: promptText, type: "text" as const }],
        role: "user" as const,
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

      const rawSummary = response.content
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join("\n");

      ctx.ui.setStatus("om-reflect", undefined);
      
      const sections = rawSummary.split("---");
      let resourceSummary = "";
      let threadSummary = "";
      
      if (sections.length >= 2) {
        resourceSummary = sections[0].replace("1. RESOURCE OBSERVATIONS:", "").trim();
        threadSummary = sections[1].replace("2. THREAD OBSERVATIONS:", "").trim();
      } else {
        threadSummary = rawSummary.trim();
      }
      
      if (resourceSummary) {
        writeResourceMemory(resourceSummary);
      }

      if (threadSummary) {
        return {
          compaction: {
            firstKeptEntryId,
            summary: threadSummary,
            tokensBefore,
          },
        };
      }
    } catch {
      ctx.ui.setStatus("om-reflect", undefined);
      // Fallback to default Pi compaction on failure
    }
  });
}
