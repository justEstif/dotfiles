---
source: https://github.com/cursor/plugins/tree/main/pstack/skills/poteto-mode
license: MIT (pstack, by poteto)
---

### Opening a PR

Invoked at the end of every other playbook. The whole step runs on local [git-workflow](../../git-workflow/SKILL.md): scoped commits `<scope>: <description>`, never Conventional Commits; wtm worktrees; gh-stack for stacks.

**Worktree.** Work from a wtm worktree off the base branch (git-workflow step 2). Subagents inherit it. Multiple subagents on the same branch each get their own worktree, or `git fetch && git reset --hard origin/<branch>` between them. Dirty branch with unrelated work: patch out, fresh worktree, apply. Snarled worktree: reset from the base, redo minimally.

**Commits.** Commit liberally, in scoped format. Rebase into small, ordered commits before opening PRs. Each commit is a future PR: landable, ordered to tell the story. Amend when the fix belongs in a just-made commit. New commit when separable. Commit bodies don't restate the subject.

**PRs.** Run [unslop](../../writer/references/unslop.md) over the diff before commit and [comments](../../simplifier/references/comments.md) before review. Write every PR title, description, and commit body with [technical-writing](../../writer/references/technical-writing.md) (every layer except Diátaxis, and apply the STE vocabulary rules: one word per action, keep articles, a plain verb over `-ing` where one works), then apply [unslop](../../writer/references/unslop.md).

**Titles.** Scoped subject `<scope>: <description>`, no trailing period. Scope is the area, such as `task` or `playbooks`. Subject is short, imperative, and names a real symbol when one carries the change, for example `task: retarget opening-a-pr trigger`. Never Conventional Commits (`feat:`, `fix:`, `chore:`, `feat(scope):` are all out).

**Descriptions.** The PR body is a one-minute briefing, not a lab notebook, for a reviewer who has the diff. It says why the change exists, what it leaves out, what it could break, and how you proved it works. Write short, simple sentences with few identifiers, no walls of text. The body becomes the squash commit body, so keep that commit under about 40 lines. Use `##` headings, not bold lead-ins, in this order, and drop a section with nothing to say:

- `## Why`: the problem and approach, 1–3 short sentences. No SHAs, rebase genealogy, or "based on main" preamble.
- `## What changed`: 1–3 short bullets. Name a real symbol or path only when it carries the change. Name both sides of a rename or retarget.
- `## Scope`: always. 1–3 short items on what it covers and what it deliberately leaves out (a follow-up, a known gap). No symbols, paths, or file-by-file essay.
- `## Tradeoffs`: only rejected alternatives a reviewer would otherwise ask about. Skip when there was no real choice.
- `## Blast Radius`: 1–2 sentences on who or what it touches and why that is safe or risky. If main is red, state the cost of leaving it red.
- `## Verification`: 1–3 bullets, each a real run path and its outcome. Perf: one primary number with its unit, `before → after`, and a link to the arena or swarm directory for the rest. No sample-size methodology, swarm recitals, or metric tables.

After the sections, attach videos or screenshots when they prove a claim. Full SHAs, swarm or arena lane recitals, lever-correction essays, file-by-file checklists, and "CLEAN" verdicts go in a linked artifact, not the body.

**Forge.** GitHub CLI (`gh`) only, for create, edit, view, and every other PR operation. Do not require Graphite (`gt`) or any other forge CLI.

**Size and stacks.** Prefer five narrow PRs to one large PR. A stack is a base-branch chain, managed with gh-stack (`gh stack init` bottom-up, `gh stack add <branch>` per layer, `gh stack submit` to push and create/update PRs, `gh stack sync`/`rebase` to keep aligned; merge bottom-up). The root PR targets trunk. Each child branch rebases onto its parent's exact tip and its PR targets the parent branch (`gh pr create --base <parent-branch>`, retarget with `gh pr edit <pr> --base <parent-branch>`). Branch from trunk only for independent work. Rebase on trunk before substantial stack work.

**Readiness.** Open every PR ready, never as a draft. With `gh`, omit `--draft` on creation. If a PR still opens as a draft, run `gh pr ready <number>`. Run `gh pr view <number>` before you refer to PR status.

**Watch.** Opening a PR does not start a watch loop. Post the URL and keep building. Finish the phase or stack first. Check PR status only when the user asks, by polling `gh pr view <pr> --json state,mergedAt,mergeStateStatus,statusCheckRollup,autoMergeRequest` after each event. Push back when feedback drifts from intent.

A subagent that opens a PR runs [interrogate](../../reviewer/references/interrogate.md) on the diff, [unslop](../../writer/references/unslop.md), and [comments](../../simplifier/references/comments.md), and posts the URL. It returns to the parent without watching the PR.
