# wtm

Fish worktree manager for repositories that use a bare `.git/` directory with
sibling worktrees.

## Layout

- `functions/` — the `wtm` command and its autoloaded helper functions
- `completions/` — command-line completions
- `skills/` — usage guides exposed through `wtm skills`
- `../conf.d/wtm.fish` — adds the function and completion directories to Fish's search paths

Fish expects each autoloaded function to live in a same-named `.fish` file.
Keeping those files in this plugin directory avoids cluttering the shared
`~/.config/fish/functions` directory.

## Commands

```fish
wtm init <repository>
wtm create <name> [--from <branch>] [--no-shell]
wtm checkout <branch>
wtm list
wtm status [worktree] [--base <branch>] [--local]
wtm delete <name> [--force]
wtm cleanup [--base <branch>] [--dry-run] [--yes]
wtm skills get core --full
```

Run worktree commands from the bare repository root—the directory containing
`.git/`. Use `wtm help` for the current command reference.
