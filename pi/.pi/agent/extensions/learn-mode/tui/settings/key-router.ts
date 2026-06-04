/**
 * Settings panel — key router.
 */

import { matchesKey, Key } from "@earendil-works/pi-tui";
import type { SettingsAction } from "./types.js";

export function routeKey(data: string, editing: boolean): SettingsAction | null {
	if (matchesKey(data, Key.escape)) return { kind: editing ? "cancel" : "dismiss" };
	if (matchesKey(data, Key.enter)) return { kind: editing ? "cancel" : "select" };
	if (matchesKey(data, Key.up)) return { kind: "nav_up" };
	if (matchesKey(data, Key.down)) return { kind: "nav_down" };
	if (matchesKey(data, Key.right) || data === " ") return { kind: "cycle_value" };
	return null;
}
