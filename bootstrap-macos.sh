#!/usr/bin/env bash
#
# ==============================================================================
# macOS: adopt the new mise-managed dotfiles (after the stow → mise migration)
# ==============================================================================
#
# CONTEXT (read this before running — it's the brief for the macOS agent):
#
#   The dotfiles repo (git@github.com:justEstif/dotfiles.git) was migrated from
#   GNU Stow to mise's native [dotfiles] + `mise bootstrap`. Old per-tool stow
#   package dirs (fish/, ghostty/, omp-linux/, …) are GONE. The new layout is:
#
#     ~/dotfiles/
#       home/                  # dotfiles.root — mirrors $HOME (mise symlinks here)
#       mise/                  # self-managed mise config (the 4 files below)
#         miserc.toml          # auto_env = true   → auto-loads platform configs
#         config.toml          # shared:  [tools][env][settings][dotfiles][bootstrap.*]
#         config.linux.toml    # Linux-only  (auto-loaded on Linux)
#         config.macos.toml    # macOS-only  (auto-loaded on macOS)
#
#   On macOS, `mise config` must list BOTH config.toml AND config.macos.toml
#   (that proves miserc.toml's auto_env is taking effect). config.macos.toml
#   contributes:
#     • [dotfiles] platform sources:  ghostty/macos.conf,
#                                      omp/agent/config.yml   ← home/.omp/agent/config.macos.yml
#                                      pi/agent/settings.json ← home/.pi/agent/settings.macos.json
#                                      pi/agent/mcp.json      ← home/.pi/agent/mcp.macos.json
#     • [env]:  XDG_CONFIG_HOME, HOMEBREW_NO_REQUIRE_TAP_TRUST,
#               VS Code bin added to PATH (_.path)
#     • [bootstrap.user] login_shell = /opt/homebrew/bin/fish
#
#   Shared [dotfiles] (from config.toml) cover fish, ghostty/config, glow,
#   lazygit, nvim, ripgrep, yt-dlp, zed, zk, zellij, fonts, .gitconfig,
#   .gitignore, AGENTS.md, .agents, the mise config itself, and pi
#   extensions/prompts/npm/keybindings.json.
#
#   LIVE RUNTIME STATE under ~/dotfiles/omp/ and ~/dotfiles/pi/ (sessions, dbs,
#   auth.json, themes) is INTENTIONALLY retained and gitignored — DO NOT delete
#   those dirs; only the portable *config* symlinks get re-pointed by mise.
#
# END STATE on any OS: clone ~/dotfiles + seed the 4 mise symlinks +
#   `mise trust && mise bootstrap --yes` reproduces the workstation.
#
# PREREQUISITES on this Mac:
#   • Apple Silicon Homebrew installed, and on PATH:  eval "$(brew shellenv)"
#   • mise + fish installed:  brew install mise fish
#     (mise must be runnable BEFORE this script — it drives everything else.)
#   • SSH key that can clone the repo (else switch the URL to HTTPS + a token).
#
# SAFETY: idempotent. All removals are `rm -f` (no-op if already gone). Live
# omp/pi state is never in a removal list. Re-running is harmless.
# ==============================================================================
set -euo pipefail

DOT="$HOME/dotfiles"

# --- 1. Repo: clone, or update an existing checkout to the new layout --------
if [ ! -d "$DOT/.git" ]; then
  echo ">> cloning dotfiles…"
  git clone git@github.com:justEstif/dotfiles.git "$DOT"
else
  echo ">> updating existing $DOT to main…"
  git -C "$DOT" fetch origin
  git -C "$DOT" checkout main
  # Hard-reset to the migrated layout. This only touches TRACKED files; the
  # gitignored omp/ + pi/ live state (sessions/dbs/auth.json) is preserved.
  git -C "$DOT" reset --hard origin/main
fi

# --- 2. Remove OLD stow symlinks (they dangle after the restructure) ----------
# These pointed into the deleted per-package dirs. rm -f is a no-op on a fresh
# machine. omp/pi LIVE state is deliberately NOT in this list.
rm -f ~/.config/{fish,glow,lazygit,nvim,ripgrep,yt-dlp,zed,zk,zellij}
rm -f ~/.config/ghostty/{config,macos.conf,linux.conf}
rm -f ~/.agents ~/AGENTS.md
rm -f ~/.omp/agent/config.yml
rm -f ~/.pi/agent/settings.json ~/.pi/agent/mcp.json ~/.pi/agent/keybindings.json
rm -f ~/.pi/agent/extensions ~/.pi/agent/prompts ~/.pi/agent/npm
rm -f ~/.local/share/fonts
rm -f ~/.config/mise                 # old dir-symlink → pivot point for step 3
rm -f ~/.gitconfig-aliases           # orphan (aliases are inline in .gitconfig now)
# bogus top-level package symlinks the old stow may have created:
rm -f ~/fish ~/fonts ~/ghostty ~/glow ~/lazygit ~/mise ~/nvim ~/opencode ~/ripgrep ~/zed

# IMPORTANT — ~/.gitconfig & ~/.gitignore are REAL files and are NOT removed.
#   • If their content matches the repo source, `mise dotfiles apply` converges
#     them to symlinks with NO --force.
#   • If they DIFFER (e.g. a mac-specific git email), mise refuses as a conflict:
#       - keep LOCAL  → after step 3 run:  mise dotfiles add ~/.gitconfig
#       - keep REPO   → after step 4 run:  mise dotfiles apply --force
#     Inspect first:  diff ~/.gitconfig "$DOT/home/.gitconfig"
#   Same drift caveat applies to ~/.pi/agent/{mcp.json,settings.json} if they
#   are real files with local edits you want to preserve.

# --- 3. Seed the mise global config (the chicken-and-egg pivot) --------------
# mise must read its OWN config to run apply, so create these 4 symlinks first.
mkdir -p ~/.config/mise
ln -sf "$DOT/mise/miserc.toml"       ~/.config/mise/miserc.toml
ln -sf "$DOT/mise/config.toml"       ~/.config/mise/config.toml
ln -sf "$DOT/mise/config.macos.toml" ~/.config/mise/config.macos.toml
ln -sf "$DOT/mise/config.linux.toml" ~/.config/mise/config.linux.toml   # harmless here

# --- 4. Trust + apply dotfiles + full bootstrap ------------------------------
mise trust
mise dotfiles apply --yes     # create / re-point every [dotfiles] symlink
mise bootstrap --yes          # repos(no-op) + dotfiles + fish shell-activate
                              # + login_shell + tools  (idempotent)

# --- 5. macOS follow-up: login shell ------------------------------------------
# [bootstrap.user] wants login_shell = /opt/homebrew/bin/fish. If bootstrap
# printed a `bootstrap: follow-up` about chsh, finish it here (needs password).
cur_shell=$(dscl . -read "/Users/$(whoami)" UserShell 2>/dev/null | awk '{print $2}')
if [ -n "$cur_shell" ] && [ "$cur_shell" != "/opt/homebrew/bin/fish" ]; then
  echo ">> login shell is $cur_shell; switching to /opt/homebrew/bin/fish (password prompt)…"
  chsh -s /opt/homebrew/bin/fish
fi

# --- 6. Verify ----------------------------------------------------------------
echo
echo "=== mise config: must show config.toml AND config.macos.toml ==="
mise config
echo "=== dotfiles: every entry should be 'applied' ==="
mise dotfiles status
echo "=== fish + mise activation works ==="
fish -c 'mise --version'
echo
echo "DONE. Open a NEW shell (or re-login) so the fish mise-activation block loads."
