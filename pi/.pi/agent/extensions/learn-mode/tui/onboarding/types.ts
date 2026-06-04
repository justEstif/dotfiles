/**
 * Onboarding types — first-run welcome overlay.
 */

export type OnboardingStep = "welcome" | "philosophy" | "shortcuts" | "ready";

export interface OnboardingState {
	step: OnboardingStep;
}

export type OnboardingAction =
	| { kind: "next" }
	| { kind: "back" }
	| { kind: "dismiss" };

export type OnboardingEffect =
	| { kind: "done" };

export interface OnboardingApplyResult {
	state: OnboardingState;
	effects: OnboardingEffect[];
}
