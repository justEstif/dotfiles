/**
 * Props adapter — fans canonical DashboardState out to all StatefulView components.
 *
 * Each component receives a computed props slice derived from state by a selector.
 * The adapter calls setProps() on every component then requests a render.
 *
 * Follows the rpiv-ask-user-question binding/adapter pattern.
 */

import type { Theme, ThemeColor } from "@earendil-works/pi-coding-agent";
import type { ConceptMastery, EncodingDepth } from "../../src/engine/types.js";
import type { DashboardState } from "./types.js";
import type { StatefulView } from "./stateful-view.js";
import type { HeaderProps } from "./types.js";
import type { MetricsProps } from "./types.js";
import type { ConceptListProps } from "./types.js";
import type { SuggestionsProps } from "./types.js";
import type { DueChecksProps } from "./types.js";
import type { ActionsProps } from "./types.js";
import type { InterleavingProps } from "./components/interleaving.js";
import { ACTIONS } from "./state-reducer.js";

// Depth symbols for concept line rendering
const DEPTH_SYMBOL: Record<EncodingDepth, string> = {
	surface: "○",
	relational: "◐",
	deep: "◑",
	transferable: "●",
};

function depthColor(depth: EncodingDepth): ThemeColor {
	switch (depth) {
		case "surface": return "dim";
		case "relational": return "muted";
		case "deep": return "success";
		case "transferable": return "warning";
	}
}

interface AdapterComponents {
	header: StatefulView<HeaderProps>;
	metrics: StatefulView<MetricsProps>;
	conceptList: StatefulView<ConceptListProps>;
	suggestions: StatefulView<SuggestionsProps>;
	dueChecks: StatefulView<DueChecksProps>;
	interleaving: StatefulView<InterleavingProps>;
	actions: StatefulView<ActionsProps>;
}

export class DashboardPropsAdapter {
	private readonly components: AdapterComponents;
	private readonly theme: Theme;
	private readonly tui: { requestRender(): void };

	constructor(
		components: AdapterComponents,
		theme: Theme,
		tui: { requestRender(): void },
	) {
		this.components = components;
		this.theme = theme;
		this.tui = tui;
	}

	/** Push state to all components, then request render. */
	apply(state: DashboardState): void {
		const t = this.theme;
		const data = state.data;

		// Header
		this.components.header.setProps({
			goal: data.goal || "(not set)",
			focused: false, // header never has focus
		});

		// Metrics
		const conceptCount = Object.values(data.concepts).filter(
			(c) => c.encodingDepth !== "surface" || c.repetitions > 0,
		).length;
		this.components.metrics.setProps({
			tier: data.tier,
			conceptCount,
			avgDepth: data.avgEncodingDepth,
			connectionDensity: data.connectionDensity,
		});

		// Concept list — build lines from data
		const conceptLines = this.buildConceptLines(data.concepts, t);
		this.components.conceptList.setProps({
			lines: conceptLines,
			scrollY: state.conceptScrollY,
			viewportHeight: state.conceptViewport,
			totalLines: conceptLines.length,
			focused: state.focus === "concepts",
		});

		// Suggestions
		this.components.suggestions.setProps({
			items: data.suggestedConnections,
		});

		// Due checks
		this.components.dueChecks.setProps({
			items: data.dueChecks,
		});

		// Interleaving
		this.components.interleaving.setProps({
			items: data.interleaving,
		});

		// Actions
		this.components.actions.setProps({
			items: ACTIONS.map((a) => ({ id: a.id, label: a.label, description: a.description })),
			selectedIndex: state.actionIndex,
			focused: state.focus === "actions",
		});

		this.tui.requestRender();
	}

	/** Invalidate all components. */
	invalidate(): void {
		this.components.header.invalidate();
		this.components.metrics.invalidate();
		this.components.conceptList.invalidate();
		this.components.suggestions.invalidate();
		this.components.dueChecks.invalidate();
		this.components.interleaving.invalidate();
		this.components.actions.invalidate();
	}

	// ── Concept line builder ──────────────────────────────────

	private buildConceptLines(
		concepts: Record<string, ConceptMastery>,
		t: Theme,
	): string[] {
		const entries = Object.values(concepts).filter(
			(c) => c.encodingDepth !== "surface" || c.repetitions > 0,
		);
		if (entries.length === 0) return [];

		// Sort by prerequisite depth then label
		const sorted = [...entries].sort((a, b) => {
			const aDepth = a.prerequisites.length;
			const bDepth = b.prerequisites.length;
			return aDepth - bDepth || a.label.localeCompare(b.label);
		});

		return sorted.map((c) => {
			const symbol = t.fg(
				depthColor(c.encodingDepth),
				DEPTH_SYMBOL[c.encodingDepth],
			);
			const label = t.fg("text", c.label);
			const connections = c.connections.length > 0
				? t.fg(
					"dim",
					` → ${c.connections
						.map((cId) => concepts[cId]?.label ?? cId)
						.join(", ")}`,
				)
				: "";
			return `  ${symbol} ${label}${connections}`;
		});
	}
}
