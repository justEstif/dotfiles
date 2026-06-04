/**
 * Dashboard session — orchestrator that wires key routing → reducer → effect runner → adapter.
 *
 * Owns the canonical state cell. Exposes flat { render, invalidate, handleInput }
 * to pi-tui. Follows the rpiv QuestionnaireSession pattern.
 */

import type { Theme } from "@earendil-works/pi-coding-agent";
import type { ConceptMastery } from "../../src/engine/types.js";
import type { DashboardData, DashboardState, DashboardEffect } from "./types.js";
import { routeKey } from "./key-router.js";
import { reduce } from "./state-reducer.js";
import { DashboardPropsAdapter } from "./props-adapter.js";
import { HeaderView } from "./components/header.js";
import { MetricsView } from "./components/metrics.js";
import { ConceptListView } from "./components/concept-list.js";
import { SuggestionsView } from "./components/suggestions.js";
import { DueChecksView } from "./components/due-checks.js";
import { InterleavingView } from "./components/interleaving.js";
import { ActionsView } from "./components/actions.js";

const CONCEPT_VIEWPORT = 8;

export interface DashboardSessionComponent {
	render(width: number): string[];
	invalidate(): void;
	handleInput(data: string): void;
}

export class DashboardSession {
	private state: DashboardState;
	private readonly adapter: DashboardPropsAdapter;
	private readonly done: (result: string | null) => void;
	private readonly conceptsMap: Record<string, ConceptMastery>;

	readonly component: DashboardSessionComponent;

	constructor(
		data: DashboardData,
		theme: Theme,
		tui: { requestRender(): void },
		done: (result: string | null) => void,
	) {
		this.done = done;
		this.conceptsMap = data.concepts;
		this.state = {
			data,
			focus: "concepts",
			conceptScrollY: 0,
			actionIndex: 0,
			conceptViewport: CONCEPT_VIEWPORT,
		};

		// Build components
		const components = {
			header: new HeaderView(theme),
			metrics: new MetricsView(theme),
			conceptList: new ConceptListView(theme, this.conceptsMap),
			suggestions: new SuggestionsView(theme),
			dueChecks: new DueChecksView(theme),
			interleaving: new InterleavingView(theme),
			actions: new ActionsView(theme),
		};

		this.adapter = new DashboardPropsAdapter(components, theme, tui);

		this.component = {
			render: (width: number) => {
				const lines: string[] = [];
				lines.push(...components.header.render(width));
				lines.push(...components.metrics.render(width));
				lines.push(...components.conceptList.render(width));
				lines.push(...components.suggestions.render(width));
				lines.push(...components.dueChecks.render(width));
				lines.push(...components.interleaving.render(width));
				lines.push(...components.actions.render(width));
				return lines;
			},
			invalidate: () => this.adapter.invalidate(),
			handleInput: (data: string) => this.dispatch(data),
		};

		// Initial push
		this.adapter.apply(this.state);
	}

	/** Update data (e.g., after engine state changes). */
	updateData(data: DashboardData): void {
		this.state = { ...this.state, data };
		this.adapter.apply(this.state);
	}

	private dispatch(data: string): void {
		const action = routeKey(data);
		if (!action) return;
		this.commit(action);
	}

	private commit(action: ReturnType<typeof routeKey> & {}): void {
		const result = reduce(this.state, action);
		this.state = result.state;
		for (const effect of result.effects) {
			this.runEffect(effect);
		}
		this.adapter.apply(this.state);
	}

	private runEffect(effect: DashboardEffect): void {
		switch (effect.kind) {
			case "done":
				this.done(effect.result);
				return;
		}
	}
}
