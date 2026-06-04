/**
 * Dashboard types — canonical state, actions, effects, props.
 *
 * Follows the rpiv-ask-user-question pattern:
 * - Single DashboardState as source of truth
 * - DashboardAction discriminated union for key events
 * - DashboardEffect discriminated union for side effects
 * - Sectioned props for StatefulView<P> components
 */

import type {
	ConceptConnection,
	ConceptMastery,
	EncodingDepth,
	DifficultyTier,
} from "../../src/engine/types.js";
import type { InterleavingItem } from "../interleaving/index.js";

// ── Data layer (read-only, pushed from outside) ────────────────

export interface DashboardData {
	goal: string;
	tier: DifficultyTier;
	concepts: Record<string, ConceptMastery>;
	connections: ConceptConnection[];
	avgEncodingDepth: number;
	connectionDensity: number;
	suggestedConnections: Array<{ fromLabel: string; toLabel: string }>;
	dueChecks: Array<{ label: string; depth: EncodingDepth; dueLabel: string }>;
	interleaving: InterleavingItem[];
	isActive: boolean;
}

// ── Focus tracking (discriminated union, not multiple booleans) ─

export type ActiveSection = "concepts" | "actions";

// ── Canonical state ────────────────────────────────────────────

export interface DashboardState {
	/** Immutable data snapshot from engine. */
	readonly data: DashboardData;
	/** Which section has keyboard focus. */
	focus: ActiveSection;
	/** Scroll position in concept list. */
	conceptScrollY: number;
	/** Selected action index. */
	actionIndex: number;
	/** Max lines for concept list viewport. */
	conceptViewport: number;
}

// ── Actions (discriminated union from key routing) ──────────────

export type DashboardAction =
	| { kind: "nav_up" }
	| { kind: "nav_down" }
	| { kind: "switch_section" }
	| { kind: "select" }
	| { kind: "cancel" };

// ── Effects (side effects from reducer) ────────────────────────

export type DashboardEffect =
	| { kind: "done"; result: string | null };

// ── Section props (pushed to StatefulView<P> components) ───────

export interface HeaderProps {
	goal: string;
	focused: boolean;
}

export interface MetricsProps {
	tier: DifficultyTier;
	conceptCount: number;
	avgDepth: number;
	connectionDensity: number;
}

export interface ConceptListProps {
	lines: string[];
	scrollY: number;
	viewportHeight: number;
	totalLines: number;
	focused: boolean;
}

export interface SuggestionsProps {
	items: Array<{ fromLabel: string; toLabel: string }>;
}

export interface DueChecksProps {
	items: Array<{ label: string; depth: EncodingDepth; dueLabel: string }>;
}

export interface ActionsProps {
	items: Array<{ id: string; label: string; description: string }>;
	selectedIndex: number;
	focused: boolean;
}

// ── Result type for reducer ────────────────────────────────────

export interface ApplyResult {
	state: DashboardState;
	effects: DashboardEffect[];
}
