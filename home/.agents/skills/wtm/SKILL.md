---
name: wtm
description: Worktree management with the wtm fish CLI — creating, listing, deleting, and cleaning up git worktrees in wtm-managed bare repos. Replaces raw `git worktree` commands.
---

# wtm

wtm is a fish CLI for the "bare repo + sibling worktree directories" workflow (bare `.git/` root, worktrees under it). Run every command from the bare repository root.

## Start here

This file is a discovery stub. Before running wtm commands, load the version-matched usage guide:

```bash
wtm skills get core --full    # layout, core loop, command reference, conventions, pitfalls
```

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
