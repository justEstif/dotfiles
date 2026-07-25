# Worktrees

- Use `wtm` for repository work that requires code changes.
- Run `wtm create "<name>" --from <base> --no-shell` from the managed bare repository root. Always quote the worktree name to avoid creating nested directories.
- Do not use raw `git worktree` commands unless `wtm` is unavailable.
- Read-only inspection may happen in the current checkout; create a worktree before editing files.
