/**
 * Key routing for the reading companion.
 */

import { matchesKey, Key } from "@earendil-works/pi-tui";
import type { CompanionAction } from "./types.js";

export function routeKey(data: string): CompanionAction | null {
	if (matchesKey(data, Key.escape)) return { kind: "dismiss" };
	if (matchesKey(data, Key.tab)) return { kind: "switch_section" };
	if (matchesKey(data, Key.down)) return { kind: "nav_down" };
	if (matchesKey(data, Key.up)) return { kind: "nav_up" };
	// Ctrl+] to toggle collapse (matching rpiv pattern)
	if (data === "\x1d") return { kind: "toggle_collapse" };
	return null;
}
