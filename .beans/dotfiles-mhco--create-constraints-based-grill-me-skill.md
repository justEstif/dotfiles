---
# dotfiles-mhco
title: Create constraints-based grill-me skill
status: completed
type: task
priority: normal
created_at: 2026-04-30T13:55:53Z
updated_at: 2026-04-30T13:56:51Z
---

Create a version of the grill-me skill that interrogates ideas against three builder constraints: one-page north star, separable core tech, and defining product constraint.

- [x] Inspect existing grill-me skill and skill-creator references
- [x] Choose whether to extend or create a new skill
- [x] Implement skill files
- [x] Validate skill spec
- [x] Summarize changes

## Summary of Changes

Created `agents/.agents/skills/constraint-grill/SKILL.md`, a specialized grill-me variant for product/build decisions using three constraints: one-page north star, separable core tech, and one defining user-visible product constraint. Validated successfully with `agents/.agents/skills/skill-creator/scripts/validate-skill agents/.agents/skills/constraint-grill`.
