/**
 * Suggested connections section — unlinked concept pairs to explore.
 */

import { truncateToWidth } from "@earendil-works/pi-tui";
import type { Theme } from "@earendil-works/pi-coding-agent";
import { CachedView } from "../stateful-view.js";
import type { SuggestionsProps } from "../types.js";

export class SuggestionsView extends CachedView<SuggestionsProps> {
	constructor(private theme: Theme) { super(); }

	protected buildLines(width: number): string[] {
		const t = this.theme;
		const w = width;
		const p = this.props;

		if (p.items.length === 0) return [];

		const lines: string[] = [
			truncateToWidth(t.fg("accent", "  Suggested Connections"), w),
		];

		for (const s of p.items) {
			lines.push(
				truncateToWidth(
					t.fg("muted", `    ${s.fromLabel} ↔ ${s.toLabel}`),
					w,
				),
			);
		}

		lines.push("");
		return lines;
	}
}
