# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a personal dotfiles repository containing configuration files for various development tools and terminal applications. The repository uses GNU Stow for managing symlinks to configuration files.

## Setup and Bootstrap

### Initial Setup
- Run `./bootstrap.fish` to install packages and configure the environment
- The bootstrap script:
  - Detects OS (macOS/Linux) and installs appropriate package manager
  - Installs common packages: nvim, fzf, fish, lazygit, ripgrep, mise, zellij
  - Sets up Iosevka font
  - Uses GNU Stow to symlink all configuration directories

### Tool Management
- **mise**: Manages runtime versions for programming languages
- **Stow**: Manages symlinks for dotfiles (each directory is a stow package)

## Key Tools and Configurations

### Shell (Fish)
- **Config location**: `fish/.config/fish/`
- **Main config**: `fish/.config/fish/config.fish` (currently empty)
- **Abbreviations**: `fish/.config/fish/conf.d/abbr.fish`
  - `v` → `nvim`
  - `lz` → `lazygit`
  - `l` → `ls -1hA`
  - Platform-specific clipboard commands (pc/pp)
- **Auto-loaded configs**: Files in `conf.d/` for mise, zellij, zoxide, paths, variables

### Editor (Neovim)
- **Config location**: `nvim/.config/nvim/`
- **Architecture**: Plugin-based setup with organized structure
  - `plugin/01-settings.lua` - Core settings and leader key (`,`)
  - `plugin/02-mappings.lua` - Key mappings
  - `plugin/03-utils.lua` - Utility functions
  - `plugin/04-lsp.lua` - LSP configuration
  - `plugin/05-treesitter.lua` - Treesitter setup
  - `plugin/06-ui.lua` - UI enhancements
  - `plugin/07-coding.lua` - Coding features
  - `plugin/08-editor.lua` - Editor enhancements
  - `plugin/10-marks.lua` - Mark management
- **LSP servers**: Configured for CSS, Lua, and TypeScript
- **Settings**: Uses mini.basics, relative line numbers, 2-space indentation
- **Folding**: Uses indent-based folding with markdown heading folding

### Terminal Multiplexer (Zellij)
- **Config location**: `zellij/.config/zellij/config.kdl`
- **Theme**: Catppuccin Macchiato
- **Key bindings**: Custom vim-like bindings with clear defaults
- **UI**: Simplified with hidden pane frames and session names
- **Modes**: Supports pane, tab, resize, move, scroll, search, and session modes

### Terminal (WezTerm)
- **Config location**: `wezterm/.config/wezterm/wezterm.lua`
- **Font**: Comic Code Ligatures (platform-specific sizing)
- **Theme**: Catppuccin (dark/light based on system)
- **Features**: Minimal UI, custom key bindings, no fancy tab bar

### Git UI (Lazygit)
- **Config location**: `lazygit/.config/lazygit/config.yml`
- **Editor**: Configured to use nvim with line jumping
- **Pager**: Uses diff-so-fancy for enhanced diffs
- **Keybindings**: Custom quit binding (Ctrl+Q)

### Runtime Management (mise)
- **Config location**: `mise/.config/mise/config.toml`
- **Managed tools**: 
  - Node.js (23.10.0)
  - Python (3.12.9)
  - Go (1.24)
  - Bun, Deno, pnpm (latest)
  - Claude Code CLI (latest)
- **Auto-install**: Configured to install tools when entering directory

## Development Workflow

### Package Management
- Use `mise` for runtime version management
- Fish shell with custom abbreviations for common commands
- Platform-specific clipboard utilities automatically configured

### Terminal Environment
- Zellij for terminal multiplexing with vim-like navigation
- WezTerm as terminal emulator with adaptive theming
- Fish shell with organized configuration modules

### Code Editing
- Neovim with comprehensive LSP setup
- Modular plugin configuration for maintainability
- Integrated with lazygit for git operations

## File Structure
- Each top-level directory represents a stow package
- Configuration files follow XDG Base Directory specification
- Bootstrap script handles cross-platform setup differences