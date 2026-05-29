/**
 * Shared helpers: snapshot capture, branch walking, prefix parsing
 */

import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { THOUGHT_LABEL_PREFIX } from "../types.ts";

/**
 * Capture the most recent messages as a verbatim snapshot
 */
export function captureSnapshot(ctx: ExtensionContext, leafId: string): string {
  const entries = ctx.sessionManager.getEntries();
  const leafIndex = entries.findIndex((e) => e.id === leafId);
  if (leafIndex < 0) return "";

  const parts: string[] = [];

  const leaf = entries[leafIndex];
  if (leaf.type === "message") {
    const msg = (leaf as any).message;
    if (msg.role === "user") {
      const content =
        typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content).substring(0, 4096);
      parts.push(`User: ${content}`);
    }
  }

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

  if (leafIndex > 1) {
    for (let i = leafIndex - 2; i >= 0; i--) {
      const e = entries[i];
      if (e.type === "message") {
        const msg = (e as any).message;
        if (msg.role === "user") {
          const content =
            typeof msg.content === "string"
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
 * Walk backwards along the current branch to find the nearest thought: label
 */
export function findThoughtAncestor(
  ctx: ExtensionContext,
  fromId: string | null
): { id: string; label: string } | null {
  if (!fromId) return null;

  const branch = ctx.sessionManager.getBranch(fromId);

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
 * Detect thread prefix routing: "/thread-name: rest of message"
 */
export function parseThreadPrefix(text: string): {
  threadSlug: string | null;
  message: string;
} {
  const match = text.match(/^\/([a-z0-9\-]+):\s+(.*)$/i);
  if (match) {
    return { threadSlug: match[1].toLowerCase(), message: match[2] };
  }
  return { threadSlug: null, message: text };
}
