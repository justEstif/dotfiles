# dotfiles

Personal dotfiles, managed by [mise](https://mise.jdx.dev/) (`[dotfiles]` +
`mise bootstrap`). A fresh clone plus a few seeded symlinks reproduces the whole
workstation on Linux **or** macOS.

## Layout

```
~/dotfiles/
  home/        # dotfiles.root — mirrors $HOME; mise symlinks each target here
  mise/        # self-managed mise config
    miserc.toml          # auto_env = true  → auto-loads platform configs
    config.toml          # shared:  [tools][env][settings][dotfiles][bootstrap.*]
    config.linux.toml    # Linux-only  (auto-loaded on Linux)
    config.macos.toml    # macOS-only  (auto-loaded on macOS)
  omp/ pi/     # live runtime state (sessions, dbs, auth.json) — gitignored, retained
  bootstrap-macos.sh     # one-shot macOS cutover script (clone→converge)
```

mise reads its global config from `~/.config/mise/`, which symlinks into `mise/`.
`dotfiles.root = ~/dotfiles/home`, so every `[dotfiles]` entry symlinks a `$HOME`
path to its mirror under `home/`.

## Bootstrap a new machine

### Prerequisites
- **mise** on PATH — Linux: [installer](https://mise.jdx.dev/getting-started.html) (`~/.local/bin/mise`); macOS: `brew install mise`
- **fish** — Linux: distro package; macOS: `brew install fish` (it's the login shell)
- SSH key that can clone this repo

### Steps
```sh
git clone git@github.com:justEstif/dotfiles.git ~/dotfiles

# seed mise's global config (chicken-and-egg: mise must read its config to apply it)
mkdir -p ~/.config/mise
ln -sf ~/dotfiles/mise/{miserc,config,config.linux,config.macos}.toml ~/.config/mise/

mise trust
mise bootstrap --yes     # repos + dotfiles + fish shell-activate + login shell + tools
```

On macOS you can instead run [`bootstrap-macos.sh`](bootstrap-macos.sh), which also
handles the cutover from the old stow layout and the `chsh` follow-up.

Platform configs load automatically — `mise config` should list `config.toml`
**and** `config.<os>.toml`.

## Day-to-day

- **Edit a dotfile** — edit it in place; it's a symlink into `home/`, so the
  change lives in the repo directly.
- **Capture a drifted real file** (e.g. after `git config --global …`):
  `mise dotfiles add ~/.gitconfig` updates the source under `home/`.
- **Add a new dotfile** — `mise dotfiles add <path>` (writes the `[dotfiles]`
  entry and seeds the source under `home/`).
- **Check state** — `mise dotfiles status` / `mise bootstrap status --missing`.
- **Re-converge after pulling** — `mise bootstrap --yes`.

## Platform-specific config

File-level platform splits live in `config.linux.toml` / `config.macos.toml`
(`[dotfiles]` sources: ghostty `<os>.conf`, omp `config.<os>.yml`, pi
`settings/mcp.<os>.json`). Platform **env vars / PATH** go in those files'
`[env]`; platform **runtime logic** (e.g. fish clipboard detection in
`abbr.fish` / `pcp.fish`) stays as shell conditionals — mise config can't
express runtime branching.

## Notes

- `omp/` and `pi/` hold live runtime state reached via `~/.omp/*` and
  `~/.pi/agent/{sessions,themes,auth.json}` symlinks — gitignored, intentionally
  not migrated. To de-symlink later, physically move the real files into `~/.omp/`
  / `~/.pi/agent/`, then `rm -rf omp pi` and drop the matching `.gitignore` lines.
- Fish mise-activation is owned by `[bootstrap.mise_shell_activate]` (a managed
  block in `config.fish`); the old manual `conf.d/mise.fish` is gone.
