/**
 * Persistent cross-session index for learning state.
 *
 * Stores concept mastery, difficulty tier, and session metadata in a JSONL
 * file at ~/.pi/agent/learning-index.jsonl. This allows spaced repetition
 * and concept tracking to survive across pi sessions.
 *
 * Pattern borrowed from the thoughts extension's thoughts-index.jsonl.
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  appendFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { LearningState } from "./types.js";
import { cloneState } from "./state.js";

const INDEX_PATH = join(homedir(), ".pi", "agent", "learning-index.jsonl");
const ONBOARDING_MARKER = join(homedir(), ".pi", "agent", "learning-onboarded");

export interface LearningIndexEntry {
  /** Unique key for the learning context (e.g. goal slug or cwd hash). */
  key: string;
  /** Human-readable goal label. */
  goal: string;
  /** Working directory where this learning session started. */
  cwd: string;
  /** Session file path (if available). */
  sessionFile?: string;
  /** Per-concept encoding depth data. */
  concepts: LearningState["concepts"];
  /** Bidirectional connections between concepts. */
  conceptConnections: LearningState["conceptConnections"];
  /** Difficulty tier data. */
  difficulty: LearningState["difficulty"];
  /** Metacognition state. */
  metacognition: LearningState["metacognition"];
  /** Timestamps. */
  createdAt: number;
  updatedAt: number;
}

/**
 * Derive a stable key for a learning context.
 * Uses the goal text (normalized) so the same topic resumes across sessions.
 */
export function deriveKey(goal: string): string {
  return goal
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Save learning state to the persistent index.
 */
export function saveToIndex(
  state: LearningState,
  cwd: string,
  sessionFile?: string,
): void {
  if (!state.goal) return;

  const key = deriveKey(state.goal);
  const now = Date.now();

  const entry: LearningIndexEntry = {
    key,
    goal: state.goal,
    cwd,
    sessionFile,
    concepts: { ...state.concepts },
    conceptConnections: [...state.conceptConnections],
    difficulty: { ...state.difficulty },
    metacognition: { ...state.metacognition },
    createdAt: now, // will be overwritten if merging with existing
    updatedAt: now,
  };

  // Read existing entries to merge
  const entries = readIndex();
  const existing = entries.find((e) => e.key === key);
  if (existing) {
    entry.createdAt = existing.createdAt;
  }

  // Filter out old entry and add updated one
  const updated = entries.filter((e) => e.key !== key);
  updated.push(entry);

  writeFileSync(
    INDEX_PATH,
    updated.map((e) => JSON.stringify(e)).join("\n") + "\n",
    "utf8",
  );
}

/**
 * Load learning state from the persistent index for a given goal.
 * Returns null if no matching entry exists.
 */
export function loadFromIndex(goal: string): Partial<LearningState> | null {
  const key = deriveKey(goal);
  const entries = readIndex();
  const entry = entries.find((e) => e.key === key);

  if (!entry) return null;

  return {
    concepts: entry.concepts,
    conceptConnections: entry.conceptConnections,
    difficulty: entry.difficulty,
    metacognition: entry.metacognition,
  };
}

/**
 * Read all index entries, deduplicating by key (most recent wins).
 */
export function readIndex(): LearningIndexEntry[] {
  if (!existsSync(INDEX_PATH)) return [];

  const lines = readFileSync(INDEX_PATH, "utf8")
    .split("\n")
    .filter((l) => l.trim());

  const byKey = new Map<string, LearningIndexEntry>();

  for (const line of lines) {
    try {
      const entry: LearningIndexEntry = JSON.parse(line);
      const existing = byKey.get(entry.key);
      if (!existing || entry.updatedAt > existing.updatedAt) {
        byKey.set(entry.key, entry);
      }
    } catch {
      // Skip malformed lines
    }
  }

  return Array.from(byKey.values()).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );
}

/**
 * Get a summary of all learning contexts (for status display).
 */
export function listLearningContexts(): Array<{
  key: string;
  goal: string;
  updatedAt: Date;
  conceptCount: number;
}> {
  return readIndex().map((e) => ({
    key: e.key,
    goal: e.goal,
    updatedAt: new Date(e.updatedAt),
    conceptCount: Object.keys(e.concepts).length,
  }));
}

/**
 * Check if the user has completed the first-run onboarding.
 */
export function hasCompletedOnboarding(): boolean {
  return existsSync(ONBOARDING_MARKER);
}

/**
 * Mark onboarding as completed so it doesn't show again.
 */
export function markOnboardingComplete(): void {
  writeFileSync(ONBOARDING_MARKER, new Date().toISOString(), "utf8");
}
