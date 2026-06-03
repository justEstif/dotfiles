# Plan: Unify Think Mode with Thought Threads

## Purpose

Merge the two separate subsystems (think modes + thought threads) into one. Every thinking mode activation creates/attaches to a thread. No standalone `/think` command. LLM-driven via `set_thinking_mode` tool + routing hints in reference metadata.

## Context

Current state after v2→thoughts rename (Jun 2026):
- `set_thinking_mode` tool — activates a mode, persists as custom entry, injects into system prompt
- `/think` command — manual mode activation (will be removed)
- `/thoughts:start` — creates a named thread (will be removed)
- `/thoughts:switch` — switches between threads (kept)
- `thought_recall` tool — recovers anchor text after compaction (kept)
- Reference `.md` files have frontmatter with `routingHints` — LLM auto-detects mode from user text

Key files:
- `index.ts` — extension entry point
- `types.ts` — shared types
- `modes/registry.ts` — scans references/*.md
- `modes/injector.ts` — before_agent_start hook
- `tools/set-thinking-mode.ts` — LLM tool (primary interface)
- `tools/thought-recall.ts` — LLM tool (kept)
- `commands/think.ts` — to be removed
- `commands/thoughts-start.ts` — to be removed
- `commands/thoughts-switch.ts` — kept
- `lib/hooks.ts` — turn_end, input, session_before_tree
- `lib/helpers.ts` — snapshot, branch walking
- `lib/index-file.ts` — thread index
- `lib/summary.ts` — heuristic summaries

## Decisions

- 2026-06-03: Remove `/think` command — mode only activated through `set_thinking_mode` tool
- 2026-06-03: Keep `/thoughts:start` — it creates a thread AND auto-detects/activates a mode from the name
- 2026-06-03: Modes are switchable mid-thread — `set_thinking_mode` can change mode within existing thread
- 2026-06-03: Mode activation creates a thread automatically (if none active) — mode + thread are one unit
- 2026-06-03: LLM detects mode from routingHints in reference metadata — no manual command needed

## Approach

Two entry points, both unified (mode + thread):

**`/thoughts:start <name>`** — manual. Creates a thread, auto-detects mode from the name via `routingHints`, activates it.
**`set_thinking_mode` tool** — LLM-driven. If no active thread, auto-creates one (derives name from `reason` or mode). If thread already active, just switches the mode.

Both paths produce the same result: an active thread with a thinking mode attached.

## Implementation Breakdown

### M1: Merge thread creation + mode activation into `set_thinking_mode`
- **What**: When `set_thinking_mode` is called and no active thread → auto-start a thread (name from `reason` or mode label). If thread already active → just switch the mode. Append `mode_change` (+ `start` if new thread) custom entries.
- **Files**: `tools/set-thinking-mode.ts`, `types.ts` (helper to check active thread)
- **Acceptance**: First call creates thread + mode. Second call switches mode, same thread.
- **Verify**: Manual test via LLM call.

### M3: Remove `/think` command
- **What**: Delete `commands/think.ts`, remove registration from `index.ts`.
- **Files**: `commands/think.ts` (delete), `index.ts`
- **Acceptance**: `/think` no longer registered. No dead imports.

### M4: Update `/thoughts:start` to auto-detect and activate a mode
- **What**: After creating the thread, auto-detect mode from the thread name using `detectMode()` from registry. If a mode matches, activate it (append `mode_change` entry, set status bar). If no match, thread starts without a mode.
- **Files**: `commands/thoughts-start.ts`
- **Acceptance**: `/thoughts:start should we migrate to effect-ts` creates thread + activates `root-ask` mode. `/thoughts:start random notes` creates thread without a mode.

### M5: Update `modes/injector.ts`
- **What**: Status bar shows both thread name and active mode. `session_start` restores both. `before_agent_start` inject continues as-is.
- **Files**: `modes/injector.ts`
- **Acceptance**: Status bar shows `🧠 sycophancy · should-we-migrate` format.

### M6: Update `index.ts` entry point
- **What**: Remove dead registrations, keep only: `set_thinking_mode`, `thought_recall`, `registerModeInjector`, `registerThoughtsSwitch`, `registerHooks`.
- **Files**: `index.ts`
- **Acceptance**: Clean entry point with no removed-command references.

### M7: Update README
- **What**: Reflect new unified architecture. Remove `/think` and `/thoughts:start` from docs.
- **Files**: `README.md`

## Validation

- `/thoughts:start should-we-migrate` → thread created + `root-ask` mode auto-activated
- `set_thinking_mode` called with no active thread → thread created + mode active
- `set_thinking_mode` called with active thread → mode switches, thread stays
- `/think` no longer registered
- `/thoughts:switch` still works
- `thought_recall` still works
- Status bar shows thread + mode
- System prompt injection still works on `before_agent_start`
