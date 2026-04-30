---
# dotfiles-2i9c
title: Fix build-or-not YAML frontmatter
status: completed
type: bug
priority: normal
created_at: 2026-04-30T13:59:38Z
updated_at: 2026-04-30T13:59:59Z
---

Fix YAML parse error in build-or-not skill description caused by colon in unquoted frontmatter.

- [ ] Inspect frontmatter
- [ ] Quote or rewrite description
- [ ] Validate skill
- [x] Summarize changes

## Summary of Changes

Fixed `agents/.agents/skills/build-or-not/SKILL.md` by quoting the YAML `description` value and changing nested trigger quotes to single quotes inside the string. Validation now passes: `PASS build-or-not`.
