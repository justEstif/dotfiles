/**
 * Settings panel — setting definitions and reducer.
 */

import type { LearningPreferences } from "../../src/types.js";
import type { SettingsState, SettingsAction, SettingsApplyResult, SettingDef } from "./types.js";

export const SETTINGS: SettingDef[] = [
	{
		key: "style",
		label: "Learning Style",
		description: "How you prefer to learn",
		options: [
			{ value: "reading", label: "Reading-first" },
			{ value: "exercise", label: "Exercise-first" },
			{ value: "mixed", label: "Mixed" },
		],
	},
	{
		key: "checkFrequency",
		label: "Check Frequency",
		description: "Tutor turns between encoding checks (3–15)",
		options: [
			{ value: "3", label: "Every 3 turns (frequent)" },
			{ value: "6", label: "Every 6 turns (balanced)" },
			{ value: "10", label: "Every 10 turns (sparse)" },
			{ value: "15", label: "Every 15 turns (minimal)" },
		],
	},
	{
		key: "scaffoldingLevel",
		label: "Scaffolding Level",
		description: "How much the tutor guides connections",
		options: [
			{ value: "guided", label: "Guided — tutor suggests connections" },
			{ value: "scaffolded", label: "Scaffolded — tutor asks for connections" },
			{ value: "independent", label: "Independent — you volunteer connections" },
		],
	},
	{
		key: "primingEnabled",
		label: "Pre-reading Priming",
		description: "Activate prior knowledge before reading",
		options: [
			{ value: "true", label: "Enabled" },
			{ value: "false", label: "Disabled" },
		],
	},
	{
		key: "showConceptWidget",
		label: "Concept Graph Widget",
		description: "Show live concept graph in status area",
		options: [
			{ value: "true", label: "Show" },
			{ value: "false", label: "Hide" },
		],
	},
];

export function reduce(state: SettingsState, action: SettingsAction): SettingsApplyResult {
	const setting = SETTINGS[state.focusIndex];
	if (!setting) return { state, effects: [{ kind: "dismiss" }] };

	switch (action.kind) {
		case "dismiss":
			return { state, effects: [{ kind: "dismiss" }] };

		case "nav_up": {
			const next = Math.max(0, state.focusIndex - 1);
			return { state: { ...state, focusIndex: next }, effects: [] };
		}

		case "nav_down": {
			const next = Math.min(SETTINGS.length - 1, state.focusIndex + 1);
			return { state: { ...state, focusIndex: next }, effects: [] };
		}

		case "dismiss":
			return { state, effects: [{ kind: "dismiss" }] };

		case "select":
		case "cancel":
			// In this design, select/cycle changes values inline, select on last line saves
			return { state, effects: [] };

		case "cycle_value": {
			const prefs = { ...state.preferences };
			const current = String(prefs[setting.key]);
			const opts = setting.options;
			const idx = opts.findIndex((o) => o.value === current);
			const nextIdx = (idx + 1) % opts.length;
			const nextVal = opts[nextIdx]!.value;

			// Type-correct assignment
			(prefs as Record<string, unknown>)[setting.key] =
				setting.key === "checkFrequency"
					? parseInt(nextVal, 10)
					: setting.key === "primingEnabled" || setting.key === "showConceptWidget"
						? nextVal === "true"
						: nextVal;

			return { state: { ...state, preferences: prefs }, effects: [] };
		}
	}
}
