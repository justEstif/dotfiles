/**
 * thought_recall tool — Recover verbatim anchor text after compaction
 * Ported from v1 thoughts extension
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { THOUGHTS_CUSTOM_TYPE } from "../types.ts";
import type { ThoughtsCustomData } from "../types.ts";

export function registerThoughtRecall(pi: ExtensionAPI): void {
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
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const anchorId = params.anchorId as string;
      const entries = ctx.sessionManager.getEntries();

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
        content: [{ type: "text", text: `Anchor not found: ${anchorId}` }],
        details: { found: false },
        isError: true,
      };
    },
  });
}
