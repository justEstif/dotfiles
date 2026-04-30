---
# dotfiles-pb98
title: Split pi small-agents prompt into plan and subagent prompts
status: completed
type: task
priority: normal
created_at: 2026-04-29T16:13:22Z
updated_at: 2026-04-29T16:13:36Z
---

Replace combined /small-agents prompt with separate /plan and /subagent prompt templates.

- [x] Create plan prompt
- [x] Create subagent prompt
- [x] Remove combined prompt
- [x] Summarize changes

## Summary of Changes

Split `pi/.pi/agent/prompts/small-agents.md` into:

- `pi/.pi/agent/prompts/plan.md` (`/plan`) for tiny plan-mode checkpoints and exit criteria
- `pi/.pi/agent/prompts/subagent.md` (`/subagent`) for focused disposable subagent prompts

Removed the combined `/small-agents` template.
