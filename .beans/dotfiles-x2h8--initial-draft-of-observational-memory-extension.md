---
# dotfiles-x2h8
title: Initial Draft of Observational Memory Extension
status: completed
type: feature
created_at: 2026-04-18T00:52:52Z
updated_at: 2026-04-18T00:52:52Z
---

Created the initial skeleton for the OM extension. Implemented the `/om` command for configuring the background model, tracked token usage in the observer loop via `turn_end`, and updated the footer using `ctx.ui.setStatus()` to display OM stats.
