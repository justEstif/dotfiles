/**
 * Metrics row — tier, concept count, avg depth, connection density.
 */

import { truncateToWidth } from "@earendil-works/pi-tui";
import type { Theme } from "@earendil-works/pi-coding-agent";
import type { DifficultyTier } from "../../../engine/types.js";
import { CachedView } from "../stateful-view.js";
import type { MetricsProps } from "../types.js";

const TIER_LABEL: Record<DifficultyTier, string> = {
	guided: "Guided",
	scaffolded: "Scaffolded",
	independent: "Independent",
};

export class MetricsView extends CachedView<MetricsProps> {
	constructor(private theme: Theme) { super(); }

	protected buildLines(width: number): string[] {
		const t = this.theme;
		const w = width;
		const p = this.props;

		const density = `${Math.round(p.connectionDensity * 100)}%`;
		const avgDepth = `${Math.round(p.avgDepth * 100)}%`;

		return [
			truncateToWidth(
				[
					t.fg("accent", `Tier: ${TIER_LABEL[p.tier]}`),
					t.fg("text", "  │  "),
					t.fg("text", `Concepts: ${p.conceptCount}`),
					t.fg("text", "  │  "),
					t.fg("success", `Depth: ${avgDepth}`),
					t.fg("text", "  │  "),
					t.fg("warning", `Connections: ${density}`),
				].join(""),
				w,
			),
			truncateToWidth(
				t.fg("dim", "─".repeat(Math.min(w - 2, 70))),
				w,
			),
		];
	}
}
