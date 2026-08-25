# wtm worktree reference

wtm is a fish CLI for the "bare repo + sibling worktree directories" workflow (bare `.git/` root, worktrees under it). Run every command from the bare repository root.

This file is a discovery stub. Before running wtm commands beyond `create`, load the version-matched usage guide:

```bash
wtm skills get core --full    # layout, core loop, command reference, conventions, pitfalls
```

## Shell requirement

wtm is configured as a Fish function on this machine. From Pi's Bash tool, always invoke it through Fish:

```bash
fish -lc 'wtm list'
fish -lc 'wtm create "feature-x" --from main --no-shell'
```

Calling `wtm` directly from Bash can hit the inactive `mise` shim and fail with `No version is set for shim: wtm`.

## Quick reference

```fish
wtm list
wtm create "feature-x" --from main --no-shell   # always quote the name
wtm delete feature-x
wtm cleanup --dry-run    # then without --dry-run
```

## Pitfalls

- Always run from the bare repo root (the dir containing `.git/`).
- Always quote worktree names — unquoted `/` creates nested directories.
- Prefer `--no-shell` in agent sessions; plain `create` opens a nested interactive fish.
- Do not use raw `git worktree` commands unless `wtm` is unavailable.
