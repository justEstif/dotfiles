/**
 * Due encoding checks section — concepts due for spaced-repetition review.
 */

import { truncateToWidth } from "@earendil-works/pi-tui";
import type { Theme } from "@earendil-works/pi-coding-agent";
import type { EncodingDepth } from "../../../engine/types.js";
import { CachedView } from "../stateful-view.js";
import type { DueChecksProps } from "../types.js";

const DEPTH_SYMBOL: Record<EncodingDepth, string> = {
	surface: "○",
	relational: "◐",
	deep: "◑",
	transferable: "●",
};

const DEPTH_LABEL: Record<EncodingDepth, string> = {
	surface: "surface",
	relational: "relational",
	deep: "deep",
	transferable: "transferable",
};

export class DueChecksView extends CachedView<DueChecksProps> {
	constructor(private theme: Theme) { super(); }

	protected buildLines(width: number): string[] {
		const t = this.theme;
		const w = width;
		const p = this.props;

		if (p.items.length === 0) return [];

		const lines: string[] = [
			truncateToWidth(t.fg("warning", "  Due Encoding Checks"), w),
		];

		for (const dc of p.items) {
			lines.push(
				truncateToWidth(
					t.fg(
						"text",
						`    ${DEPTH_SYMBOL[dc.depth]} ${dc.label} (${DEPTH_LABEL[dc.depth]}) — ${dc.dueLabel}`,
					),
					w,
				),
			);
		}

		lines.push("");
		return lines;
	}
}
