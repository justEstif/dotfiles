import * as fs from "node:fs";
import * as path from "node:path";

import type {
  ObservationAttemptRecord,
  ObservationRecord,
  OmConfig,
} from "./types";

export function getDebugLogPath(cwd: string) {
  return path.join(cwd, ".pi", "om-debug.log");
}

export function appendDebugLog(cwd: string, enabled: boolean, message: string) {
  if (!enabled) return;
  try {
    const debugPath = getDebugLogPath(cwd);
    fs.mkdirSync(path.dirname(debugPath), { recursive: true });
    fs.appendFileSync(
      debugPath,
      `[${new Date().toISOString()}] ${message}\n`,
      "utf8",
    );
  } catch {
    // Ignore logging errors
  }
}

export function writeResponseSnapshot(
  cwd: string,
  enabled: boolean,
  name: string,
  payload: unknown,
) {
  if (!enabled) return;
  try {
    const out = path.join(cwd, ".pi", name);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");
  } catch {
    // Ignore snapshot errors
  }
}

export function getResourceMemoryPath(cwd: string, config: OmConfig) {
  return path.join(cwd, config.resourceMemoryFile);
}

export function readResourceMemory(cwd: string, config: OmConfig): string {
  const memoryPath = getResourceMemoryPath(cwd, config);
  if (!fs.existsSync(memoryPath)) return "";

  try {
    const raw = JSON.parse(fs.readFileSync(memoryPath, "utf8"));
    return typeof raw.resourceSummary === "string" ? raw.resourceSummary : "";
  } catch {
    return "";
  }
}

export function writeResourceMemory(cwd: string, config: OmConfig, summary: string) {
  const memoryPath = getResourceMemoryPath(cwd, config);
  fs.mkdirSync(path.dirname(memoryPath), { recursive: true });
  fs.writeFileSync(
    memoryPath,
    JSON.stringify(
      {
        version: 1,
        updatedAt: new Date().toISOString(),
        resourceSummary: summary,
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );
}

export function getThreadObservations(branch: any[]): ObservationRecord[] {
  return branch
    .filter((e: any) => e.type === "custom" && e.customType === "om-observation")
    .map((e: any) => e.data as ObservationRecord);
}

export function getLastObservationAttempt(branch: any[]): ObservationAttemptRecord | null {
  for (let i = branch.length - 1; i >= 0; i--) {
    const entry = branch[i];
    if (entry.type === "custom" && entry.customType === "om-observation-attempt") {
      return entry.data as ObservationAttemptRecord;
    }
  }
  return null;
}
