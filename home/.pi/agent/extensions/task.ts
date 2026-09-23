import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { discoverAgents } from "./subagent/agents.ts";

function buildAgentMenu(cwd: string): string {
  const agents = discoverAgents(cwd, "user").agents.sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  if (agents.length === 0) {
    return "No user agents were found in ~/.pi/agent/agents.";
  }

  return agents
    .map((agent) => `- \`${agent.name}\` — ${agent.description}`)
    .join("\n");
}

export function buildTaskPrompt(cwd: string, task: string): string {
  const requestedTask = task.trim();
  const menu = buildAgentMenu(cwd);

  return `Use the subagent tool to route ${
    requestedTask ? `this task: ${requestedTask}` : "the user's next task"
  } to exactly one focused agent.

Available agents:

${menu}

${
  requestedTask
    ? "State the selected agent in one sentence, then dispatch it. If the match is genuinely ambiguous, ask one clarifying question; default to `clarifier` if ambiguity remains."
    : "Show the available-agent menu and stop. Do not dispatch an agent until the user supplies a task."
}

Do not chain agents automatically. The user chooses each transition.`;
}

export default function taskExtension(pi: ExtensionAPI) {
  pi.registerCommand("task", {
    description: "Route a task to the matching focused agent",
    handler: async (args, ctx) => {
      const prompt = buildTaskPrompt(ctx.cwd, args);

      if (ctx.isIdle()) {
        pi.sendUserMessage(prompt);
        return;
      }

      pi.sendUserMessage(prompt, { deliverAs: "followUp" });
      ctx.ui.notify("Task routing queued", "info");
    },
  });
}
