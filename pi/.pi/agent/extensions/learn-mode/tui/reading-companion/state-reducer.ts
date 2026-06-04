/**
 * Pure reducer for the reading companion.
 */

import type { ReadingCompanionState, CompanionAction, CompanionApplyResult } from "./types.js";

export function reduce(state: ReadingCompanionState, action: CompanionAction): CompanionApplyResult {
	switch (action.kind) {
		case "dismiss":
			return { state, effects: [{ kind: "done", result: null }] };

		case "switch_section": {
			const next = state.focus === "info" ? "concepts" : "info";
			return { state: { ...state, focus: next, scrollY: 0 }, effects: [] };
		}

		case "nav_up":
			return reduceScroll(state, -1);

		case "nav_down":
			return reduceScroll(state, 1);

		case "toggle_collapse":
			return { state, effects: [{ kind: "collapsed" }] };
	}
}

function reduceScroll(state: ReadingCompanionState, delta: number): CompanionApplyResult {
	if (state.focus !== "concepts") return { state, effects: [] };
	const max = Math.max(0, state.data.relevantConcepts.length - state.viewport);
	const next = Math.max(0, Math.min(state.scrollY + delta, max));
	if (next === state.scrollY) return { state, effects: [] };
	return { state: { ...state, scrollY: next }, effects: [] };
}
