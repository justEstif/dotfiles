import {
	isToolCallEventType,
	type ExtensionAPI,
	type ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { resolve } from "node:path";

export interface GateBlock {
	block: true;
	reason: string;
	terminate?: boolean;
}

export interface BashGateOptions {
	/** Stable name included in diagnostics. */
	name: string;
	/** Return true when this gate governs the shell command. */
	matches: (command: string) => boolean;
	/** Return a block decision, or nothing to allow the command. */
	check: (
		command: string,
		ctx: ExtensionContext,
	) => GateBlock | undefined | Promise<GateBlock | undefined>;
}

/** Register a reusable gate around matching model-issued bash commands. */
export function registerBashGate(pi: ExtensionAPI, options: BashGateOptions): void {
	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("bash", event)) return;
		const command = event.input.command ?? "";
		if (!options.matches(command)) return;

		const decision = await options.check(command, ctx);
		if (!decision) return;
		return {
			...decision,
			reason: `${options.name}: ${decision.reason}`,
		};
	});
}

export type SkillLoadState = "unloaded" | "queued" | "loaded";

export interface SkillLoadTracker {
	getState(): SkillLoadState;
	isLoaded(): boolean;
	/** Queue slash-command expansion once. Safe to call repeatedly. */
	ensureLoaded(instructions?: string): boolean;
}

export interface SkillLoadTrackerOptions {
	name: string;
	/** Known SKILL.md paths. Suffix matching by skill directory is also used. */
	paths?: string[];
}

/**
 * Track both ways a skill enters model context: slash-command expansion and a
 * successful agent read of its SKILL.md. State is scoped to the Pi session.
 */
export function createSkillLoadTracker(
	pi: ExtensionAPI,
	options: SkillLoadTrackerOptions,
): SkillLoadTracker {
	let state: SkillLoadState = "unloaded";
	const command = `/skill:${options.name}`;
	const knownPaths = new Set((options.paths ?? []).map((path) => resolve(path)));
	const skillPathSuffix = `/${options.name}/SKILL.md`;

	pi.on("session_start", () => {
		state = "unloaded";
	});

	pi.on("input", (event) => {
		if (event.text.trimStart().startsWith(command)) state = "loaded";
	});

	pi.on("tool_result", (event) => {
		if (event.toolName !== "read" || event.isError) return;
		const path = (event.input as { path?: unknown }).path;
		if (typeof path !== "string") return;
		const normalized = resolve(path.replace(/^@/, ""));
		if (knownPaths.has(normalized) || normalized.endsWith(skillPathSuffix)) {
			state = "loaded";
		}
	});

	return {
		getState: () => state,
		isLoaded: () => state === "loaded",
		ensureLoaded(instructions) {
			if (state !== "unloaded") return false;
			state = "queued";
			const suffix = instructions ? ` ${instructions}` : "";
			pi.sendUserMessage(`${command}${suffix}`, {
				deliverAs: "steer",
				expandPromptTemplates: true,
			});
			return true;
		},
	};
}

export interface SkillBashGateOptions extends SkillLoadTrackerOptions {
	gateName?: string;
	matches: (command: string) => boolean;
	loadInstructions?: string;
}

/** Block matching bash calls and queue a required skill on the first attempt. */
export function registerSkillBashGate(
	pi: ExtensionAPI,
	options: SkillBashGateOptions,
): SkillLoadTracker {
	const tracker = createSkillLoadTracker(pi, options);
	registerBashGate(pi, {
		name: options.gateName ?? `${options.name}-skill-gate`,
		matches: options.matches,
		check: () => {
			if (tracker.isLoaded()) return;
			tracker.ensureLoaded(options.loadInstructions);
			return {
				block: true,
				reason: `${options.name} skill is not loaded. Its load has been queued; follow it, then retry the command.`,
			};
		},
	});
	return tracker;
}
