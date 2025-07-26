# Neovim Configuration Agent Guide

## Project Overview

This is a Neovim configuration using `mini.nvim` as the primary plugin framework. All Lua files should follow established patterns and conventions.

## Commands

- **Test/Lint**: No automated tests - this is a Neovim config. Test by loading config in Neovim.
- **Format**: Use `stylua` for Lua formatting (configured in conform.nvim)
- **LSP**: Uses lua-language-server for Lua files

## Code Style & Conventions

### File Organization

- `init.lua`: Bootstrap and main config table (`_G.Config`)
- `plugin/XX-*.lua`: Feature modules loaded by mini.deps with `MiniDeps.add()` and `MiniDeps.later()`
- `lsp/*.lua`: LSP server configurations returning config tables
- `after/ftplugin/*.lua`: Filetype-specific settings

### Lua Style

- **Indentation**: 2 spaces, tabs converted to spaces
- **Quotes**: Use double quotes for strings
- **Tables**: Trailing commas in multi-line tables
- **Variables**: Use snake_case for variables, PascalCase for globals (e.g., `MiniDeps`, `Config`)
- **Functions**: Use `local function_name = function()` pattern
- **Dependencies**: Use `local add, later = MiniDeps.add, MiniDeps.later` pattern
- **Globals**: Define in lua_ls.lua: `vim`, `MiniDeps`, `MiniExtra`, `MiniIcons`, `MiniNotify`, `Config`

### Key Mappings

- Leader key: `,` (comma)
- Use helper functions: `nmap_leader()`, `xmap_leader()` for leader mappings
- Group mappings with descriptive prefixes: `f` (files), `g` (git), `l` (lsp)
- Always include `desc` parameter for mappings

### Plugin Loading

- Use `MiniDeps.later()` for deferred loading
- Group related plugins in single `later()` blocks
- Configure immediately after adding plugins
