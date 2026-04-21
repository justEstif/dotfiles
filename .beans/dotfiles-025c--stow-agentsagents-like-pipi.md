---
# dotfiles-025c
title: Stow agents/.agents like pi/.pi
status: completed
type: task
priority: normal
created_at: 2026-04-21T13:49:53Z
updated_at: 2026-04-21T13:51:46Z
---

Make the agents/.agents package stow into ~/.agents the same way the pi/.pi package stows into ~/.pi.

- [x] Inspect existing pi stow setup
- [x] Update agents package to mirror stow pattern
- [x] Verify resulting stow targets

## Summary of Changes

- Copied the existing `~/.agents` contents into the tracked `agents/.agents` stow package, including the `find-skills` skill.
- Fixed `.gitignore` to ignore `agents/.agents/.skill-lock.json`.
- Replaced the real `~/.agents` directory with a stow-managed symlink to `dotfiles/agents/.agents`.
- Verified the stowed `~/.agents` now exposes both `find-skills` and `grill-me`.
