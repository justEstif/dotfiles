import { isToolCallEventType } from "@earendil-works/pi-coding-agent";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { resolve } from "node:path";

/** Max additions+deletions allowed on a branch vs its base. */
export const PR_LINE_BUDGET = 500;

const SKILL_NAME = "git-workflow";
const SKILL_PATH = resolve(
	process.env.HOME ?? "~",
	".agents/skills/git-workflow/SKILL.md",
);
const SKILL_COMMAND = `/skill:${SKILL_NAME}`;

/** Commands governed by the git-workflow skill. */
const GIT_WORKFLOW_RE = /\b(?:git|gh|wtm)(?=\s)/;
const PUSH_RE = /\bgit\s+push\b|\bgh\s+(?:pr\s+create|stack\s+submit)\b/;
const COMMIT_RE = /\bgit\s+commit\b/;

type SkillState = "unloaded" | "queued" | "loaded";

async function git(
	pi: ExtensionAPI,
	cwd: string,
	args: string[],
): Promise<{ ok: boolean; out: string }> {
	try {
		const { stdout, code } = await pi.exec("git", args, { cwd });
		return { ok: code === 0, out: stdout };
	} catch {
		return { ok: false, out: "" };
	}
}

function sumNumstat(out: string): number {
	let total = 0;
	for (const line of out.trim().split("\n")) {
		if (!line) continue;
		const [add = "", del = ""] = line.split("\t");
		const additions = add === "-" ? 0 : Number.parseInt(add, 10);
		const deletions = del === "-" ? 0 : Number.parseInt(del, 10);
		if (Number.isNaN(additions) || Number.isNaN(deletions)) continue;
		total += additions + deletions;
	}
	return total;
}

/** Detect the default branch: origin's HEAD, else main/master/trunk. */
async function detectDefaultBranch(pi: ExtensionAPI, cwd: string): Promise<string | null> {
	const ref = await git(pi, cwd, ["symbolic-ref", "--short", "origin/HEAD"]);
	if (ref.ok) {
		const name = ref.out.trim().replace(/^origin\//, "");
		if (name) return name;
	}

	const show = await git(pi, cwd, ["remote", "show", "origin"]);
	if (show.ok) {
		const match = show.out.match(/HEAD branch:\s*(\S+)/);
		if (match?.[1] && match[1] !== "(unknown)") return match[1];
	}

	for (const name of ["main", "master", "trunk"]) {
		for (const candidate of [name, `origin/${name}`]) {
			if ((await git(pi, cwd, ["rev-parse", "--verify", "--quiet", candidate])).ok) {
				return candidate;
			}
		}
	}
	return null;
}

async function mergeBaseWithDefault(pi: ExtensionAPI, cwd: string): Promise<string | null> {
	const base = await detectDefaultBranch(pi, cwd);
	if (!base) return null;
	const mergeBase = await git(pi, cwd, ["merge-base", base, "HEAD"]);
	return mergeBase.ok && mergeBase.out.trim() ? mergeBase.out.trim() : null;
}

async function committedLines(pi: ExtensionAPI, cwd: string): Promise<number | null> {
	const mergeBase = await mergeBaseWithDefault(pi, cwd);
	if (!mergeBase) return null;
	const diff = await git(pi, cwd, ["diff", "--numstat", `${mergeBase}...HEAD`]);
	return diff.ok ? sumNumstat(diff.out) : null;
}

async function stagedLines(pi: ExtensionAPI, cwd: string): Promise<number | null> {
	const diff = await git(pi, cwd, ["diff", "--numstat", "--cached", "HEAD"]);
	return diff.ok ? sumNumstat(diff.out) : null;
}

function isGitWorkflowSkillPath(path: unknown): boolean {
	if (typeof path !== "string") return false;
	const normalized = resolve(path.replace(/^@/, ""));
	return normalized === SKILL_PATH || normalized.endsWith("/git-workflow/SKILL.md");
}

export default function (pi: ExtensionAPI) {
	let skillState: SkillState = "unloaded";

	pi.on("session_start", () => {
		skillState = "unloaded";
	});

	// Slash-command expansion puts the complete skill in the next model context,
	// so it counts as loaded whether entered by the user or queued by this gate.
	pi.on("input", (event) => {
		if (event.text.trimStart().startsWith(SKILL_COMMAND)) skillState = "loaded";
	});

	// Normal agent-driven skill loading happens through a successful SKILL.md read.
	pi.on("tool_result", (event) => {
		if (
			event.toolName === "read" &&
			!event.isError &&
			isGitWorkflowSkillPath((event.input as { path?: unknown }).path)
		) {
			skillState = "loaded";
		}
	});

	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("bash", event)) return;
		const command = event.input.command ?? "";
		if (!GIT_WORKFLOW_RE.test(command)) return;

		if (skillState !== "loaded") {
			if (skillState === "unloaded") {
				skillState = "queued";
				pi.sendUserMessage(
					`${SKILL_COMMAND} Continue the interrupted task. Read every mandatory reference relevant to the intended command before retrying it.`,
					{ deliverAs: "steer", expandPromptTemplates: true },
				);
			}
			return {
				block: true,
				reason:
					"git-workflow-gate: blocked because the git-workflow skill was not loaded. The skill load has been queued; follow it, then retry the command.",
			};
		}

		// Commit checkpoint: block only the commit that would first cross the budget.
		if (COMMIT_RE.test(command)) {
			const [committed, staged] = await Promise.all([
				committedLines(pi, ctx.cwd),
				stagedLines(pi, ctx.cwd),
			]);
			if (committed === null || staged === null) return; // Fail open on git errors.
			const wouldBe = committed + staged;
			if (wouldBe > PR_LINE_BUDGET && committed <= PR_LINE_BUDGET) {
				return {
					block: true,
					reason: `git-workflow-gate: this commit would push the branch diff to ${wouldBe} changed lines (>${PR_LINE_BUDGET} budget; already committed: ${committed}). Start a stacked branch off HEAD, then commit there. Current branch becomes PR 1 of the stack.`,
				};
			}
			return;
		}

		// Publishing backstop for branches already over budget.
		if (PUSH_RE.test(command)) {
			const lines = await committedLines(pi, ctx.cwd);
			if (lines === null || lines <= PR_LINE_BUDGET) return;
			return {
				block: true,
				reason: `git-workflow-gate: branch diff is ${lines} changed lines (>${PR_LINE_BUDGET} budget). Split it into stacked PRs, or shrink and explicitly justify the oversized PR before publishing.`,
			};
		}
	});
}
