---
name: "git-workflow"
description: "End-to-end git workflow for coding agents on this machine: wtm worktrees, scoped commit messages (`<scope>: <description>` — NEVER Conventional Commits feat:/fix:/chore:), commit-as-you-work cadence, small-PR contract (~300–500 lines, split bigger) with gh-stack stacked PRs, and a scar-tissue rule-append loop. Use for ANY git or GitHub operation — branching, worktrees, committing, pushing, PRs — and whenever a git/PR mistake needs capturing as a rule."
---

# Git workflow

## Procedure

1. **SIZE FIRST**: before editing, estimate blast radius (files + rough lines). If the work cannot fit one PR-sized chunk (~300–500 hand-written lines), decompose into chunks now and decide stack order (foundations first, vertical user-meaningful slices). No code edits before the chunk plan exists.
2. **ONE CHUNK = ONE WORKTREE = ONE PR**: create a wtm worktree per chunk. **MANDATORY — READ `references/wtm.md`** before any wtm command. Never mix chunks in one worktree. Read-only inspection may use the current checkout; editing requires a worktree.
3. **COMMIT AS YOU WORK**: after every completed subtask and every green test/lint/build run, commit in scoped format. **MANDATORY — READ `references/scoped-commits.md`** before writing any commit message. Clean tree before declaring any task done. NEVER accumulate a dirty state for later — why: large dirty states become huge unreviewable PRs and can't be reset when something goes wrong.
4. **PUSH & PR THE CHUNK**: push branch, open PR with structured body (problem, approach, tests, risks) — via `gh pr create`; see gh reference below for CI checks and advanced queries. One PR = one logical purpose. NEVER commit or push directly to main. Each PR buildable, testable, mergeable standalone.
5. **STACK WHEN NEEDED**: if a feature can't fit one independently useful PR, use gh-stack — `gh stack init` (bottom-up), `gh stack add <branch>` per layer, `gh stack submit` to push and create/update PRs, `gh stack sync`/`rebase` to keep aligned. Resolve conflicts before requesting review; merge bottom-up.
6. **SCAR TISSUE**: whenever this skill is violated (huge PR, skipped commits, wrong format, wrong wtm invocation), append one concise rule to the Scar Tissue section below immediately.

## Commit format (Scoped Commits)

- Subject: `<scope>: <description>` — short imperative, scope derived from files/paths changed and the repo's existing log conventions (e.g. `auth:`, `cli:`, `net/http:`). Multi-scope → general or comma-separated scope, or `treewide`.
- Optional body after a blank line explaining the change; optional trailers (e.g. `Jira-Ticket: PROJ-123`) after the body.
- NEVER use Conventional Commits (`feat:`, `fix:`, `chore:`, `feat(scope):`, `!`) — why: the user explicitly rejects this style; instead use `<scope>: <description>`.
- Reverts, merges, and other special commits may keep default git formatting — don't force a scope on them.

## gh CLI

GitHub operations go through the `gh` CLI (it knows it natively — never install/use a GitHub MCP, it costs ~20k context tokens for the same feature set). For PR checks, CI run debugging, `gh api` queries, and JSON output patterns: **MANDATORY — READ `references/github.md`** before running non-trivial gh commands.

## References

All three load via MANDATORY READ triggers in the procedure above:

- `references/wtm.md` — wtm worktree CLI (fish invocation, commands, pitfalls, `wtm skills get core --full`)
- `references/scoped-commits.md` — commit message format, scope derivation, examples
- `references/github.md` — gh CLI patterns (PR checks, CI runs, `gh api`, JSON output)

## Environment quirks

- **wtm**: must run via `fish -lc 'wtm ...'` — direct bash hits an inactive mise shim; details in `references/wtm.md`.
- `~/dotfiles` repo has symlink/mise-bootstrap/mise-drift quirks: **MANDATORY — READ `references/dotfiles.md`** before git operations inside `~/dotfiles`.

## Pitfalls

- NEVER bundle unrelated changes in one commit or PR (features + formatting, deps + logic, drive-by cleanup) — why: reviewers can't isolate risk; instead split into separate commits/PRs.
- NEVER push a branch whose total diff exceeds the PR budget without splitting first — why: it defeats review; instead split into stacked PRs. If a large diff is unavoidable (migration, generated output), justify it in the PR body.
- Merge stacks bottom-up only; NEVER let an upper PR depend on unrelated changes hidden in a lower one.
- Prefer vertical user-meaningful slices over horizontal layer PRs — a "refactor everything" PR can't be reviewed or merged independently.

## Verification

1. `git log --oneline -1` shows a scoped subject (`<scope>: <description>`) with no conventional-commit prefix.
2. `git status` is clean when the task is declared done.
3. Each pushed branch's total diff vs its base is ≤~500 lines or justified in the PR body.
4. Every PR body states one logical purpose and lists tests/risks.
5. Stacked PRs: `gh stack view` shows coherent layers; lower PRs merge before upper ones.

## Scar Tissue

Rules appended when this skill is violated. One concise rule per violation; keep entries specific.

- Never set a feature branch upstream to `origin/main`; push first with explicit `HEAD:refs/heads/<feature>` and verify the destination before proceeding.
