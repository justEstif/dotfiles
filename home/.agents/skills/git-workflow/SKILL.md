---
name: git-workflow
description: "Git/GitHub workflow on this machine: herdr worktrees for edit work, scoped commit messages (`<scope>: <description>`, never Conventional Commits), commit-as-you-work, gh CLI not MCP. Use when branching, creating worktrees, committing, pushing, opening/updating PRs, or when a git/PR mistake needs capturing as a scar-tissue rule."
---

# Git workflow

## Rules

1. **Editing in a repo? Use a herdr worktree** unless it's read-only inspection of the current checkout. One chunk of work per worktree. Read `references/herdr-worktrees.md` before creating or removing one.
2. **Commit as you work**: after every completed subtask and every green test/lint/build run. Clean tree before declaring a task done. Never accumulate dirty state.
3. **Scoped commits**: subject `<scope>: <description>` — short, imperative, scope from files/paths. NEVER Conventional Commits (`feat:`, `fix:`, `chore:`). Never bundle unrelated changes in one commit or PR. Special commits (reverts, merges) keep default formatting.
4. **Push**: feature branches with explicit `HEAD:refs/heads/<feature>` if needed; never push directly to a protected default branch.
5. **PRs via `gh` CLI** — never a GitHub MCP (costs ~20k context tokens for the same features).

## Environment quirks

- wtm is retired (archived at `~/retired`); delete its legacy worktrees with plain `git worktree remove`.
- **`~/dotfiles` repo**: **READ `references/dotfiles.md`** before any git operation inside it (symlink/mise-bootstrap/mise-drift quirks).

## Scar Tissue

Rules appended when this skill is violated. One concise rule per violation; keep entries specific.

- Never set a feature branch upstream to `origin/main`; push first with explicit `HEAD:refs/heads/<feature>` and verify the destination before proceeding.
- For `wtm create --from`, use the updated local base branch (for example `main`), not `origin/main`; wtm interprets the latter as a remote branch name and rejects it. (Legacy machines only — wtm is retired.)
- Never disable hooks to bypass a miscounting PR-size gate; refresh the clean local base ref or pause before recommitting normally.
- Before `git add` on a branch cut from a main checkout kept dirty with files from another PR, run `git status` and stage only that branch's files by explicit path; bundled unrelated files silently move work between PRs (#30/#31).
- Never run `git commit` before the verification command in the same chain has actually reported green; a failed check mid-chain silently ships a broken commit. Verify, then commit.
- Piping a gate command through `head`/`tail`/other filters masks the gate's exit code. `&&` then chains on the filter's status, not the gate's. Run gates bare (or check `${PIPESTATUS[0]}`) before committing on their result.
- Check `git ls-files <path>` after the first commit touching a new directory; a global `~/.gitignore` rule (`**/*openspec*`) can exclude whole directories and produce empty "scaffold" commits.
- The pre-commit hook failing after `git commit -q` still leaves a broken HEAD when the message was printed from a chained earlier command; always end the chain with `git log --oneline -1 && git status --short` so failure is visible before moving on.
- The Bash tool does not support a `workdir` parameter; always prefix worktree commands with an explicit `cd /path/to/worktree &&` so edits cannot land in the main checkout.
