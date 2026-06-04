/**
 * Pure reducer — state transitions for the dashboard.
 *
 * Takes current state + action, returns { state, effects[] }.
 * No side effects. Fully testable. Follows rpiv pattern.
 */

import type { DashboardState, DashboardAction, ApplyResult } from "./types.js";

const ACTIONS = [
	{ id: "exercise", label: "Start Exercise", description: "Encoding challenge at your tier" },
	{ id: "review", label: "Run Review", description: "Cross-topic connection check" },
	{ id: "define", label: "Define Term", description: "Look up a concept" },
	{ id: "status", label: "Full Status", description: "Print status to chat" },
	{ id: "off", label: "Exit Learning", description: "Turn off learning mode" },
];

export { ACTIONS };

export function reduce(state: DashboardState, action: DashboardAction): ApplyResult {
	switch (action.kind) {
		case "cancel":
			return { state, effects: [{ kind: "done", result: null }] };

		case "switch_section": {
			const next = state.focus === "concepts" ? "actions" : "concepts";
			return {
				state: { ...state, focus: next, actionIndex: 0, conceptScrollY: 0 },
				effects: [],
			};
		}

		case "nav_up":
			return state.focus === "concepts"
				? reduceConceptScroll(state, -1)
				: reduceActionIndex(state, -1);

		case "nav_down":
			return state.focus === "concepts"
				? reduceConceptScroll(state, 1)
				: reduceActionIndex(state, 1);

		case "select": {
			if (state.focus !== "actions") return { state, effects: [] };
			const action = ACTIONS[state.actionIndex];
			if (!action) return { state, effects: [] };
			return { state, effects: [{ kind: "done", result: action.id }] };
		}
	}
}

// ── Helpers ─────────────────────────────────────────────────────

function conceptCount(state: DashboardState): number {
	return Object.values(state.data.concepts).filter(
		(c) => c.encodingDepth !== "surface" || c.repetitions > 0,
	).length;
}

function reduceConceptScroll(state: DashboardState, delta: number): ApplyResult {
	const max = Math.max(0, conceptCount(state) - state.conceptViewport);
	const next = Math.max(0, Math.min(state.conceptScrollY + delta, max));
	if (next === state.conceptScrollY) return { state, effects: [] };
	return { state: { ...state, conceptScrollY: next }, effects: [] };
}

function reduceActionIndex(state: DashboardState, delta: number): ApplyResult {
	const next = Math.max(0, Math.min(state.actionIndex + delta, ACTIONS.length - 1));
	if (next === state.actionIndex) return { state, effects: [] };
	return { state: { ...state, actionIndex: next }, effects: [] };
}
