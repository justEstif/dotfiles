/**
 * Reading companion components — StatefulView<P> implementations.
 */

import { truncateToWidth } from "@earendil-works/pi-tui";
import type { Theme, ThemeColor } from "@earendil-works/pi-coding-agent";
import type { EncodingDepth, DifficultyTier } from "../../engine/types.js";
import { CachedView } from "../dashboard/stateful-view.js";
import type {
	CompanionHeaderProps,
	CompanionMetricsProps,
	CompanionConceptsProps,
	CompanionHintsProps,
	CompanionPhase,
} from "./types.js";

const DEPTH_SYMBOL: Record<EncodingDepth, string> = {
	surface: "○",
	relational: "◐",
	deep: "◑",
	transferable: "●",
};

const DEPTH_COLOR: Record<EncodingDepth, ThemeColor> = {
	surface: "dim",
	relational: "muted",
	deep: "success",
	transferable: "warning",
};

const TIER_LABEL: Record<DifficultyTier, string> = {
	guided: "Guided",
	scaffolded: "Scaffolded",
	independent: "Independent",
};

const PHASE_LABEL: Record<CompanionPhase, string> = {
	priming: "📋 Priming",
	reading: "📖 Reading",
	synthesis: "🧠 Synthesis",
};

// ── Header ─────────────────────────────────────────────────────

export class CompanionHeaderView extends CachedView<CompanionHeaderProps> {
	constructor(private theme: Theme) { super(); }

	protected buildLines(width: number): string[] {
		const t = this.theme;
		const p = this.props;
		return [
			truncateToWidth(t.fg("accent", t.bold(`  📖 ${PHASE_LABEL[p.phase]}`)), width),
			truncateToWidth(t.fg("muted", `  ${p.resourceTitle}`), width),
			"",
		];
	}
}

// ── Metrics ────────────────────────────────────────────────────

export class CompanionMetricsView extends CachedView<CompanionMetricsProps> {
	constructor(private theme: Theme) { super(); }

	protected buildLines(width: number): string[] {
		const t = this.theme;
		const w = width;
		const p = this.props;
		return [
			truncateToWidth(
				[
					t.fg("accent", `Tier: ${TIER_LABEL[p.tier]}`),
					t.fg("text", "  │  "),
					t.fg("text", `Concepts: ${p.totalConcepts}`),
					t.fg("text", "  │  "),
					t.fg("success", `Depth: ${Math.round(p.avgDepth * 100)}%`),
					t.fg("text", "  │  "),
					t.fg("warning", `Links: ${Math.round(p.connectionDensity * 100)}%`),
				].join(""),
				w,
			),
			truncateToWidth(t.fg("dim", "─".repeat(Math.min(w - 2, 60))), w),
		];
	}
}

// ── Concept list ───────────────────────────────────────────────

export class CompanionConceptsView extends CachedView<CompanionConceptsProps> {
	constructor(private theme: Theme) { super(); }

	protected buildLines(width: number): string[] {
		const t = this.theme;
		const w = width;
		const p = this.props;

		if (p.items.length === 0) {
			return [t.fg("muted", "  No prior concepts match this resource."), ""];
		}

		const lines: string[] = [
			truncateToWidth(
				t.fg(p.focused ? "accent" : "muted", "  Relevant Concepts (tab to switch)"),
				w,
			),
		];

		const visible = p.items.slice(p.scrollY, p.scrollY + p.viewport);
		for (const item of visible) {
			const symbol = t.fg(DEPTH_COLOR[item.depth], DEPTH_SYMBOL[item.depth]);
			const label = t.fg("text", item.label);
			lines.push(truncateToWidth(`  ${symbol} ${label}`, w));
		}

		if (p.items.length > p.viewport) {
			const end = Math.min(p.scrollY + p.viewport, p.items.length);
			lines.push(truncateToWidth(t.fg("dim", `  ${p.scrollY + 1}–${end} of ${p.items.length}`), w));
		}

		lines.push("");
		return lines;
	}
}

// ── Hints ──────────────────────────────────────────────────────

export class CompanionHintsView extends CachedView<CompanionHintsProps> {
	constructor(private theme: Theme) { super(); }

	protected buildLines(width: number): string[] {
		const t = this.theme;
		const p = this.props;

		let hint: string;
		switch (p.phase) {
			case "priming":
				hint = p.isPrimed
					? "Ready to read — the tutor will check encoding as you go"
					: "Answer the priming question before diving in";
				break;
			case "reading":
				hint = "Reading along — tutor will ask encoding questions after sections";
				break;
			case "synthesis":
				hint = "Wrapping up — answer the synthesis questions";
				break;
		}

		return [
			truncateToWidth(t.fg("dim", `  💡 ${hint}`), width),
			truncateToWidth(t.fg("dim", "  ↑↓ scroll • esc close"), width),
		];
	}
}
