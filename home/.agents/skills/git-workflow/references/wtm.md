# wtm: legacy cleanup only

wtm is retired (moved to `~/retired/wtm`). herdr worktrees replace it — see
`references/herdr-worktrees.md`. This note only covers deleting worktrees that
wtm already created.

wtm used a bare-repo layout: bare `.git/` root with worktree directories
sibling to it. Old worktrees still open fine in Herdr (Open worktree lists all
of `git worktree list`).

To delete legacy worktrees, the archived copy still runs if sourced:

```bash
git worktree remove [--force] <path>   # preferred, plain git
# or, from the bare repo root, with the archived functions on the path:
fish -c 'source ~/retired/wtm/functions/*.fish; and wtm delete <name>'
```

Then prune: `git worktree prune` in the repo.
