---
# dotfiles-i4h5
title: Inspect agent_clip normal-mode copy behavior
status: completed
type: task
priority: normal
created_at: 2026-04-18T22:28:54Z
updated_at: 2026-04-18T22:29:08Z
---

Review nvim/.config/nvim/plugin/agent_clip.lua to determine what gets copied in normal mode and explain how to limit it to filename and cursor location only.

- [x] Read the file
- [x] Explain current normal-mode behavior
- [x] Describe how to change behavior if needed

## Summary of Changes

Read nvim/.config/nvim/plugin/agent_clip.lua and confirmed that normal mode copies the entire current buffer contents, while visual mode copies only the selected lines. Explained that to avoid copying file contents in normal mode, the function would need to use cursor position metadata instead of vim.api.nvim_buf_get_lines(0, 0, -1, false).
