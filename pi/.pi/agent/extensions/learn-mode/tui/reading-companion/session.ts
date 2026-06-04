/**
 * Reading companion session — orchestrator.
 *
 * Owns the state cell, wires key routing → reducer → effect runner → adapter.
 * Supports collapsed mode (single hint row) like the rpiv pattern.
 */

import type { Theme } from "@earendil-works/pi-coding-agent";
import type { ReadingCompanionData, ReadingCompanionState, CompanionEffect } from "./types.js";
import { routeKey } from "./key-router.js";
import { reduce } from "./state-reducer.js";
import { CompanionPropsAdapter } from "./props-adapter.js";
import {
	CompanionHeaderView,
	CompanionMetricsView,
	CompanionConceptsView,
	CompanionHintsView,
} from "./components.js";

const CONCEPT_VIEWPORT = 5;

export interface CompanionSessionComponent {
	render(width: number): string[];
	invalidate(): void;
	handleInput(data: string): void;
}

export class ReadingCompanionSession {
	private state: ReadingCompanionState;
	private readonly adapter: CompanionPropsAdapter;
	private readonly done: (result: string | null) => void;
	private collapsed = false;
	private readonly theme: Theme;

	readonly component: CompanionSessionComponent;

	constructor(
		data: ReadingCompanionData,
		theme: Theme,
		tui: { requestRender(): void },
		done: (result: string | null) => void,
	) {
		this.done = done;
		this.theme = theme;
		this.state = {
			data,
			phase: data.isPrimed ? "reading" : "priming",
			focus: "info",
			scrollY: 0,
			viewport: CONCEPT_VIEWPORT,
		};

		const components = {
			header: new CompanionHeaderView(theme),
			metrics: new CompanionMetricsView(theme),
			concepts: new CompanionConceptsView(theme),
			hints: new CompanionHintsView(theme),
		};

		this.adapter = new CompanionPropsAdapter(components, tui);

		const collapsedRender = (_w: number): string[] => [
			theme.fg("dim", ` 📖 Reading: ${data.resourceTitle} · ctrl+] expand`),
		];

		this.component = {
			render: (width: number) => {
				if (this.collapsed) return collapsedRender(width);
				const lines: string[] = [];
				lines.push(...components.header.render(width));
				lines.push(...components.metrics.render(width));
				lines.push(...components.concepts.render(width));
				lines.push(...components.hints.render(width));
				return lines;
			},
			invalidate: () => this.adapter.invalidate(),
			handleInput: (data: string) => this.dispatch(data),
		};

		this.adapter.apply(this.state);
	}

	updateData(data: ReadingCompanionData): void {
		const phase = data.isPrimed ? "reading" : "priming";
		this.state = { ...this.state, data, phase };
		this.adapter.apply(this.state);
	}

	private dispatch(data: string): void {
		const action = routeKey(data);
		if (!action) return;
		this.commit(action);
	}

	private commit(action: NonNullable<ReturnType<typeof routeKey>>): void {
		const result = reduce(this.state, action);
		this.state = result.state;
		for (const effect of result.effects) {
			this.runEffect(effect);
		}
		this.adapter.apply(this.state);
	}

	private runEffect(effect: CompanionEffect): void {
		switch (effect.kind) {
			case "done":
				this.done(effect.result);
				return;
			case "collapsed":
				this.collapsed = true;
				return;
			case "expanded":
				this.collapsed = false;
				return;
		}
	}
}
