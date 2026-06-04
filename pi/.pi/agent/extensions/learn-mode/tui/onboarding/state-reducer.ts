/**
 * Pure reducer for the onboarding overlay.
 */

import type { OnboardingState, OnboardingAction, OnboardingApplyResult } from "./types.js";

const STEPS = ["welcome", "philosophy", "shortcuts", "ready"] as const;

export function reduce(state: OnboardingState, action: OnboardingAction): OnboardingApplyResult {
	switch (action.kind) {
		case "dismiss":
			return { state, effects: [{ kind: "done" }] };
		case "next": {
			const idx = STEPS.indexOf(state.step);
			if (idx >= STEPS.length - 1) {
				return { state, effects: [{ kind: "done" }] };
			}
			return { state: { step: STEPS[idx + 1]! }, effects: [] };
		}
		case "back": {
			const idx = STEPS.indexOf(state.step);
			if (idx <= 0) return { state, effects: [] };
			return { state: { step: STEPS[idx - 1]! }, effects: [] };
		}
	}
}

export { STEPS };
