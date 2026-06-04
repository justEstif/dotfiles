/**
 * Settings panel types.
 */

import type { LearningPreferences } from "../../lib/types.js";

export interface SettingsState {
	preferences: LearningPreferences;
	focusIndex: number;
	/** Which setting is being edited (null = browsing). */
	editing: string | null;
	/** Temp value for the setting being edited. */
	editValue: string;
}

export type SettingsAction =
	| { kind: "nav_up" }
	| { kind: "nav_down" }
	| { kind: "select" }
	| { kind: "cancel" }
	| { kind: "dismiss" }
	| { kind: "cycle_value" };

export type SettingsEffect =
	| { kind: "done"; preferences: LearningPreferences }
	| { kind: "dismiss" };

export interface SettingsApplyResult {
	state: SettingsState;
	effects: SettingsEffect[];
}

export interface SettingDef {
	key: keyof LearningPreferences;
	label: string;
	description: string;
	options: Array<{ value: string; label: string }>;
}
