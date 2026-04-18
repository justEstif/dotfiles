---
# dotfiles-ql6s
title: Patch agent_clip normal mode to copy location only
status: completed
type: task
priority: normal
created_at: 2026-04-18T22:29:40Z
updated_at: 2026-04-18T22:30:12Z
---

Update nvim/.config/nvim/plugin/agent_clip.lua so normal mode copies only file name and cursor location, while visual mode still copies selected lines.

- [x] Update normal-mode context gathering
- [x] Preserve visual-mode selected text behavior
- [x] Verify resulting clipboard format

## Summary of Changes

Updated nvim/.config/nvim/plugin/agent_clip.lua so normal mode now copies only the current file path and cursor location (line and 1-based column), while visual mode still copies the selected lines inside a fenced code block with file and line-range context.
