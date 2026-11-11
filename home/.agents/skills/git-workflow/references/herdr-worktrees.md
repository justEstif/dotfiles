# herdr worktree reference

Worktrees live in `~/.herdr/worktrees/<repo>/<branch-slug>` (slashes → `-`).
Herdr shows each checkout as a **space**: the sidebar nests them under the
repo and shows branch, ahead/behind, and uncommitted changes.

## Create (agents: always this way, never the dialog)

The Herdr "New worktree" dialog cuts the branch from HEAD. Agents must pass an
explicit, updated base branch instead:

```bash
# 1. Update the local base
git -C <main-checkout> fetch origin main:main   # or: git checkout main && git pull

# 2. Create the worktree (slug: non [A-Za-z0-9._-] chars → '-')
git -C <main-checkout> worktree add -b <branch> ~/.herdr/worktrees/<repo>/<slug> main
# existing branch: drop the -b and use the branch name as the final arg

# 3. Show it in the window (optional; skip for hidden bg agents)
herdr-app do space.new --folder ~/.herdr/worktrees/<repo>/<slug>
# with an agent tab instead of a shell:
herdr-app do space.new --folder <path> --tab "<chunk name>" --argv '["pi"]' --task "<first message>"
# background work in it: hc run --cwd <path> ...
```

Leave the space unnamed so it follows the checkout folder and nests under the
repo (that is what Herdr's own creation does).

## Open / list / remove

- Open: Herdr's + menu → "Open worktree" lists every checkout of the repo
  (`git worktree list`), including old wtm ones; already-shown ones are gone to.
  Scripted: `herdr-app do space.new --folder <path>`.
- Remove: Herdr's space menu → "Remove worktree" — it refuses once when new
  dirt or unpushed submodule commits appeared, then allows. Scripted:
  `git -C <main-checkout> worktree remove [--force] <path>` (check
  `git status --porcelain` in the worktree first; force only if dirty or it
  has submodules and you accept losing them).
- No bulk cleanup: remove per worktree.

## Pitfalls

- Never create from HEAD implicitly when the base matters; always name the
  updated local base branch as the final arg.
- The `<slug>` differs from the branch only when the branch has `/` or other
  non-[A-Za-z0-9._-] characters: `feat/login-api` → `feat-login-api`.
- Windows-style machine homes: remote worktrees go under that machine's own
  `~/.herdr/worktrees/<repo>/<branch>` (`--folder` on that machine).
- Old wtm worktrees (bare-repo layout) still open fine in Herdr; delete them
  with `fish -lc 'wtm delete <name>'` from the bare repo root, or
  `git worktree remove`.

## Verification

1. `git worktree list` shows the new path with the right branch.
2. `herdr-app ls` shows the space nested under the repo with the right branch.
3. Work in the chunk happens only inside `~/.herdr/worktrees/<repo>/<slug>`.
