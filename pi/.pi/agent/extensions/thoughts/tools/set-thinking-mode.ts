/**
 * set_thinking_mode tool — activate a thinking mode, creating a thread if none is active.
 * Two behaviors:
 *   - No active thread → create thread (name from `reason` or mode label) + activate mode
 *   - Active thread already → switch the mode within that thread
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import {
  THOUGHT_LABEL_PREFIX,
  THOUGHTS_CUSTOM_TYPE,
  slugify,
  generateAnchorId,
} from "../types.ts";
import type { ThoughtAnchor, ModeChange } from "../types.ts";
import { getModeDefinition, getModeIds, loadModes } from "../modes/registry.ts";
import { captureSnapshot, findThoughtAncestor } from "../lib/helpers.ts";
import { indexThread } from "../lib/index-file.ts";

export function registerSetThinkingMode(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "set_thinking_mode",
    label: "Set Thinking Mode",
    description:
      "Activate a structured thinking mode that changes how you reason about the conversation. " +
      "Use when the user wants to think through something with a specific framework, " +
      "or when you detect thinking-mode keywords (push back, challenge, root cause, grill me, etc.). " +
      "The mode persists across turns and survives compaction.",
    promptSnippet: "Activate or change the active thinking mode",
    promptGuidelines: [
      "Use set_thinking_mode when the user says 'help me think', 'push back', 'challenge', 'grill me', 'root cause', 'behind the request', or similar thinking-mode triggers.",
      "Auto-detect the best mode from the user's intent, but let the user override.",
    ],
    parameters: Type.Object({
      mode: Type.String({
        description:
          "Which thinking mode to activate (e.g. sycophancy, root-ask, grill-me). Use 'off' to disable.",
      }),
      reason: Type.Optional(Type.String({
        description: "Brief explanation of why this mode was chosen (shown to user)",
      })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const mode = params.mode as string;
      const reason = params.reason as string | undefined;

      const validIds = [...getModeIds(), "off"];
      if (!validIds.includes(mode)) {
        const available = loadModes().map((m) => `${m.id}: ${m.description.split(".")[0]}`).join("\n");
        return {
          content: [{ type: "text", text: `Invalid mode: "${mode}". Available modes:\n${available}\noff: disable thinking mode` }],
          isError: true,
        };
      }

      // Check if there's an active thread on the current branch
      const leafId = ctx.sessionManager.getLeafId();
      const activeThread = leafId ? findThoughtAncestor(ctx, leafId) : null;
      const activeThreadSlug = activeThread?.label.substring(THOUGHT_LABEL_PREFIX.length);

      if (mode === "off") {
        const modeChange: ModeChange = {
          kind: "mode_change",
          mode,
          changedAt: Date.now(),
        };
        ctx.sessionManager.appendCustomEntry(THOUGHTS_CUSTOM_TYPE, modeChange);
        ctx.ui.setStatus("thoughts", activeThreadSlug ? `💭 ${activeThreadSlug}` : "");
        return {
          content: [{ type: "text", text: "Thinking mode disabled." }],
          details: { mode: "off", thread: activeThreadSlug ?? null },
        };
      }

      const def = getModeDefinition(mode);
      const changedAt = Date.now();
      let threadName: string | null = null;
      let threadSlug: string | null = activeThreadSlug ?? null;

      if (!activeThread) {
        // No active thread — create one
        const sessionFile = ctx.sessionManager.getSessionFile();
        if (sessionFile && leafId) {
          // Derive thread name from reason or mode label
          const rawName = reason?.trim() || def?.label || mode;
          threadName = rawName;

          const slug = slugify(rawName);
          threadSlug = slug;
          const anchorId = generateAnchorId();
          const snapshot = captureSnapshot(ctx, leafId);
          const cwd = ctx.sessionManager.getCwd();
          const now = Date.now();

          ctx.sessionManager.appendSessionInfo(rawName);
          ctx.sessionManager.appendLabelChange(leafId, `${THOUGHT_LABEL_PREFIX}${slug}`);

          const anchor: ThoughtAnchor = {
            kind: "start",
            anchorId,
            name: slug,
            displayName: rawName,
            snapshot,
            createdAt: now,
          };
          ctx.sessionManager.appendCustomEntry(THOUGHTS_CUSTOM_TYPE, anchor);

          indexThread({ slug, displayName: rawName, sessionFile, cwd, createdAt: now, updatedAt: now });
        }
      }

      // Persist mode change after any needed thread creation succeeds.
      const modeChange: ModeChange = {
        kind: "mode_change",
        mode,
        changedAt,
      };
      ctx.sessionManager.appendCustomEntry(THOUGHTS_CUSTOM_TYPE, modeChange);

      // Update status bar — thread + mode
      const statusParts: string[] = [`🧠 ${def?.label ?? mode}`];
      if (threadSlug) {
        statusParts.push(threadSlug);
      }
      ctx.ui.setStatus("thoughts", statusParts.join(" · "));

      const threadMsg = threadName ? ` Thread started: "${threadName}".` : "";
      const msg = reason
        ? `Thinking mode activated: **${def?.label ?? mode}** — ${reason}${threadMsg}\n${def?.description ?? ""}`
        : `Thinking mode activated: **${def?.label ?? mode}**${threadMsg}\n${def?.description ?? ""}`;

      return {
        content: [{ type: "text", text: msg }],
        details: { mode, label: def?.label, thread: threadName },
      };
    },
  });
}
