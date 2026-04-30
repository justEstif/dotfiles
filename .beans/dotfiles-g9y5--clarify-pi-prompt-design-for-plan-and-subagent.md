---
# dotfiles-g9y5
title: Clarify pi prompt design for plan and subagent
status: completed
type: task
priority: normal
created_at: 2026-04-29T16:16:45Z
updated_at: 2026-04-29T17:02:04Z
---

Interview to clarify intended behavior for pi subagents, then implement the agreed skill.

- [x] Resolve core intent
- [x] Update prompt files if needed
- [x] Summarize changes

## Summary of Changes

Created `pi/.pi/agent/skills/subagent/` with:

- `SKILL.md` orchestration rules for explicit subagent delegation
- `scripts/run-subagents.py` deterministic Python runner using `pi --no-session -p`
- `references/plan-agent.md`
- `references/research-agent.md`
- `references/review-agent.md`

Removed temporary prompt templates `pi/.pi/agent/prompts/plan.md` and `pi/.pi/agent/prompts/subagent.md`.

Runner uses explicit JSON plans, supports `depends_on`, parallelizes independent subagents, reads Claude-style frontmatter from reference agents, and saves artifacts under project `.pi/subagents/` or global `~/.pi/agent/subagents/`.
