---
# dotfiles-u229
title: Scaffold nix-dotfiles repo
status: completed
type: task
priority: normal
created_at: 2026-04-25T12:41:20Z
updated_at: 2026-04-25T12:44:45Z
---

## Goal
Create a new nix-dotfiles repo alongside existing dotfiles, scaffolded with home-manager (Linux) + nix-darwin (macOS) support.

## Todo
- [x] Create nix-dotfiles directory structure
- [ ] Write flake.nix with home-manager + darwin outputs
- [ ] Create common.nix with all tool configs (sourced from existing dotfiles)
- [ ] Create linux.nix and darwin.nix host configs
- [ ] Create .gitignore
- [x] Create private GitHub repo and push



## Summary of Changes

Created `~/nix-dotfiles` with full scaffold:
- `flake.nix` — dual output: `homeConfigurations` (Linux) + `darwinConfigurations` (macOS)
- `home/common.nix` — 15 tools declared: fish, nvim, ghostty, zellij, mise, lazygit, ripgrep, glow, television, qry, zed, opencode, pi, fonts, git
- `home/linux.nix` — ghostty linux.conf, fonts in \~/.local/share/fonts
- `home/darwin.nix` — ghostty macos.conf, fonts in \~/Library/Fonts
- `darwin/default.nix` — nix-darwin system defaults (dock, finder, keyboard)
- `config/` — all plain config files copied from existing dotfiles
- Private repo pushed to https://github.com/justEstif/nix-dotfiles
