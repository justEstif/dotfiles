import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerBashGate } from "./lib/gates.ts";

/** Max additions+deletions allowed on a branch vs its base. */
export const PR_LINE_BUDGET = 500;

const PUSH_RE = /\bgit\s+push\b|\bgh\s+pr\s+create\b/;
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
		const [add = "", del = ""] = line.split("\t");
		const additions = add === "-" ? 0 : Number.parseInt(add, 10);
		const deletions = del === "-" ? 0 : Number.parseInt(del, 10);
		if (Number.isNaN(additions) || Number.isNaN(deletions)) continue;
		total += additions + deletions;
	}
	return total;
}

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

async function committedLines(pi: ExtensionAPI, cwd: string): Promise<number | null> {
	const base = await detectDefaultBranch(pi, cwd);
	if (!base) return null;
	const mergeBase = await git(pi, cwd, ["merge-base", base, "HEAD"]);
	if (!mergeBase.ok || !mergeBase.out.trim()) return null;
	const diff = await git(pi, cwd, ["diff", "--numstat", `${mergeBase.out.trim()}...HEAD`]);
	return diff.ok ? sumNumstat(diff.out) : null;
}

async function stagedLines(pi: ExtensionAPI, cwd: string): Promise<number | null> {
	const diff = await git(pi, cwd, ["diff", "--numstat", "--cached", "HEAD"]);
	return diff.ok ? sumNumstat(diff.out) : null;
}

export default function (pi: ExtensionAPI) {
	registerBashGate(pi, {
		name: "pr-size-advisory",
		matches: (command) => COMMIT_RE.test(command) || PUSH_RE.test(command),
		check: async (command, ctx) => {
			if (COMMIT_RE.test(command)) {
				const [committed, staged] = await Promise.all([
					committedLines(pi, ctx.cwd),
					stagedLines(pi, ctx.cwd),
				]);
				if (committed === null || staged === null) return; // Fail open on git errors.
				const wouldBe = committed + staged;
				if (wouldBe > PR_LINE_BUDGET && committed <= PR_LINE_BUDGET) {
					ctx.ui.notify(
						`PR size advisory: this commit would push the branch diff to ${wouldBe} changed lines (>${PR_LINE_BUDGET} budget; already committed: ${committed}). Consider splitting the work into a separate branch, or justify the oversized diff in the PR body.`,
						"warning",
					);
				}
				return;
			}

			const lines = await committedLines(pi, ctx.cwd);
			if (lines === null || lines <= PR_LINE_BUDGET) return;
			ctx.ui.notify(
				`PR size advisory: branch diff is ${lines} changed lines (>${PR_LINE_BUDGET} budget). Consider splitting it into separate branches, or justify the oversized PR in its body.`,
				"warning",
			);
		},
	});
}
