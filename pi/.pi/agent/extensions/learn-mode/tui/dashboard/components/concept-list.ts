/**
 * Concept list section — scrollable concept graph with encoding-depth symbols.
 *
 * Uses 3-region partition:
 * - Sticky header ("Concepts" label)
 * - Scrollable middle (concepts, scroll-to-focus)
 * - Sticky footer (scroll indicator)
 */

import { truncateToWidth } from "@earendil-works/pi-tui";
import type { Theme } from "@earendil-works/pi-coding-agent";
import type { ConceptMastery, EncodingDepth } from "../../../src/engine/types.js";
import { CachedView } from "../stateful-view.js";
import type { ConceptListProps } from "../types.js";

const DEPTH_SYMBOL: Record<EncodingDepth, string> = {
	surface: "○",
	relational: "◐",
	deep: "◑",
	transferable: "●",
};

function depthColor(depth: EncodingDepth): "dim" | "muted" | "success" | "warning" {
	switch (depth) {
		case "surface": return "dim";
		case "relational": return "muted";
		case "deep": return "success";
		case "transferable": return "warning";
	}
}

export class ConceptListView extends CachedView<ConceptListProps> {
	constructor(
		private theme: Theme,
		private conceptsMap: Record<string, ConceptMastery>,
	) { super(); }

	protected buildLines(width: number): string[] {
		const t = this.theme;
		const w = width;
		const p = this.props;

		if (p.totalLines === 0) {
			return [
				t.fg("muted", "  No concepts introduced yet."),
				"",
			];
		}

		const lines: string[] = [];

		// Sticky header
		lines.push(
			truncateToWidth(
				t.fg(
					"accent",
					p.focused
						? "  Concepts (tab to switch)"
						: "  Concepts",
				),
				w,
			),
		);

		// Scrollable middle
		const visible = p.lines.slice(p.scrollY, p.scrollY + p.viewportHeight);
		for (const line of visible) {
			lines.push(truncateToWidth(line, w));
		}

		// Scroll indicator footer
		if (p.totalLines > p.viewportHeight) {
			const info = `  ${p.scrollY + 1}–${Math.min(p.scrollY + p.viewportHeight, p.totalLines)} of ${p.totalLines}`;
			lines.push(truncateToWidth(t.fg("dim", info), w));
		}

		lines.push("");
		return lines;
	}
}
