/**
 * Interleaving section — shows cross-topic connection opportunities.
 */

import { truncateToWidth } from "@earendil-works/pi-tui";
import type { Theme } from "@earendil-works/pi-coding-agent";
import { CachedView } from "../stateful-view.js";
import type { InterleavingItem } from "../../interleaving/index.js";

export interface InterleavingProps {
	items: InterleavingItem[];
}

export class InterleavingView extends CachedView<InterleavingProps> {
	constructor(private theme: Theme) { super(); }

	protected buildLines(width: number): string[] {
		const t = this.theme;
		const w = width;
		const p = this.props;

		if (p.items.length === 0) return [];

		const lines: string[] = [
			truncateToWidth(t.fg("accent", "  🔗 Interleaving Opportunities"), w),
		];

		for (const item of p.items.slice(0, 3)) {
			const icon = item.type === "connection"
				? "↔"
				: item.type === "due_check"
					? "⏰"
					: "×";
			lines.push(
				truncateToWidth(
					t.fg("muted", `    ${icon} ${item.label} — ${item.detail}`),
					w,
				),
			);
		}

		if (p.items.length > 3) {
			lines.push(
				truncateToWidth(t.fg("dim", `    +${p.items.length - 3} more`), w),
			);
		}

		lines.push("");
		return lines;
	}
}
