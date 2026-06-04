/**
 * Onboarding session — multi-step welcome overlay.
 *
 * Shows the learning tutor's philosophy, keyboard shortcuts, and
 * a quick-start prompt. Follows the same session pattern as dashboard
 * and reading companion.
 */

import { truncateToWidth } from "@earendil-works/pi-tui";
import type { Theme } from "@earendil-works/pi-coding-agent";
import type { OnboardingState, OnboardingEffect } from "./types.js";
import { routeKey } from "./key-router.js";
import { reduce, STEPS } from "./state-reducer.js";
import type { OnboardingStep } from "./types.js";

const STEP_TITLES: Record<OnboardingStep, string> = {
	welcome: "🎓 Welcome to Learning Mode",
	philosophy: "🧠 The Philosophy",
	shortcuts: "⌨️ Keyboard Shortcuts",
	ready: "🚀 Ready to Learn",
};

const STEP_CONTENT: Record<OnboardingStep, (t: Theme) => string[]> = {
	welcome: (t) => [
		t.fg("text", "This extension transforms how you learn alongside AI."),
		"",
		t.fg("text", "Instead of passive reading → highlight → forget,"),
		t.fg("text", "it injects active encoding INTO your reading flow."),
		"",
		t.fg("muted", "Based on research from:"),
		t.fg("dim", "  • Justin Sung — encoding-first learning"),
		t.fg("dim", "  • Bjork's desirable difficulties"),
		t.fg("dim", "  • Bloom's taxonomy — focus on analyze/evaluate/create"),
	],

	philosophy: (t) => [
		t.fg("accent", "The AI era changes what's worth learning."),
		"",
		t.fg("text", "❌ Don't compete with AI on:"),
		t.fg("dim", "    memorization, basic recall, simple application"),
		"",
		t.fg("text", "✅ Practice what AI can't do:"),
		t.fg("dim", "    analyze — compare approaches, find trade-offs"),
		t.fg("dim", "    evaluate — critique, prioritize, judge quality"),
		t.fg("dim", "    create — synthesize novel solutions from scratch"),
		"",
		t.fg("muted", "The tutor asks \"how is X different from Y?\""),
		t.fg("muted", "not \"what is X?\""),
	],

	shortcuts: (t) => [
		t.fg("text", "Commands:"),
		t.fg("dim", "  /learn <topic>      Start learning mode"),
		t.fg("dim", "  /learn read <url>   Reading companion mode"),
		t.fg("dim", "  /learn exercise     Encoding challenge"),
		t.fg("dim", "  /learn review       Cross-topic connection check"),
		t.fg("dim", "  /learn define       Look up a concept"),
		t.fg("dim", "  /learn act <req>    Allow AI edits for a task"),
		t.fg("dim", "  /learn status       Dashboard overlay"),
		t.fg("dim", "  /learn off          Exit learning mode"),
		"",
		t.fg("text", "Shortcuts:"),
		t.fg("dim", "  ctrl+shift+l       Dashboard overlay"),
		t.fg("dim", "  ctrl+shift+d       Define selected text"),
	],

	ready: (t) => [
		t.fg("text", "You're ready to start!"),
		"",
		t.fg("muted", "Try: /learn Rust ownership"),
		t.fg("muted", "Or:   /learn read https://blog.example.com/article"),
		"",
		t.fg("accent", "The tutor will:"),
		t.fg("dim", "  1. Prime you before reading (activate prior knowledge)"),
		t.fg("dim", "  2. Ask encoding questions (not recall questions)"),
		t.fg("dim", "  3. Track concept connections (relational learning)"),
		t.fg("dim", "  4. Schedule spaced reviews of encoding depth"),
		"",
		t.fg("success", "Press enter to begin."),
	],
};

export interface OnboardingSessionComponent {
	render(width: number): string[];
	invalidate(): void;
	handleInput(data: string): void;
}

export class OnboardingSession {
	private state: OnboardingState = { step: "welcome" };
	private readonly done: () => void;
	private readonly theme: Theme;
	private cachedWidth?: number;
	private cachedLines?: string[];

	readonly component: OnboardingSessionComponent;

	constructor(theme: Theme, done: () => void) {
		this.theme = theme;
		this.done = done;

		this.component = {
			render: (width: number) => this.render(width),
			invalidate: () => { this.cachedWidth = undefined; this.cachedLines = undefined; },
			handleInput: (data: string) => this.dispatch(data),
		};
	}

	private render(width: number): string[] {
		if (this.cachedLines && this.cachedWidth === width) return this.cachedLines;

		const t = this.theme;
		const w = width;
		const step = this.state.step;
		const idx = STEPS.indexOf(step);
		const total = STEPS.length;

		const lines: string[] = [];
		lines.push(truncateToWidth(t.fg("accent", t.bold(`  ${STEP_TITLES[step]}`)), w));
		lines.push(truncateToWidth(t.fg("dim", `  Step ${idx + 1} of ${total}`), w));
		lines.push(truncateToWidth(t.fg("dim", "─".repeat(Math.min(w - 4, 60))), w));
		lines.push("");

		const content = STEP_CONTENT[step](t);
		for (const line of content) {
			lines.push(truncateToWidth(`  ${line}`, w));
		}

		lines.push("");
		lines.push(truncateToWidth(t.fg("dim", "─".repeat(Math.min(w - 4, 60))), w));

		// Navigation hint
		const hints: string[] = [];
		if (idx > 0) hints.push("↑ back");
		hints.push(idx < total - 1 ? "enter next" : "enter start learning");
		hints.push("esc skip");
		lines.push(truncateToWidth(t.fg("dim", `  ${hints.join(" · ")}`), w));

		// Progress bar
		const filled = "●".repeat(idx + 1);
		const empty = "○".repeat(total - idx - 1);
		lines.push(truncateToWidth(t.fg("accent", `  ${filled}${empty}`), w));

		this.cachedWidth = width;
		this.cachedLines = lines;
		return lines;
	}

	private dispatch(data: string): void {
		const action = routeKey(data);
		if (!action) return;
		const result = reduce(this.state, action);
		this.state = result.state;
		for (const effect of result.effects) {
			if (effect.kind === "done") {
				this.done();
				return;
			}
		}
		this.invalidate();
	}

	private invalidate(): void {
		this.cachedWidth = undefined;
		this.cachedLines = undefined;
	}
}
