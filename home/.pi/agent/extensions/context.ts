/**
 * /context — show estimated context usage breakdown.
 *
 * Shows the context window, % used, and an ASCII bar breakdown by category
 * (system prompt, user messages, assistant messages, tool results, free space).
 *
 * Token counts for categories are estimates (~chars/4), matching Pi's own
 * compaction estimator. The total "used" figure comes from ctx.getContextUsage(),
 * the same number Pi's footer and auto-compaction use.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const BAR_WIDTH = 20;

function asciiBar(fraction: number): string {
  const cells = Math.max(
    fraction > 0 ? 1 : 0,
    Math.round(fraction * BAR_WIDTH),
  );
  return "█".repeat(Math.min(cells, BAR_WIDTH)).padEnd(BAR_WIDTH, "░");
}

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

/** Rough token estimate for a message's visible content, ~4 chars/token. */
function estimateMessageTokens(msg: any): number {
  let chars = 0;
  const countContent = (content: any) => {
    if (typeof content === "string") chars += content.length;
    else if (Array.isArray(content)) {
      for (const part of content) {
        if (typeof part?.text === "string") chars += part.text.length;
        else if (typeof part?.thinking === "string")
          chars += part.thinking.length;
        else if (part?.type === "image")
          chars += 1000; // image placeholder
        else chars += JSON.stringify(part ?? "").length;
      }
    } else if (content != null) chars += JSON.stringify(content).length;
  };
  switch (msg?.role) {
    case "assistant":
      for (const block of msg.content ?? []) {
        if (block?.type === "text") chars += block.text?.length ?? 0;
        else if (block?.type === "thinking")
          chars += block.thinking?.length ?? 0;
        else if (block?.type === "toolCall")
          chars +=
            (block.name?.length ?? 0) +
            JSON.stringify(block.arguments ?? {}).length;
        else chars += JSON.stringify(block ?? {}).length;
      }
      break;
    case "toolResult":
      countContent(msg.content);
      break;
    default:
      countContent(msg?.content);
  }
  return Math.ceil(chars / 4);
}

export default function contextExtension(pi: ExtensionAPI) {
  pi.registerCommand("context", {
    description: "Show estimated context usage breakdown",
    handler: async (_args, ctx) => {
      const usage = ctx.getContextUsage();
      if (!usage || usage.contextWindow <= 0) {
        ctx.ui.notify(
          "Context usage is unavailable: no model is selected for this session.",
          "warning",
        );
        return;
      }

      const window = usage.contextWindow;
      const systemPromptTokens = Math.ceil(ctx.getSystemPrompt().length / 4);

      // Model-visible messages after context edits.
      const projection = ctx.sessionManager.buildSessionProjection();
      let userTokens = 0;
      let assistantTokens = 0;
      let toolTokens = 0;
      let messageCount = 0;
      for (const projected of projection.entries) {
        for (const msg of projected.messages) {
          messageCount++;
          const t = estimateMessageTokens(msg);
          if (msg.role === "assistant") assistantTokens += t;
          else if (msg.role === "toolResult") toolTokens += t;
          else if (msg.role === "user" || msg.role === "custom")
            userTokens += t;
        }
      }

      // Reconcile: prefer Pi's own usage number for the total when known.
      const used =
        usage.tokens ??
        systemPromptTokens + userTokens + assistantTokens + toolTokens;
      const usedPct = Math.round((used / window) * 100);
      const free = Math.max(0, window - used);
      const estTotal =
        systemPromptTokens + userTokens + assistantTokens + toolTokens;
      const other = Math.max(0, used - estTotal); // tools schema, skills, residual usage delta

      const lines: string[] = [
        `Context window: ${fmt(window)} tokens (${usedPct}% used)`,
      ];

      const categories: Array<[string, number]> = [
        ["System prompt", systemPromptTokens],
        ["Messages (you)", userTokens],
        ["Messages (AI)", assistantTokens],
        ["Tool results", toolTokens],
      ];
      if (other > 0) categories.push(["Tools & skills", other]);
      categories.push(["Free", free]);

      for (const [label, tokens] of categories) {
        if (tokens === 0) continue;
        lines.push(
          `  ${label.padEnd(16)} ${asciiBar(tokens / window)}  ${fmt(tokens)} tokens`,
        );
      }

      lines.push("");
      lines.push(
        `  ${fmt(messageCount)} messages in context · category split is estimated (~4 chars/token); total is Pi's own estimate.`,
      );

      await ctx.ui.select("Context Usage", [...lines, "", "Close"]);
    },
  });
}
