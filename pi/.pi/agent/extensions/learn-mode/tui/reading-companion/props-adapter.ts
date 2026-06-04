/**
 * Props adapter for the reading companion — fans state to all components.
 */

import type { Theme } from "@earendil-works/pi-coding-agent";
import type { ReadingCompanionState } from "./types.js";
import type { StatefulView } from "../dashboard/stateful-view.js";
import type {
	CompanionHeaderProps,
	CompanionMetricsProps,
	CompanionConceptsProps,
	CompanionHintsProps,
} from "./types.js";

const PHASE_LABEL: Record<string, string> = {
	priming: "Pre-reading schema activation",
	reading: "Active encoding checks",
	synthesis: "Connecting to prior knowledge",
};

interface CompanionComponents {
	header: StatefulView<CompanionHeaderProps>;
	metrics: StatefulView<CompanionMetricsProps>;
	concepts: StatefulView<CompanionConceptsProps>;
	hints: StatefulView<CompanionHintsProps>;
}

export class CompanionPropsAdapter {
	private readonly components: CompanionComponents;
	private readonly tui: { requestRender(): void };

	constructor(components: CompanionComponents, tui: { requestRender(): void }) {
		this.components = components;
		this.tui = tui;
	}

	apply(state: ReadingCompanionState): void {
		const data = state.data;

		this.components.header.setProps({
			resourceTitle: data.resourceTitle,
			phase: state.phase,
			phaseLabel: PHASE_LABEL[state.phase],
		});

		this.components.metrics.setProps({
			totalConcepts: data.totalConcepts,
			avgDepth: data.avgEncodingDepth,
			connectionDensity: data.connectionDensity,
			tier: data.tier,
		});

		this.components.concepts.setProps({
			items: data.relevantConcepts,
			scrollY: state.scrollY,
			viewport: state.viewport,
			focused: state.focus === "concepts",
		});

		this.components.hints.setProps({
			phase: state.phase,
			isPrimed: data.isPrimed,
		});

		this.tui.requestRender();
	}

	invalidate(): void {
		this.components.header.invalidate();
		this.components.metrics.invalidate();
		this.components.concepts.invalidate();
		this.components.hints.invalidate();
	}
}
