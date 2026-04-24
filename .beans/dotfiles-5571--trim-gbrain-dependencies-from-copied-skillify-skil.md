---
# dotfiles-5571
title: Trim gbrain dependencies from copied skillify skill
status: completed
type: task
priority: normal
created_at: 2026-04-24T13:39:27Z
updated_at: 2026-04-24T13:41:35Z
---

Remove gbrain-specific dependencies and references from agents/.agents/skills/skillify/SKILL.md while preserving the useful generic skillification workflow.

- [x] Inspect current skill file
- [x] Remove or generalize gbrain-specific dependencies
- [x] Validate resulting skill text

## Summary of Changes

Trimmed `agents/.agents/skills/skillify/SKILL.md` to remove gbrain/OpenClaw/Hermes-specific dependencies and commands. Generalized the checklist around host-project conventions, resolver/index reachability, tests, evals, DRY audit, smoke tests, and filing rules. Validated the file no longer contains the removed gbrain-specific terms.
