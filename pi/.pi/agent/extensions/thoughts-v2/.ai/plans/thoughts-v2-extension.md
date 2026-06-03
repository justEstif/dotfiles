# Plan: Thoughts v2 Extension

## Cleanup note

The old `extensions/thoughts/` directory cannot be deleted while pi is running — the hosting pi process has it as CWD. After restarting pi, remove `thoughts/` and its `_deprecated.ts` placeholder.

## Outcome

M0–M5 complete on branch `thoughts-v2`. Extension at `thoughts-v2/` with:
- `/think` command + `set_thinking_mode` tool for mode activation
- `before_agent_start` injection of active mode reference into system prompt
- Full v1 thread tracking ported (commands, tools, hooks, index, summaries)
- Compaction resilience via custom entries (survive compaction natively)
- Status bar restoration on `session_start`
- Old skill archived, old extension removed

## Post-M5 refactor: frontmatter-driven modes

Make modes data-driven via YAML frontmatter in reference `.md` files.
Adding a new mode = adding one `.md` file. No TypeScript changes needed.

### Frontmatter schema (per .md file)

```yaml
---
id: sycophancy            # matches filename stem, used as ThinkingMode value
label: Sycophancy (Adversarial)
description: Constructive disagreement. Argue the strongest opposing case.
routingHints:
  - push back
  - challenge
  - devil's advocate
routing:
  ifPlan: suggest grill-me
  ifWrongQuestion: suggest root-ask
---
<reference content for injection>
```

### What changes

- `types.ts`: `ThinkingMode` becomes `string` (derived from filenames, not a const union)
- `modes/registry.ts`: scan `references/*.md`, parse frontmatter with gray-matter, build mode map at load time
- `modes/injector.ts`: routing instructions come from frontmatter `routing` field, not hardcoded conditionals
- `tools/set-thinking-mode.ts`: `THINKING_MODES` enum → dynamic list from registry
- `commands/think.ts`: autocomplete → dynamic list from registry
- `package.json`: add `gray-matter` dependency
- `references/*.md`: add frontmatter to each file

### What stays the same

- `lib/`, `commands/thoughts-start.ts`, `commands/thoughts-switch.ts` — no changes
- Reference body content — unchanged, only frontmatter added
- `off` pseudo-mode — still hardcoded (not a reference file)
