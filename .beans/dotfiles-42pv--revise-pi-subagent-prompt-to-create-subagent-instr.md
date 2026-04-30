---
# dotfiles-42pv
title: Revise pi subagent prompt to create subagent instructions
status: completed
type: task
priority: normal
created_at: 2026-04-29T16:15:43Z
updated_at: 2026-04-29T16:15:50Z
---

Update /subagent prompt so it tells pi to create a small subagent prompt as described, rather than deciding whether a subagent is needed.

- [x] Revise subagent prompt
- [x] Summarize changes

## Summary of Changes

Updated `pi/.pi/agent/prompts/subagent.md` so `/subagent <task>` directly creates a focused prompt for a disposable pi subagent. Removed the self-defeating instruction to avoid drafting a subagent when the task is simple.
