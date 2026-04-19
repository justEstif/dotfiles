import * as fs from "node:fs";
import * as path from "node:path";

import { getAgentDir } from "@mariozechner/pi-coding-agent";

import type { OmConfig } from "./types";

export const DEFAULT_CONFIG: OmConfig = {
  enabled: true,
  debug: true,
  scope: "thread",
  observationThreshold: 12_000,
  reflectionThreshold: 40_000,
  retryBackoffTurns: 2,
  observerModel: null,
  reflectorModel: null,
  resourceMemoryFile: ".pi/om-memory.json",
};

export const SETTINGS_KEY = "observationalMemory";

export function getProjectSettingsPath(cwd: string) {
  return path.join(cwd, ".pi", "settings.json");
}

export function getGlobalSettingsPath() {
  return path.join(getAgentDir(), "settings.json");
}

function readSettingsFile(settingsPath: string): Record<string, unknown> {
  if (!fs.existsSync(settingsPath)) return {};

  try {
    return JSON.parse(fs.readFileSync(settingsPath, "utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function readNamespacedConfig(settingsPath: string): Partial<OmConfig> {
  const settings = readSettingsFile(settingsPath);
  const parsed = settings[SETTINGS_KEY];
  return parsed && typeof parsed === "object"
    ? (parsed as Partial<OmConfig>)
    : {};
}

export function loadConfig(cwd: string): OmConfig {
  return {
    ...DEFAULT_CONFIG,
    ...readNamespacedConfig(getGlobalSettingsPath()),
    ...readNamespacedConfig(getProjectSettingsPath(cwd)),
  };
}

export function saveConfig(cwd: string, config: OmConfig) {
  const settingsPath = getProjectSettingsPath(cwd);
  const settings = readSettingsFile(settingsPath);
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(
    settingsPath,
    JSON.stringify(
      {
        ...settings,
        [SETTINGS_KEY]: config,
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );
}
