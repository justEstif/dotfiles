---
# dotfiles-3k9b
title: Catch YAML frontmatter parse errors in validate-skill
status: completed
type: bug
priority: normal
created_at: 2026-04-30T14:00:04Z
updated_at: 2026-04-30T14:00:37Z
---

Update skill validation script to catch YAML frontmatter parse errors like unquoted colons in description.

- [x] Inspect validate-skill script
- [x] Add YAML parse validation
- [x] Test with valid and invalid skill fixtures
- [x] Summarize changes

## Summary of Changes

Updated `agents/.agents/skills/skill-creator/scripts/validate-skill` to reject unquoted YAML frontmatter values containing `:` followed by whitespace/end, matching real YAML parser behavior. Added a clear error telling the user to quote the whole value. Tested against temporary invalid/valid skills and revalidated `build-or-not` successfully.
