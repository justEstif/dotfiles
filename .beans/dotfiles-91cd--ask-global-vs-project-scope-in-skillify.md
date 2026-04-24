---
# dotfiles-91cd
title: Ask global vs project scope in skillify
status: completed
type: task
priority: normal
created_at: 2026-04-24T13:46:18Z
updated_at: 2026-04-24T13:48:03Z
---

Update the skillify skill so it asks whether a new skill should be global or project-local before creating files.

- [x] Inspect relevant sections
- [x] Add scope decision guidance
- [x] Validate text

## Summary of Changes

Updated `agents/.agents/skills/skillify/SKILL.md` so Phase 1 explicitly asks whether a skill should be global or project-local before creating files. Added guidance for choosing scope, defaulting to narrower project scope when unclear, placing files/resolver entries in the matching scope, and reporting the confirmed scope in the output format.
