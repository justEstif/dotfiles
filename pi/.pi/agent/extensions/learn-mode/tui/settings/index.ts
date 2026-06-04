/**
 * Settings panel public API.
 */

import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { LearningPreferences } from "../../src/types.js";
import { loadPreferences, savePreferences } from "../../src/preferences.js";
import { SettingsSession } from "./session.js";

export async function showSettingsPanel(ctx: ExtensionContext): Promise<LearningPreferences | null> {
	const prefs = loadPreferences();

	const result = await ctx.ui.custom<LearningPreferences | null>((tui, theme, _kb, done) => {
		const session = new SettingsSession(prefs, theme, done);

		return {
			render: (w: number) => session.component.render(w),
			invalidate: () => session.component.invalidate(),
			handleInput: (data: string) => {
				session.component.handleInput(data);
				tui.requestRender();
			},
		};
	}, {
		overlay: true,
		overlayOptions: {
			width: "50%",
			minWidth: 45,
			maxHeight: "60%",
			anchor: "center",
			margin: 2,
		},
	});

	if (result) {
		savePreferences(result);
	}

	return result;
}
