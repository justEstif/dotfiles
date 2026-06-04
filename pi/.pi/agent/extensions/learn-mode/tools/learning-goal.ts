/**
 * learning_goal tool — LLM-controlled visible learning purpose.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import type { StateContainer } from "../src/state-container.js";

export function registerLearningGoalTool(
  pi: ExtensionAPI,
  sc: StateContainer,
): void {
  pi.registerTool({
    name: "learning_goal",
    label: "Learning Purpose",
    description:
      "Update the visible why-level learning purpose for the active learning-tutor thread.",
    parameters: Type.Object({
      goal: Type.String({
        description:
          "Concise learner-facing why-level goal: the durable capability or concept being learned, not the immediate task.",
      }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      if (!sc.state.active) {
        return {
          content: [{ type: "text", text: "Learning mode is not active." }],
          details: { active: false },
        };
      }

      const learningPurpose = params.goal
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 200);
      sc.state = {
        ...sc.state,
        workingGoal: learningPurpose || sc.state.workingGoal,
      };
      sc.persist();
      sc.updateStatus(ctx);

      return {
        content: [
          {
            type: "text",
            text: `Learning purpose: ${sc.state.workingGoal || "(inferring why-level goal)"}`,
          },
        ],
        details: { active: true, workingGoal: sc.state.workingGoal },
      };
    },
  });
}
