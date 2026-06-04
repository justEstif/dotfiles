/**
 * Actions section — selectable action menu with keyboard navigation.
 */

import { truncateToWidth } from "@earendil-works/pi-tui";
import type { Theme } from "@earendil-works/pi-coding-agent";
import { CachedView } from "../stateful-view.js";
import type { ActionsProps } from "../types.js";

const ACTIONS = [
	{ id: "exercise", label: "Start Exercise", description: "Encoding challenge at your tier" },
	{ id: "review", label: "Run Review", description: "Cross-topic connection check" },
	{ id: "define", label: "Define Term", description: "Look up a concept" },
	{ id: "status", label: "Full Status", description: "Print status to chat" },
	{ id: "off", label: "Exit Learning", description: "Turn off learning mode" },
];

export { ACTIONS };

export class ActionsView extends CachedView<ActionsProps> {
	constructor(private theme: Theme) { super(); }

	protected buildLines(width: number): string[] {
		const t = this.theme;
		const w = width;
		const p = this.props;

		const lines: string[] = [];

		lines.push(
			truncateToWidth(
				t.fg("dim", "─".repeat(Math.min(w - 2, 70))),
				w,
			),
		);
		lines.push(
			truncateToWidth(
				t.fg(
					p.focused ? "accent" : "muted",
					"  Actions (tab to switch)",
				),
				w,
			),
		);

		for (let i = 0; i < p.items.length; i++) {
			const item = p.items[i]!;
			const selected = p.focused && i === p.selectedIndex;
			const prefix = selected ? "  ▸ " : "    ";
			const label = selected
				? t.fg("accent", t.bold(item.label))
				: t.fg("text", item.label);
			const desc = t.fg("dim", ` — ${item.description}`);
			lines.push(truncateToWidth(`${prefix}${label}${desc}`, w));
		}

		lines.push("");
		lines.push(
			truncateToWidth(
				t.fg("dim", "  ↑↓ navigate • tab switch section • enter select • esc close"),
				w,
			),
		);

		return lines;
	}
}
