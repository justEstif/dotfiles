---
# dotfiles-ve6o
title: Make agent_clip use full paths
status: completed
type: task
priority: normal
created_at: 2026-04-26T23:33:56Z
updated_at: 2026-04-26T23:34:14Z
---

Update nvim/.config/nvim/plugin/agent_clip.lua so copied paths are absolute/full paths instead of relative.

- [x] Inspect current agent_clip path handling
- [x] Patch path generation to use full paths
- [x] Verify change

## Summary of Changes

Updated `nvim/.config/nvim/plugin/agent_clip.lua` to use `vim.fn.expand("%:p")`, so copied context includes the absolute/full path. Verified the plugin loads with `nvim --headless -u NONE -c luafile ...`.
