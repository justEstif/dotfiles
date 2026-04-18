---
# dotfiles-90mi
title: Design Observer mechanics for Pi
status: completed
type: task
priority: normal
created_at: 2026-04-18T00:41:56Z
updated_at: 2026-04-18T01:10:41Z
parent: dotfiles-2bwc
---

Figure out how to track token usage of recent turns and trigger a background Observer call to append new observations.


## Setup Details
- We should allow configuring the OM model. `ctx.ui.select` or a command like `/om` to set it.
- Model defaults to something fast like Gemini Flash.
- **Status Bar:** Look at `ctx.ui.setStatus()` or `ctx.ui.setFooter()`. The Mastra repo uses a custom footer with progress bars showing `messages 12.5k/30k` or `Observing... 2s`. We can easily replicate that UI feel using `ctx.ui.setFooter()`.
- Cross-session memory (resource scope) is supported by OM, which means sharing observations across sessions. In Pi, we could store this in a global config or  state rather than just the current session file if we wanted cross-session. For now, thread-scope (current session) is the priority.

## Summary of Changes\n- Designed and implemented Observer token tracking loop on turn_end.\n- Handled context injection in before_agent_start.
