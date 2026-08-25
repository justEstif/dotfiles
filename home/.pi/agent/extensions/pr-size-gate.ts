/**
 * PR Size Gate Extension
 *
 * Enforces the git-workflow skill's PR contract (~500 changed lines per PR)
 * at two checkpoints, failing open on any git error:
 *
 * 1. `git commit` — blocks when committed diff + staged changes would push the
 *    branch over budget, telling the agent to create a stacked branch off HEAD.
 *    Working-tree changes travel to the new branch, so nothing is lost.
 * 2. `git push` / `gh pr create` / `gh stack submit` — backstop that blocks
 *    publishing an over-budget branch.
 */

import { isToolCallEventType } from "@earendil-works/pi-coding-agent";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
// NOTE: staged delta is computed vs HEAD (not merge-base) to avoid
// double-counting already-committed lines. wouldBe = committed + staged.

/** Max additions+deletions allowed on a branch vs its base. */
export const PR_LINE_BUDGET = 500;

/** Commands that publish a PR / push a branch. */
const PUSH_RE = /\bgit\s+push\b|\bgh\s+(pr\s+create|stack\s+submit)\b/;

/** Commands that create/amend a commit. */
const COMMIT_RE = /\bgit\s+commit\b/;

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
		const [add, del] = line.split("\t");
		const a = add === "-" ? 0 : parseInt(add, 10);
		const d = del === "-" ? 0 : parseInt(del, 10);
		if (Number.isNaN(a) || Number.isNaN(d)) continue;
		total += a + d;
	}
	return total;
}

/** Detect the default branch: origin's HEAD, else main/master/trunk. */
async function detectDefaultBranch(pi: ExtensionAPI, cwd: string): Promise<string | null> {
	// Prefer local symbolic-ref of origin/HEAD (no network), then `git remote show origin`.
	const ref = await git(pi, cwd, ["symbolic-ref", "--short", "origin/HEAD"]);
	if (ref.ok) {
		const name = ref.out.trim().replace(/^origin\//, "");
		if (name) return name;
	}
	const show = await git(pi, cwd, ["remote", "show", "origin"]);
	if (show.ok) {
		const m = show.out.match(/HEAD branch:\s*(\S+)/);
		if (m && m[1] !== "(unknown)") return m[1];
	}
	for (const name of ["main", "master", "trunk"]) {
		for (const cand of [name, `origin/${name}`]) {
			if ((await git(pi, cwd, ["rev-parse", "--verify", "--quiet", cand])).ok) return cand;
		}
	}
	return null;
}

/** Merge-base of HEAD with the default branch, or null. */
async function mergeBaseWithDefault(pi: ExtensionAPI, cwd: string): Promise<string | null> {
	const base = await detectDefaultBranch(pi, cwd);
	if (!base) return null;
	const mb = await git(pi, cwd, ["merge-base", base, "HEAD"]);
	return mb.ok && mb.out.trim() ? mb.out.trim() : null;
}

/** Total additions+deletions of HEAD vs merge-base with base. Null on failure. */
async function committedLines(pi: ExtensionAPI, cwd: string): Promise<number | null> {
	const mb = await mergeBaseWithDefault(pi, cwd);
	if (!mb) return null;
	const diff = await git(pi, cwd, ["diff", "--numstat", `${mb}...HEAD`]);
	if (!diff.ok) return null;
	return sumNumstat(diff.out);
}

/** Staged additions+deletions vs HEAD (the delta the next commit adds). Null on failure. */
async function stagedLines(pi: ExtensionAPI, cwd: string): Promise<number | null> {
	const diff = await git(pi, cwd, ["diff", "--numstat", "--cached", "HEAD"]);
	if (!diff.ok) return null;
	return sumNumstat(diff.out);
}

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("bash", event)) return;
		const command: string = event.input.command ?? "";

		// Checkpoint 1: commit gate. If committing would push the branch over
		// budget, block and instruct the agent to start a stacked branch.
		if (COMMIT_RE.test(command)) {
			const [committed, staged] = [await committedLines(pi, ctx.cwd), await stagedLines(pi, ctx.cwd)];
			if (committed === null || staged === null) return; // fail open
			const wouldBe = committed + staged;
			if (wouldBe > PR_LINE_BUDGET && committed <= PR_LINE_BUDGET) {
				return {
					block: true,
					reason: `pr-size-gate: this commit would push the branch diff to ${wouldBe} changed lines (>${PR_LINE_BUDGET} budget; already committed: ${committed}). Start a stacked branch instead: run \`git checkout -b <name>-part2\` (off current HEAD, changes travel with you), then commit there. Current branch becomes PR 1 of the stack. See the git-workflow skill.`,
				};
			}
			// Branch already over budget (commits made before this gate was
			// active): let the commit through — the push gate handles it.
			return;
		}

		// Checkpoint 2: push/PR backstop.
		if (PUSH_RE.test(command)) {
			const lines = await committedLines(pi, ctx.cwd);
			if (lines === null || lines <= PR_LINE_BUDGET) return;
			return {
				block: true,
				reason: `pr-size-gate: branch diff is ${lines} changed lines (>${PR_LINE_BUDGET} budget). Split into stacked PRs (see git-workflow skill): move recent commits onto a new branch off this one (\`git branch <name>-part2 && git reset --hard <commit-before-overflow>\`), or justify/shrink this PR.`,
			};
		}
	});
}
