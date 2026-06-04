/**
 * Settings panel session — orchestrator.
 */

import { truncateToWidth } from "@earendil-works/pi-tui";
import type { Theme } from "@earendil-works/pi-coding-agent";
import type { LearningPreferences } from "../../lib/types.js";
import type { SettingsState, SettingsEffect } from "./types.js";
import { routeKey } from "./key-router.js";
import { reduce, SETTINGS } from "./state-reducer.js";

export interface SettingsSessionComponent {
	render(width: number): string[];
	invalidate(): void;
	handleInput(data: string): void;
}

export class SettingsSession {
	private state: SettingsState;
	private readonly theme: Theme;
	private readonly done: (result: LearningPreferences | null) => void;
	private cachedWidth?: number;
	private cachedLines?: string[];

	readonly component: SettingsSessionComponent;

	constructor(
		prefs: LearningPreferences,
		theme: Theme,
		done: (result: LearningPreferences | null) => void,
	) {
		this.theme = theme;
		this.done = done;
		this.state = {
			preferences: { ...prefs },
			focusIndex: 0,
			editing: null,
			editValue: "",
		};

		this.component = {
			render: (w: number) => this.render(w),
			invalidate: () => { this.cachedWidth = undefined; this.cachedLines = undefined; },
			handleInput: (data: string) => this.dispatch(data),
		};
	}

	private render(width: number): string[] {
		if (this.cachedLines && this.cachedWidth === width) return this.cachedLines;

		const t = this.theme;
		const w = width;
		const lines: string[] = [];

		lines.push(truncateToWidth(t.fg("accent", t.bold("  ⚙ Learning Preferences")), w));
		lines.push(truncateToWidth(t.fg("dim", "  Change a setting with → or space. esc to close."), w));
		lines.push(truncateToWidth(t.fg("dim", "─".repeat(Math.min(w - 4, 50))), w));

		for (let i = 0; i < SETTINGS.length; i++) {
			const s = SETTINGS[i]!;
			const focused = i === this.state.focusIndex;
			const val = String(this.state.preferences[s.key]);
			const opt = s.options.find((o) => o.value === val);

			const prefix = focused ? "  ▸ " : "    ";
			const label = focused
				? t.fg("accent", t.bold(s.label))
				: t.fg("text", s.label);
			const desc = t.fg("dim", ` — ${s.description}`);
			lines.push(truncateToWidth(`${prefix}${label}${desc}`, w));

			const valueStr = opt?.label ?? val;
			const valueLine = focused
				? t.fg("accent", `      ${valueStr}  ← →/space to change`)
				: t.fg("muted", `      ${valueStr}`);
			lines.push(truncateToWidth(valueLine, w));
		}

		lines.push("");
		lines.push(truncateToWidth(t.fg("dim", "─".repeat(Math.min(w - 4, 50))), w));
		lines.push(truncateToWidth(t.fg("success", "  Settings are saved automatically."), w));
		lines.push(truncateToWidth(t.fg("dim", "  ↑↓ navigate · →/space change · esc close"), w));

		this.cachedWidth = width;
		this.cachedLines = lines;
		return lines;
	}

	private dispatch(data: string): void {
		const action = routeKey(data, this.state.editing !== null);
		if (!action) return;

		const result = reduce(this.state, action);
		this.state = result.state;

		for (const effect of result.effects) {
			this.runEffect(effect);
		}

		this.cachedWidth = undefined;
		this.cachedLines = undefined;
	}

	private runEffect(effect: SettingsEffect): void {
		switch (effect.kind) {
			case "done":
				this.done(effect.preferences);
				return;
			case "dismiss":
				this.done(null);
				return;
		}
	}
}
