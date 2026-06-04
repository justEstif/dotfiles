/**
 * Key routing — maps raw keystroke data to typed DashboardAction.
 *
 * Single function, no side effects. Follows rpiv pattern of discriminated
 * union output. Unrecognized keys produce nothing (caller ignores them).
 */

import { matchesKey, Key } from "@earendil-works/pi-tui";
import type { DashboardAction } from "./types.js";

export function routeKey(data: string): DashboardAction | null {
	if (matchesKey(data, Key.escape)) return { kind: "cancel" };
	if (matchesKey(data, Key.tab)) return { kind: "switch_section" };
	if (matchesKey(data, Key.down)) return { kind: "nav_down" };
	if (matchesKey(data, Key.up)) return { kind: "nav_up" };
	if (matchesKey(data, Key.enter)) return { kind: "select" };
	return null;
}
