---
# dotfiles-q1ut
title: Document pi resolver behavior in skillify
status: completed
type: task
priority: normal
created_at: 2026-04-24T13:50:11Z
updated_at: 2026-04-24T13:50:48Z
---

Update skillify to say pi uses built-in skill discovery and SKILL.md descriptions as the resolver surface, with explicit resolver files only when the host project has them.

- [x] Update resolver guidance
- [x] Validate references

## Summary of Changes

Updated `agents/.agents/skills/skillify/SKILL.md` to document that for pi/native Agent Skills, resolver behavior comes from built-in skill discovery and the `SKILL.md` description field. Explicit resolver/index/AGENTS files are now described as host-project-specific additions to update when present.
