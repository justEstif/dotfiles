# wtm core

wtm is a fish CLI for the "bare repo + sibling worktree directories" workflow. It exists so agents and humans can work in isolated worktrees instead of mutating the main checkout.

Repo layout every command expects:

```
myrepo/
├── .git/      <- bare git internals
└── main/      <- worktrees live directly under the bare root
    feature-x/
```

**Run every wtm command from the bare repository root** (the directory containing `.git/`). Read-only inspection (grep, cat, git log) may happen in the current checkout, but create a worktree before editing files.

## Core loop

```fish
wtm list                          # see what exists
wtm status                        # inspect Git, PR, review, and CI state
wtm create "feature-x" --from main --no-shell   # new worktree + branch
# ... edit files in main/feature-x ...
wtm delete feature-x              # remove when done
wtm cleanup --dry-run             # sweep merged worktrees
```

## Command reference

| Command | Notes |
|---|---|
| `wtm init <url> [path]` | Clone a repo into a wtm-managed bare structure |
| `wtm create <name> --from <base>` | Create worktree + branch; cd's into it unless `--no-shell` |
| `wtm checkout <name>` | Create a worktree from an existing remote branch |
| `wtm list` | List all worktrees |
| `wtm status [worktree] [--base <branch>] [--local]` | Show Git, base, PR, review-thread, and CI state |
| `wtm delete <name> [--force]` | Remove a worktree (refuses if dirty/unpushed unless forced) |
| `wtm cleanup [--dry-run] [--yes] [--base <branch>]` | Delete merged worktrees |
| `wtm skills [list\|get\|path]` | Load these usage guides (always version-matched) |

## Conventions (this machine)

- **Always quote the worktree name** — unquoted names with `/` create nested directories.
- Prefer `--no-shell` in scripts and agent sessions; plain `create` opens a nested fish in the worktree (interactive use only).
- After finishing work in a worktree, run `wtm cleanup` from the bare root to sweep merged branches; use `--dry-run` first.
- Base branch for merge detection is auto-detected; override with `--base <branch>` when cleanup guesses wrong.

## Hooks

Place an executable script at `.wtm/post_create` (committed on your base branch) to run setup after a worktree is created. It receives: `WORKTREE_DIR`, `WORKTREE_NAME`, `BASE_BRANCH`, `BARE_REPO_PATH`.

## Pitfalls

- Running from a worktree directory instead of the bare root — most commands will not find the repo.
- Editing files in `main/` directly instead of a worktree defeats the whole workflow.
- `delete` protects against uncommitted/unpushed work; read its message before reaching for `--force`.
