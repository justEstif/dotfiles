/**
 * Interleaving scheduler — surfaces cross-topic connection opportunities.
 *
 * Not an overlay — this is a persistent widget shown in the status area
 * when interleaving opportunities exist.
 */

import { truncateToWidth } from "@earendil-works/pi-tui";
import type { Theme } from "@earendil-works/pi-coding-agent";
import type {
	ConceptMastery,
	ConceptConnection,
	EncodingDepth,
} from "../../engine/types.js";

const DEPTH_SYMBOL: Record<EncodingDepth, string> = {
	surface: "○",
	relational: "◐",
	deep: "◑",
	transferable: "●",
};

export interface InterleavingItem {
	type: "connection" | "due_check" | "cross_topic";
	label: string;
	detail: string;
	/** Concepts involved. */
	concepts: string[];
}

/**
 * Compute interleaving opportunities from engine state.
 */
export function getInterleavingOpportunities(
	concepts: Record<string, ConceptMastery>,
	connections: ConceptConnection[],
	maxItems: number = 4,
): InterleavingItem[] {
	const items: InterleavingItem[] = [];

	// 1. Suggested connections (unconnected concept pairs)
	const introduced = Object.values(concepts).filter(
		(c) => c.encodingDepth !== "surface" || c.repetitions > 0,
	);
	const existing = new Set(
		connections.map((c) => [c.from, c.to].sort().join("::")),
	);

	for (let i = 0; i < introduced.length && items.length < maxItems; i++) {
		for (let j = i + 1; j < introduced.length && items.length < maxItems; j++) {
			const key = [introduced[i].id, introduced[j].id].sort().join("::");
			if (!existing.has(key)) {
				items.push({
					type: "connection",
					label: `${introduced[i].label} ↔ ${introduced[j].label}`,
					detail: "unconnected — link them",
					concepts: [introduced[i].label, introduced[j].label],
				});
			}
		}
	}

	// 2. Due encoding checks
	const now = Date.now();
	const due = Object.values(concepts).filter(
		(c) => c.nextReview > 0 && c.nextReview <= now && c.encodingDepth !== "surface",
	);
	for (const c of due.slice(0, maxItems - items.length)) {
		items.push({
			type: "due_check",
			label: `${DEPTH_SYMBOL[c.encodingDepth]} ${c.label}`,
			detail: "encoding check due",
			concepts: [c.label],
		});
	}

	// 3. Cross-topic opportunities (concepts from different tag groups)
	const tagGroups = new Map<string, string[]>();
	for (const c of introduced) {
		for (const tag of c.tags.length > 0 ? c.tags : ["untagged"]) {
			const group = tagGroups.get(tag) ?? [];
			group.push(c.label);
			tagGroups.set(tag, group);
		}
	}

	const tagPairs = Array.from(tagGroups.entries());
	for (let i = 0; i < tagPairs.length - 1 && items.length < maxItems; i++) {
		for (let j = i + 1; j < tagPairs.length && items.length < maxItems; j++) {
			const [tagA, groupA] = tagPairs[i]!;
			const [tagB, groupB] = tagPairs[j]!;
			items.push({
				type: "cross_topic",
				label: `${tagA} × ${tagB}`,
				detail: `${groupA.length + groupB.length} concepts across topics`,
				concepts: [...groupA, ...groupB],
			});
		}
	}

	return items;
}

/**
 * Render interleaving widget lines for the status area.
 */
export function renderInterleavingWidget(
	theme: Theme,
	items: InterleavingItem[],
): string[] {
	if (items.length === 0) return [];

	const t = theme;
	const lines: string[] = [
		t.fg("accent", "🔗 Interleaving Opportunities"),
	];

	for (const item of items.slice(0, 3)) {
		const icon = item.type === "connection"
			? "↔"
			: item.type === "due_check"
				? "⏰"
				: "×";
		lines.push(
			t.fg("muted", `  ${icon} ${item.label}`),
		);
	}

	if (items.length > 3) {
		lines.push(t.fg("dim", `  +${items.length - 3} more`));
	}

	return lines;
}
