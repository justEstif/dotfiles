# thoughts-v2 extension

Unified thinking modes + named thought threads for pi.

## Commands

| Command | Description |
|---------|-------------|
| `/think [mode]` | Set or display active thinking mode |
| `/thoughts:start <name>` | Start a new thought thread |
| `/thoughts:switch` | Switch between thought threads |

## Thinking Modes

| Mode | Purpose |
|------|---------|
| `sycophancy` | Adversarial pushback. Challenge assumptions, argue the opposing case. |
| `root-ask` | Investigate the underlying need behind a stated request. |
| `grill-me` | Walk a design tree, resolving dependencies one-by-one. |
| `off` | Disable active thinking mode. |

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
│   ├── registry.ts       # Mode definitions and reference loader
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
    ├── sycophancy.md     # Mode reference
    ├── root-ask.md       # Mode reference
    └── grill-me.md       # Mode reference
```

## Compaction Resilience

- Mode state persisted as custom entries (`kind: "mode_change"`)
- Custom entries are session metadata — they survive compaction natively
- `before_agent_start` re-reads mode state and injects the active reference every turn
- `session_start` restores the status bar on reload/resume
