/**
 * Reading companion overlay types.
 */

import type { ConceptMastery, EncodingDepth, DifficultyTier } from "../../engine/types.js";

export interface ReadingCompanionData {
	/** Title of the resource being read. */
	resourceTitle: string;
	/** Source (URL or file path). */
	resourceSource: string;
	/** Prior concepts relevant to this resource. */
	relevantConcepts: Array<{ label: string; depth: EncodingDepth }>;
	/** Current encoding depth across all concepts. */
	avgEncodingDepth: number;
	/** Current difficulty tier. */
	tier: DifficultyTier;
	/** Whether priming has been done. */
	isPrimed: boolean;
	/** Total concepts in the graph. */
	totalConcepts: number;
	/** Connection density. */
	connectionDensity: number;
}

export type CompanionPhase = "priming" | "reading" | "synthesis";

export type ActiveCompanionSection = "info" | "concepts";

export interface ReadingCompanionState {
	readonly data: ReadingCompanionData;
	phase: CompanionPhase;
	focus: ActiveCompanionSection;
	scrollY: number;
	viewport: number;
}

export type CompanionAction =
	| { kind: "nav_up" }
	| { kind: "nav_down" }
	| { kind: "switch_section" }
	| { kind: "toggle_collapse" }
	| { kind: "dismiss" };

export type CompanionEffect =
	| { kind: "done"; result: string | null }
	| { kind: "collapsed" }
	| { kind: "expanded" };

export interface CompanionApplyResult {
	state: ReadingCompanionState;
	effects: CompanionEffect[];
}

export interface CompanionHeaderProps {
	resourceTitle: string;
	phase: CompanionPhase;
	phaseLabel: string;
}

export interface CompanionMetricsProps {
	totalConcepts: number;
	avgDepth: number;
	connectionDensity: number;
	tier: DifficultyTier;
}

export interface CompanionConceptsProps {
	items: Array<{ label: string; depth: EncodingDepth }>;
	scrollY: number;
	viewport: number;
	focused: boolean;
}

export interface CompanionHintsProps {
	phase: CompanionPhase;
	isPrimed: boolean;
}
