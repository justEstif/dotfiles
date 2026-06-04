/**
 * Reading companion public API.
 *
 * Shows a companion overlay when the learner enters reading mode.
 * Triggered by `/learn read <url_or_title>` or automatically when
 * a URL/learning resource is detected.
 */

import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { StateContainer } from "../../lib/state-container.js";
import {
	getConnectionDensity,
	getAverageEncodingDepth,
	findRelevantSchemas,
} from "../../engine/index.js";
import type { ReadingCompanionData } from "./types.js";
import { ReadingCompanionSession } from "./session.js";

export async function showReadingCompanion(
	ctx: ExtensionContext,
	sc: StateContainer,
	resourceTitle: string,
	resourceSource: string,
): Promise<string | null> {
	const relevantConcepts = findRelevantSchemas(
		resourceTitle,
		sc.state.concepts,
	).map((c) => ({ label: c.label, depth: c.encodingDepth }));

	const data: ReadingCompanionData = {
		resourceTitle,
		resourceSource,
		relevantConcepts,
		avgEncodingDepth: getAverageEncodingDepth(sc.state.concepts),
		tier: sc.state.difficulty.tier,
		isPrimed: sc.state.priming.isPrimed,
		totalConcepts: Object.keys(sc.state.concepts).length,
		connectionDensity: getConnectionDensity(sc.state.concepts, sc.state.conceptConnections),
	};

	return ctx.ui.custom<string | null>((tui, theme, _kb, done) => {
		const session = new ReadingCompanionSession(data, theme, tui, done);

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
			width: "45%",
			minWidth: 40,
			maxHeight: "50%",
			anchor: "top-right",
			margin: 1,
		},
	});
}

export { ReadingCompanionSession } from "./session.js";
