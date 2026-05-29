/**
 * thoughts extension: track named thought threads across sessions
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { SessionManager } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import {
  THOUGHT_LABEL_PREFIX,
  THOUGHTS_CUSTOM_TYPE,
  ThoughtsCustomData,
  ThoughtAnchor,
  ThoughtLabel,
  slugify,
  validateThoughtName,
  generateAnchorId,
} from "./types.ts";

// Settings for the extension
interface ThoughtsSettings {
  enabled?: boolean;
  passive?: boolean; // If true, no auto-summaries
  model?: {
    provider: string;
    id: string;
  };
}

/**
 * Helper: capture the most recent messages as a snapshot
 */
function captureSnapshot(ctx: ExtensionContext, leafId: string): string {
  const entries = ctx.sessionManager.getEntries();
  const leafIndex = entries.findIndex((e) => e.id === leafId);
  if (leafIndex < 0) return "";

  const parts: string[] = [];

  // Collect the leaf entry (most likely user message)
  const leaf = entries[leafIndex];
  if (leaf.type === "message") {
    const msg = (leaf as any).message;
    if (msg.role === "user") {
      const content = typeof msg.content === "string"
        ? msg.content
        : JSON.stringify(msg.content).substring(0, 4096);
      parts.push(`User: ${content}`);
    }
  }

  // Collect the previous assistant message if it exists
  if (leafIndex > 0) {
    for (let i = leafIndex - 1; i >= 0; i--) {
      const e = entries[i];
      if (e.type === "message") {
        const msg = (e as any).message;
        if (msg.role === "assistant") {
          const content = JSON.stringify(msg.content).substring(0, 4096);
          parts.push(`Assistant: ${content}`);
          break;
        }
      }
    }
  }

  // Collect the message before that (previous user message)
  if (leafIndex > 1) {
    for (let i = leafIndex - 2; i >= 0; i--) {
      const e = entries[i];
      if (e.type === "message") {
        const msg = (e as any).message;
        if (msg.role === "user") {
          const content = typeof msg.content === "string"
            ? msg.content
            : JSON.stringify(msg.content).substring(0, 2048);
          parts.push(`User: ${content}`);
          break;
        }
      }
    }
  }

  return parts.join("\n\n---\n\n");
}

/**
 * Helper: find the most recent thought: label on the current branch
 */
function findThoughtAncestor(
  ctx: ExtensionContext,
  fromId: string | null
): { id: string; label: string } | null {
  if (!fromId) return null;

  const branch = ctx.sessionManager.getBranch(fromId);

  // Walk backwards along the branch
  for (let i = branch.length - 1; i >= 0; i--) {
    const entry = branch[i];
    if (entry.type === "label") {
      const label = (entry as any).label;
      if (label && label.startsWith(THOUGHT_LABEL_PREFIX)) {
        return { id: entry.id, label };
      }
    }
  }

  return null;
}

/**
 * Generate a thought-shaped summary in the background
 */
async function generateSummaryInBackground(
  ctx: ExtensionContext,
  rootLabel: string,
  leafId: string
): Promise<void> {
  const entries = ctx.sessionManager.getEntries();
  const leafIndex = entries.findIndex((e) => e.id === leafId);
  if (leafIndex < 0) return;

  // Collect entries from the thought start to current leaf
  const branchEntries = ctx.sessionManager.getBranch(leafId);

  // Build a conversation summary to send to the model
  const messages: Array<{ role: string; text: string }> = [];
  for (const entry of branchEntries) {
    if (entry.type === "message") {
      const msg = (entry as any).message;
      if (msg.role === "user") {
        const text = typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content);
        messages.push({ role: "user", text });
      } else if (msg.role === "assistant") {
        const text = JSON.stringify(msg.content);
        messages.push({ role: "assistant", text });
      }
    }
  }

  const rootSlug = rootLabel.substring(THOUGHT_LABEL_PREFIX.length);

  // For v1, use a placeholder summary. In v2, call LLM for real summaries.
  const summary = `## Live edge
Branch explored in parallel.

## What was tried
- See conversation above.

## What was decided
None.

## Open questions
See thought thread.

## Resume here
Continue from previous message.`;

  // Append the summary as a custom entry
  const summaryData: any = {
    kind: "summary",
    rootId: rootLabel,
    summary,
    generatedAt: Date.now(),
  };

  ctx.sessionManager.appendCustomEntry(THOUGHTS_CUSTOM_TYPE, summaryData);
}

export default function (pi: ExtensionAPI) {
  // Track in-flight summary generation to avoid duplicates
  let summaryInFlight: Promise<void> | null = null;

  // ============================================================================
  // thought_recall tool (Phase 3)
  // ============================================================================
  pi.registerTool({
    name: "thought_recall",
    label: "Thought Recall",
    description:
      "Recover the original verbatim text at a labeled thought anchor. Useful after compaction has summarized the surrounding context.",
    parameters: Type.Object({
      anchorId: Type.String({
        description: "The 12-character anchor ID from a thought anchor",
      }),
    }),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      const anchorId = params.anchorId as string;
      const entries = ctx.sessionManager.getEntries();

      // Find the custom entry with this anchor ID
      for (const entry of entries) {
        if (
          entry.type === "custom" &&
          (entry as any).customType === THOUGHTS_CUSTOM_TYPE
        ) {
          const data = (entry as any).data as ThoughtsCustomData;
          if ((data as any).anchorId === anchorId) {
            const snapshot = (data as any).snapshot || "";
            return {
              content: [{ type: "text", text: snapshot }],
              details: { found: true, kind: (data as any).kind },
            };
          }
        }
      }

      return {
        content: [
          {
            type: "text",
            text: `Anchor not found: ${anchorId}`,
          },
        ],
        details: { found: false },
        isError: true,
      };
    },
  });

  // ============================================================================
  // /thought:start <name?>
  // ============================================================================
  pi.registerCommand("thought:start", {
    description: "Start a new thought thread",
    handler: async (args, ctx) => {
      let name = args as string | undefined;

      // If no name provided, prompt with the naming prompt
      if (!name) {
        const prompt = `Name this thought thread.

A good name is the live question or tension, not the topic.

  ✓ "Lead with 1 Gig or 500 on Frontier offer page?"
  ✓ "Does a thought tracker belong inside pk?"

  ✗ "Frontier review"        (topic, not question)
  ✗ "thoughts about pricing" (vague)
  ✗ "meeting notes"          (container, not thought)`;

        name = await ctx.ui.input(prompt);
        if (!name) {
          ctx.ui.notify("Cancelled", "info");
          return;
        }

        // Soft-reject topic-shaped names once
        const validation = validateThoughtName(name);
        if (validation.suggestion) {
          const retry = await ctx.ui.confirm(
            "Naming",
            `${validation.suggestion} Continue anyway?`
          );
          if (!retry) {
            ctx.ui.notify("Cancelled", "info");
            return;
          }
        } else if (!validation.valid) {
          ctx.ui.notify(`Invalid: ${validation.error}`, "error");
          return;
        }
      } else {
        // Validate the provided name
        const validation = validateThoughtName(name);
        if (!validation.valid) {
          ctx.ui.notify(`Invalid: ${validation.error}`, "error");
          return;
        }
      }

      const leafId = ctx.sessionManager.getLeafId();
      if (!leafId) {
        ctx.ui.notify("No session loaded", "error");
        return;
      }

      const slug = slugify(name);
      const anchorId = generateAnchorId();
      const snapshot = captureSnapshot(ctx, leafId);

      // Append session info with display name
      ctx.sessionManager.appendSessionInfo(name);

      // Append label
      ctx.sessionManager.appendLabelChange(leafId, `${THOUGHT_LABEL_PREFIX}${slug}`);

      // Append custom entry with snapshot
      const anchor: ThoughtAnchor = {
        kind: "start",
        anchorId,
        name: slug,
        displayName: name,
        snapshot,
        createdAt: Date.now(),
      };

      ctx.sessionManager.appendCustomEntry(THOUGHTS_CUSTOM_TYPE, anchor);

      ctx.ui.notify(
        `✓ Thought thread started: "${name}" (id: ${anchorId})`,
        "info"
      );
    },
  });

  // ============================================================================
  // /thought:label <sub-name?>
  // ============================================================================
  pi.registerCommand("thought:label", {
    description: "Add a checkpoint label within the current thought thread",
    handler: async (args, ctx) => {
      const leafId = ctx.sessionManager.getLeafId();
      if (!leafId) {
        ctx.ui.notify("No session loaded", "error");
        return;
      }

      const ancestor = findThoughtAncestor(ctx, leafId);
      if (!ancestor) {
        ctx.ui.notify(
          "No active thought thread. Run `/thought:start` first.",
          "error"
        );
        return;
      }

      let subName = args as string | undefined;
      if (!subName) {
        subName = await ctx.ui.input(
          "Enter sub-checkpoint name (optional, can be empty): "
        );
      }

      const rootSlug = ancestor.label.substring(THOUGHT_LABEL_PREFIX.length);
      const labelSlug = subName
        ? `${rootSlug}/${slugify(subName)}`
        : rootSlug;
      const displayName = subName || rootSlug;
      const anchorId = generateAnchorId();
      const snapshot = captureSnapshot(ctx, leafId);

      // Append label
      ctx.sessionManager.appendLabelChange(leafId, `${THOUGHT_LABEL_PREFIX}${labelSlug}`);

      // Append custom entry
      const label: ThoughtLabel = {
        kind: "label",
        anchorId,
        rootId: ancestor.label, // Store the full label as rootId
        name: labelSlug,
        displayName,
        snapshot,
        createdAt: Date.now(),
      };

      ctx.sessionManager.appendCustomEntry(THOUGHTS_CUSTOM_TYPE, label);

      ctx.ui.notify(`✓ Label added: "${displayName}" (id: ${anchorId})`, "info");
    },
  });

  // ============================================================================
  // /thought:status
  // ============================================================================
  pi.registerCommand("thought:status", {
    description: "Show the current thought thread status",
    handler: async (_args, ctx) => {
      const leafId = ctx.sessionManager.getLeafId();
      if (!leafId) {
        ctx.ui.notify("No session loaded", "error");
        return;
      }

      const ancestor = findThoughtAncestor(ctx, leafId);
      if (!ancestor) {
        ctx.ui.notify("No active thought thread on this branch.", "error");
        return;
      }

      const entries = ctx.sessionManager.getEntries();

      // Find the start custom entry
      const rootSlug = ancestor.label.substring(THOUGHT_LABEL_PREFIX.length);
      const startEntry = entries.find(
        (e) =>
          e.type === "custom" &&
          (e as any).customType === THOUGHTS_CUSTOM_TYPE &&
          (e as any).data?.kind === "start" &&
          ((e as any).data as ThoughtAnchor).name === rootSlug
      );

      if (!startEntry) {
        ctx.ui.notify("Could not find thought start entry", "error");
        return;
      }

      const start = (startEntry as any).data as ThoughtAnchor;

      // Count label checkpoints on this branch
      let labelCount = 0;
      for (const entry of entries) {
        if (
          entry.type === "custom" &&
          (entry as any).customType === THOUGHTS_CUSTOM_TYPE &&
          (entry as any).data?.kind === "label"
        ) {
          labelCount++;
        }
      }

      // Find most recent summary
      let summaryAge = "no summary yet";
      for (let i = entries.length - 1; i >= 0; i--) {
        const e = entries[i];
        if (
          e.type === "custom" &&
          (e as any).customType === THOUGHTS_CUSTOM_TYPE &&
          (e as any).data?.kind === "summary"
        ) {
          const sum = (e as any).data as any;
          const ageMs = Date.now() - sum.generatedAt;
          const ageMins = Math.round(ageMs / 60000);
          summaryAge = ageMins < 1 ? "just now" : `${ageMins}m ago`;
          break;
        }
      }

      const msg = `
Thread: "${start.displayName}"
Slug: ${start.name}
Anchor ID: ${start.anchorId}
Checkpoints: ${labelCount}
Summary: ${summaryAge}
`;

      ctx.ui.notify(msg.trim(), "info");
    },
  });

  // ============================================================================
  // /thoughts (global index)
  // ============================================================================
  pi.registerCommand("thoughts", {
    description: "List all thought threads across all working directories",
    handler: async (_args, ctx) => {
      const allSessions = await SessionManager.listAll();

      // Collect all threads across all sessions
      interface ThreadInfo {
        name: string;
        displayName: string;
        cwd: string;
        sessionFile: string;
        labelCount: number;
        lastModified: number;
      }
      const threadMap = new Map<string, ThreadInfo>();

      for (const session of allSessions) {
        try {
          const sm = await SessionManager.open(session.file);
          const entries = sm.getEntries();

          for (const entry of entries) {
            if (entry.type === "label") {
              const label = (entry as any).label;
              if (label && label.startsWith(THOUGHT_LABEL_PREFIX)) {
                const slug = label.substring(THOUGHT_LABEL_PREFIX.length);
                const timestamp = new Date((entry as any).timestamp).getTime();

                if (!threadMap.has(slug)) {
                  // Find the start entry to get display name
                  const startEntry = entries.find(
                    (e) =>
                      e.type === "custom" &&
                      (e as any).customType === THOUGHTS_CUSTOM_TYPE &&
                      (e as any).data?.kind === "start" &&
                      ((e as any).data as ThoughtAnchor).name === slug
                  );
                  const displayName = startEntry
                    ? ((startEntry as any).data as ThoughtAnchor).displayName
                    : slug;

                  threadMap.set(slug, {
                    name: slug,
                    displayName,
                    cwd: sm.getCwd(),
                    sessionFile: session.file,
                    labelCount: 0,
                    lastModified: timestamp,
                  });
                }

                const thread = threadMap.get(slug)!;
                thread.labelCount++;
                thread.lastModified = Math.max(thread.lastModified, timestamp);
              }
            }
          }
        } catch {
          // Silently skip sessions that fail to open
        }
      }

      if (threadMap.size === 0) {
        ctx.ui.notify("No thought threads found", "info");
        return;
      }

      // Sort by last modified
      const threads = Array.from(threadMap.values()).sort(
        (a, b) => b.lastModified - a.lastModified
      );

      // Format as table-like output
      let output = "Thought Threads:\n\n";
      for (const thread of threads) {
        const age = Math.round((Date.now() - thread.lastModified) / 60000);
        const ageStr = age < 1 ? "just now" : `${age}m ago`;
        output += `  ${thread.displayName}\n`;
        output += `    slug: ${thread.name}\n`;
        output += `    cwd: ${thread.cwd}\n`;
        output += `    labels: ${thread.labelCount}\n`;
        output += `    modified: ${ageStr}\n\n`;
      }

      ctx.ui.notify(output, "info");
    },
  });

  // ============================================================================
  // /thought:resume <name>
  // ============================================================================
  pi.registerCommand("thought:resume", {
    description: "Resume a thought thread from any working directory",
    handler: async (args, ctx) => {
      if (!args) {
        ctx.ui.notify("Usage: /thought:resume <name>", "error");
        return;
      }

      const targetSlug = args as string;
      const allSessions = await SessionManager.listAll();

      // Find sessions containing this thread
      const candidates: Array<{ cwd: string; file: string }> = [];

      for (const session of allSessions) {
        try {
          const sm = await SessionManager.open(session.file);
          const entries = sm.getEntries();

          for (const entry of entries) {
            if (entry.type === "label") {
              const label = (entry as any).label;
              if (label === `${THOUGHT_LABEL_PREFIX}${targetSlug}`) {
                candidates.push({ cwd: sm.getCwd(), file: session.file });
                break;
              }
            }
          }
        } catch {
          // Silently skip
        }
      }

      if (candidates.length === 0) {
        ctx.ui.notify(`Thread not found: "${targetSlug}"`, "error");
        return;
      }

      let targetSessionFile = candidates[0].file;

      if (candidates.length > 1) {
        // Multiple candidates — let user choose
        const choice = await ctx.ui.select(
          "Multiple sessions found. Pick one:",
          candidates.map((c) => c.file)
        );
        if (!choice) {
          ctx.ui.notify("Cancelled", "info");
          return;
        }
        targetSessionFile = choice;
      }

      // Switch to the target session
      await ctx.switchSession(targetSessionFile);
    },
  });

  // ============================================================================
  // /thought:view <name?> [full]
  // ============================================================================
  pi.registerCommand("thought:view", {
    description: "View a thought thread with summaries",
    handler: async (args, ctx) => {
      const leafId = ctx.sessionManager.getLeafId();
      if (!leafId && !args) {
        ctx.ui.notify("Usage: /thought:view [name] [full]", "error");
        return;
      }

      // Determine which thread to view
      let targetSlug: string | undefined;
      let showFull = false;

      if (args) {
        const parts = (args as string).split(/\s+/);
        targetSlug = parts[0];
        showFull = parts.some((p) => p === "full");
      } else {
        // Use current thread
        const ancestor = findThoughtAncestor(ctx, leafId);
        if (ancestor) {
          targetSlug = ancestor.label.substring(THOUGHT_LABEL_PREFIX.length);
        }
      }

      if (!targetSlug) {
        ctx.ui.notify("No active thought thread", "error");
        return;
      }

      const entries = ctx.sessionManager.getEntries();

      // Find the start entry
      const startEntry = entries.find(
        (e) =>
          e.type === "custom" &&
          (e as any).customType === THOUGHTS_CUSTOM_TYPE &&
          (e as any).data?.kind === "start" &&
          ((e as any).data as ThoughtAnchor).name === targetSlug
      );

      if (!startEntry) {
        ctx.ui.notify(`Thread not found: "${targetSlug}"`, "error");
        return;
      }

      const start = (startEntry as any).data as ThoughtAnchor;

      // Collect all anchors (start + labels) for this thread
      let output = `# ${start.displayName}\n\n`;

      // List anchors
      output += "## Anchors\n\n";
      output += `**Start**: ${start.displayName}\n`;
      if (showFull) {
        output += `\n\`\`\`\n${start.snapshot}\n\`\`\`\n\n`;
      } else {
        const preview = start.snapshot.substring(0, 200);
        output += `${preview}${preview.length >= 200 ? "..." : ""}\n\n`;
      }

      const labels = entries.filter(
        (e) =>
          e.type === "custom" &&
          (e as any).customType === THOUGHTS_CUSTOM_TYPE &&
          (e as any).data?.kind === "label" &&
          ((e as any).data as ThoughtLabel).rootId === `${THOUGHT_LABEL_PREFIX}${targetSlug}`
      );

      for (const labelEntry of labels) {
        const label = (labelEntry as any).data as ThoughtLabel;
        output += `**Label**: ${label.displayName}\n`;
        if (showFull) {
          output += `\n\`\`\`\n${label.snapshot}\n\`\`\`\n\n`;
        } else {
          const preview = label.snapshot.substring(0, 200);
          output += `${preview}${preview.length >= 200 ? "..." : ""}\n\n`;
        }
      }

      // Find summary if present
      const summaryEntry = entries.find(
        (e) =>
          e.type === "custom" &&
          (e as any).customType === THOUGHTS_CUSTOM_TYPE &&
          (e as any).data?.kind === "summary" &&
          ((e as any).data as any).rootId === `${THOUGHT_LABEL_PREFIX}${targetSlug}`
      );

      if (summaryEntry) {
        const summary = (summaryEntry as any).data as any;
        output += `## Summary\n\n${summary.summary}\n\n`;
      }

      ctx.ui.notify(output, "info");

      // Try to copy to clipboard
      if (ctx.ui.copyToClipboard) {
        ctx.ui.copyToClipboard(output);
      }
    },
  });

  // ============================================================================
  // turn_end hook (Phase 4): schedule background summary if needed
  // ============================================================================
  pi.on("turn_end", async (event, ctx) => {
    const settings = ctx.getSettings?.("thoughts") as ThoughtsSettings | undefined;
    if (settings?.passive) return; // Skip if passive mode enabled

    const leafId = ctx.sessionManager.getLeafId();
    if (!leafId) return;

    const ancestor = findThoughtAncestor(ctx, leafId);
    if (!ancestor) return; // No active thought thread

    // Check if a summary already exists for this branch
    const entries = ctx.sessionManager.getEntries();
    const rootLabel = ancestor.label;
    const lastSummary = entries
      .slice()
      .reverse()
      .find(
        (e) =>
          e.type === "custom" &&
          (e as any).customType === THOUGHTS_CUSTOM_TYPE &&
          (e as any).data?.kind === "summary" &&
          ((e as any).data as any).rootId === rootLabel
      );

    // If summary is recent (< 10 turns old), skip
    if (lastSummary) {
      const lastSummaryIdx = entries.indexOf(lastSummary);
      if (leafId && entries.length - lastSummaryIdx < 10) {
        return;
      }
    }

    // Schedule background summary generation (non-blocking)
    if (!summaryInFlight) {
      summaryInFlight = generateSummaryInBackground(ctx, rootLabel, leafId)
        .catch(() => {
          /* silently ignore errors */
        })
        .finally(() => {
          summaryInFlight = null;
        });
    }
  });

  // ============================================================================
  // session_before_tree hook (Phase 4): return pre-generated summary
  // ============================================================================
  pi.on("session_before_tree", async (event, ctx) => {
    const leafId = ctx.sessionManager.getLeafId();
    if (!leafId) return;

    const ancestor = findThoughtAncestor(ctx, leafId);
    if (!ancestor) return;

    const entries = ctx.sessionManager.getEntries();
    const rootLabel = ancestor.label;

    // Find most recent summary for this thread
    const summaryEntry = entries
      .slice()
      .reverse()
      .find(
        (e) =>
          e.type === "custom" &&
          (e as any).customType === THOUGHTS_CUSTOM_TYPE &&
          (e as any).data?.kind === "summary" &&
          ((e as any).data as any).rootId === rootLabel
      );

    if (summaryEntry && (summaryEntry as any).data?.summary) {
      const summary = (summaryEntry as any).data as any;
      return {
        summary: {
          summary: summary.summary,
          details: {
            thoughtThread: (summaryEntry as any).data?.displayName ||
              rootLabel.substring(THOUGHT_LABEL_PREFIX.length),
          },
        },
      };
    }
  });
}
