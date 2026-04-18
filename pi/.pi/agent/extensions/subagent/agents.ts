/**
 * Agent discovery and configuration
 */

import { getAgentDir, parseFrontmatter } from "@mariozechner/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";

export type AgentConfig = {
  description: string;
  filePath: string;
  model?: string;
  name: string;
  source: "project" | "user";
  systemPrompt: string;
  tools?: string[];
};

export type AgentDiscoveryResult = {
  agents: AgentConfig[];
  projectAgentsDir: null | string;
};

export type AgentScope = "both" | "project" | "user";

export function discoverAgents(
  cwd: string,
  scope: AgentScope,
): AgentDiscoveryResult {
  const userDir = path.join(getAgentDir(), "agents");
  const projectAgentsDir = findNearestProjectAgentsDir(cwd);

  const userAgents =
    scope === "project" ? [] : loadAgentsFromDir(userDir, "user");
  const projectAgents =
    scope === "user" || !projectAgentsDir
      ? []
      : loadAgentsFromDir(projectAgentsDir, "project");

  const agentMap = new Map<string, AgentConfig>();

  if (scope === "both") {
    for (const agent of userAgents) agentMap.set(agent.name, agent);
    for (const agent of projectAgents) agentMap.set(agent.name, agent);
  } else if (scope === "user") {
    for (const agent of userAgents) agentMap.set(agent.name, agent);
  } else {
    for (const agent of projectAgents) agentMap.set(agent.name, agent);
  }

  return { agents: [...agentMap.values()], projectAgentsDir };
}

export function formatAgentList(
  agents: AgentConfig[],
  maxItems: number,
): { remaining: number; text: string } {
  if (agents.length === 0) return { remaining: 0, text: "none" };
  const listed = agents.slice(0, maxItems);
  const remaining = agents.length - listed.length;
  return {
    remaining,
    text: listed
      .map((a) => `${a.name} (${a.source}): ${a.description}`)
      .join("; "),
  };
}

function findNearestProjectAgentsDir(cwd: string): null | string {
  let currentDir = cwd;
  while (true) {
    const candidate = path.join(currentDir, ".pi", "agents");
    if (isDirectory(candidate)) return candidate;

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) return null;
    currentDir = parentDir;
  }
}

function isDirectory(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function loadAgentsFromDir(
  dir: string,
  source: "project" | "user",
): AgentConfig[] {
  const agents: AgentConfig[] = [];

  if (!fs.existsSync(dir)) {
    return agents;
  }

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return agents;
  }

  for (const entry of entries) {
    if (!entry.name.endsWith(".md")) continue;
    if (!entry.isFile() && !entry.isSymbolicLink()) continue;

    const filePath = path.join(dir, entry.name);
    let content: string;
    try {
      content = fs.readFileSync(filePath, "utf8");
    } catch {
      continue;
    }

    const { body, frontmatter } =
      parseFrontmatter<Record<string, string>>(content);

    if (!frontmatter.name || !frontmatter.description) {
      continue;
    }

    const tools = frontmatter.tools
      ?.split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);

    agents.push({
      description: frontmatter.description,
      filePath,
      model: frontmatter.model,
      name: frontmatter.name,
      source,
      systemPrompt: body,
      tools: tools && tools.length > 0 ? tools : undefined,
    });
  }

  return agents;
}
