# Observational Memory Extension

Pi Observational Memory extension inspired by Mastra's observational memory pattern.

## What it does

- Watches conversation growth and creates observation summaries
- Injects thread/resource memory back into the system prompt
- Uses a reflector during compaction to consolidate memory
- Exposes commands for inspecting and triggering OM manually

## Commands

- `/om:status` — show current OM status
- `/om:observe` — force an observation run
- `/om` — general command with subcommands like `status`, `enable`, `disable`, `observe`, `debug on`, `debug off`, `config`

## Config

Config is loaded from Pi settings under `observationalMemory`.

Project settings:
- `.pi/settings.json`

Global settings:
- `~/.pi/agent/settings.json`

Project settings override global settings.

Example:

```json
{
  "observationalMemory": {
    "enabled": true,
    "debug": true,
    "scope": "thread",
    "observationThreshold": 12000,
    "reflectionThreshold": 40000,
    "retryBackoffTurns": 2,
    "observerModel": "anthropic/claude-sonnet-4-20250514",
    "reflectorModel": "anthropic/claude-sonnet-4-20250514",
    "resourceMemoryFile": ".pi/om-memory.json"
  }
}
```

## Files

- `index.ts` — extension entrypoint and lifecycle hooks
- `config.ts` — settings loading/saving
- `prompts.ts` — observer/reflector instructions
- `status.ts` — footer/status formatting
- `storage.ts` — debug snapshots and resource memory persistence
- `types.ts` — config/runtime/result types

## Debugging

When enabled, OM writes debug artifacts under `.pi/` in the project root:

- `.pi/om-debug.log`
- `.pi/om-last-observer-response.json`
- `.pi/om-last-reflector-response.json`
- `.pi/om-memory.json`
