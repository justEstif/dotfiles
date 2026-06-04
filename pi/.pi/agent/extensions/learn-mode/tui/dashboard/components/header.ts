/**
 * Header section — goal display with focus indicator.
 */

import { truncateToWidth } from "@earendil-works/pi-tui";
import type { Theme } from "@earendil-works/pi-coding-agent";
import { CachedView } from "../stateful-view.js";
import type { HeaderProps } from "../types.js";

export class HeaderView extends CachedView<HeaderProps> {
	constructor(private theme: Theme) { super(); }

	protected buildLines(width: number): string[] {
		const t = this.theme;
		const w = width;
		const p = this.props;

		return [
			truncateToWidth(t.fg("accent", t.bold("  🎓 Learning Dashboard")), w),
			truncateToWidth(t.fg("muted", `  Goal: ${p.goal}`), w),
			"",
		];
	}
}
