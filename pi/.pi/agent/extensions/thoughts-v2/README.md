# thoughts-v2 extension

Unified thinking modes + named thought threads for pi.

## Adding a new mode

Drop a new `.md` file in `references/` with YAML frontmatter:

```yaml
---
id: my-mode
label: My Mode (Short Description)
description: One-line description of what this mode does.
routingHints:
  - keyword one
  - keyword two
routing:
  ifPlan: suggest grill-me
  ifContestedClaim: suggest sycophancy
---

<reference content injected into system prompt when active>
```

That's it. No TypeScript changes needed. The registry scans `references/*.md` at load time.

## Commands

| Command | Description |
|---------|-------------|
| `/think [mode]` | Set or display active thinking mode |
| `/thoughts:start <name>` | Start a new thought thread |
| `/thoughts:switch` | Switch between thought threads |

## Tools

| Tool | Description |
|------|-------------|
| `set_thinking_mode` | LLM-controlled mode activation with auto-routing |
| `thought_recall` | Recover verbatim anchor text after compaction |

## Architecture

```
thoughts-v2/
├── index.ts              # Entry point
├── types.ts              # Shared types and helpers
├── modes/
│   ├── registry.ts       # Scans references/*.md, parses frontmatter
│   └── injector.ts       # before_agent_start system prompt injection
├── commands/
│   ├── think.ts          # /think command
│   ├── thoughts-start.ts # /thoughts:start command
│   └── thoughts-switch.ts# /thoughts:switch command
├── tools/
│   ├── set-thinking-mode.ts  # LLM tool
│   └── thought-recall.ts     # LLM tool
├── lib/
│   ├── hooks.ts          # turn_end, input, session_before_tree hooks
│   ├── helpers.ts        # Snapshot capture, branch walking
│   ├── index-file.ts     # Persistent thread index (JSONL)
│   └── summary.ts        # Heuristic summary generation
└── references/
    ├── sycophancy.md     # Frontmatter + reference content
    ├── root-ask.md       # Frontmatter + reference content
    └── grill-me.md       # Frontmatter + reference content
```

## Compaction Resilience

- Mode state persisted as custom entries (`kind: "mode_change"`)
- Custom entries are session metadata — they survive compaction natively
- `before_agent_start` re-reads mode state and injects the active reference every turn
- `session_start` restores the status bar on reload/resume
