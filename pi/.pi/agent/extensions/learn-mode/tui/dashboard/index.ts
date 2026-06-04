/**
 * Dashboard public API — showDashboard().
 *
 * Creates a DashboardSession and displays it as a pi-tui custom overlay.
 * Returns the selected action ID or null if cancelled.
 */

import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { StateContainer } from "../../src/state-container.js";
import {
	getConnectionDensity,
	getAverageEncodingDepth,
	getSuggestedConnections,
	getDueConcepts,
	getNextReviewLabel,
} from "../../src/engine/index.js";
import type { DashboardData } from "./types.js";
import { DashboardSession } from "./session.js";
import { getInterleavingOpportunities } from "../interleaving/index.js";

export async function showDashboard(
	ctx: ExtensionContext,
	sc: StateContainer,
): Promise<string | null> {
	const density = getConnectionDensity(sc.state.concepts, sc.state.conceptConnections);
	const avgDepth = getAverageEncodingDepth(sc.state.concepts);
	const suggestions = getSuggestedConnections(sc.state.concepts, sc.state.conceptConnections);
	const dueConcepts = getDueConcepts(sc.state.concepts);

	const data: DashboardData = {
		goal: sc.state.workingGoal || sc.state.goal || "(not set)",
		tier: sc.state.difficulty.tier,
		concepts: sc.state.concepts,
		connections: sc.state.conceptConnections,
		avgEncodingDepth: avgDepth,
		connectionDensity: density,
		suggestedConnections: suggestions.map((s) => ({
			fromLabel: s.fromLabel,
			toLabel: s.toLabel,
		})),
		dueChecks: dueConcepts.map((c) => ({
			label: c.label,
			depth: c.encodingDepth,
			dueLabel: getNextReviewLabel(c),
		})),
		isActive: sc.state.active,
		interleaving: getInterleavingOpportunities(sc.state.concepts, sc.state.conceptConnections),
	};

	return ctx.ui.custom<string | null>((tui, theme, _kb, done) => {
		const session = new DashboardSession(data, theme, tui, done);

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
			width: "60%",
			minWidth: 50,
			maxHeight: "80%",
			anchor: "center",
			margin: 2,
		},
	});
}

export { DashboardSession } from "./session.js";
