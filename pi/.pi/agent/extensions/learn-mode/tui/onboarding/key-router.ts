/**
 * Key routing for the onboarding overlay.
 */

import { matchesKey, Key } from "@earendil-works/pi-tui";
import type { OnboardingAction } from "./types.js";

export function routeKey(data: string): OnboardingAction | null {
	if (matchesKey(data, Key.escape)) return { kind: "dismiss" };
	if (matchesKey(data, Key.enter) || matchesKey(data, Key.down) || matchesKey(data, Key.tab)) return { kind: "next" };
	if (matchesKey(data, Key.up)) return { kind: "back" };
	return null;
}
