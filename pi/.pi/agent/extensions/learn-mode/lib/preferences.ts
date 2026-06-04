/**
 * Preferences persistence — global user preferences, not per-session.
 *
 * Stored as JSON at ~/.pi/agent/learning-preferences.json
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { LearningPreferences } from "./types.js";
import { DEFAULT_PREFERENCES } from "./types.js";

const PREFS_PATH = join(homedir(), ".pi", "agent", "learning-preferences.json");

export function loadPreferences(): LearningPreferences {
	if (!existsSync(PREFS_PATH)) return { ...DEFAULT_PREFERENCES };
	try {
		const raw = readFileSync(PREFS_PATH, "utf8");
		const parsed = JSON.parse(raw);
		// Merge with defaults so new fields get default values
		return { ...DEFAULT_PREFERENCES, ...parsed };
	} catch {
		return { ...DEFAULT_PREFERENCES };
	}
}

export function savePreferences(prefs: LearningPreferences): void {
	writeFileSync(PREFS_PATH, JSON.stringify(prefs, null, 2) + "\n", "utf8");
}
