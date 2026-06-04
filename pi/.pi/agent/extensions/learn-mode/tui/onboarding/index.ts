/**
 * Onboarding public API — show first-run welcome overlay.
 *
 * Shows a multi-step onboarding explaining the extension's philosophy,
 * keyboard shortcuts, and how to get started. Triggered on first `/learn`.
 */

import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { OnboardingSession } from "./session.js";

export async function showOnboarding(ctx: ExtensionContext): Promise<void> {
	await ctx.ui.custom<void>((tui, theme, _kb, done) => {
		const session = new OnboardingSession(theme, done);

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
			width: "55%",
			minWidth: 50,
			maxHeight: "70%",
			anchor: "center",
			margin: 2,
		},
	});
}
