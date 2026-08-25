# ~/dotfiles repo quirks

Only applies when working inside `~/dotfiles`. Every managed dotfile is a symlink into the repo — editing in place edits the repo.

- Commit before running `mise bootstrap` — it refuses on a dirty tree.
- Capture drift after a tool rewrites a managed file (e.g. `git config --global`): `mise dotfiles add <path>`, then commit.
- `omarchy font set` / `sed -i` on managed files **break symlinks** (atomic replace): check `mise dotfiles status` for `differs` entries and re-link.
- Secrets stay out: API keys live in `~/mise.local.toml` (untracked).
