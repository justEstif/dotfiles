# Plan: Thoughts v2 Extension

## Purpose

Replace the existing thoughts extension and thought-partner skill with a single pi extension that unifies named thread tracking with structured thinking modes. The extension gives the model (and user) explicit control over which thinking framework is active, persists that state across compaction, and injects mode-specific instructions efficiently.

Success = you never notice the old skill or extension are gone because v2 does everything they did, better.

## Context

### What exists today

| Component | Location | What it does |
|---|---|---|
| Thoughts extension (v1) | `~/.pi/agent/extensions/thoughts/` | Tracks named thought threads across sessions. Has `/thoughts:start`, `/thoughts:switch`, `thought_recall` tool. Persists anchors, summaries, labels via custom entries. Auto-labels branch points on `/tree`. |
| Thought-partner skill | `~/.agents/skills/thought-partner/` | Routes thinking requests to 3 frameworks: sycophancy (adversarial), root-ask (investigation), grill-me (structured interrogation). Pure prompt engineering via SKILL.md + reference `.md` files. |

### Key constraints

- User's default provider: `zai` / GLM-5.1
- pi has **no native sampling settings** (unlike oh-my-pi which has `temperature`, `topP`, `topK`, `minP`, `presencePenalty`, `repetitionPenalty` as first-class settings with TUI pickers)
- `before_provider_request` can patch provider payloads but is provider-specific and fragile
- Temperature control deferred to v3 — wait for pi native support or add as an extension hook later
- User uses `stow` for `~/.agents/skills/` — archived skills should go outside the stowed folder (`~/.agents/_skills-archive/`)
- pi scans `~/.agents/skills/` recursively; `_skills-archive/` is outside scan path

### Relevant pi extension APIs

- `pi.registerTool()` — tool callable by LLM
- `pi.registerCommand()` — slash commands (`/think`, `/thoughts:start`, etc.)
- `pi.on("before_agent_start")` — inject mode-specific system prompt instructions per turn
- `pi.on("before_provider_request")` — patch provider payloads (deferred to v3 for temperature)
- `pi.on("turn_end")` — schedule background summary generation
- `pi.on("session_before_tree")` — auto-label branch points
- `pi.on("input")` — intercept/route input
- `pi.appendEntry()` / custom entries — persist extension state (survives restart, not in LLM context)
- `ctx.sessionManager` — read session entries for state reconstruction

### Reference files to port

- `~/.agents/skills/thought-partner/references/sycophancy.md` — adversarial pushback framework
- `~/.agents/skills/thought-partner/references/root-ask.md` — investigation framework
- `~/.agents/skills/thought-partner/references/grill-me.md` — structured interrogation framework

## Approach

### Why an extension, not keep the skill?

- **State tracking**: Extension can track active mode in custom entries; skill relies on model memory
- **Compaction resilience**: Extension re-injects active mode via `before_agent_start` every turn
- **Explicit control**: `/think` command + `set_thinking_mode` tool give model and user a discrete activation path
- **Thread integration**: Thinking modes attach to named threads — mode + thread are one concept
- **Token efficiency**: Only the active mode's reference gets injected, not all mode descriptions

### Why not temperature in v2?

- oh-my-pi implements sampling as deep platform infrastructure (settings schema → Agent class → every provider serializer). Pi doesn't have this.
- `before_provider_request` is a workaround, not a proper integration. Provider-specific payload shapes make it fragile.
- No evidence yet that temperature meaningfully changes thinking mode quality (untested assumption — failure point F5).
- If pi adds native sampling later, any extension hack becomes redundant or conflicting.

### Architecture

```
thoughts-v2/
├── index.ts                    # Entry point — registers everything
├── package.json
├── types.ts                    # Shared types (mode enum, thread state, custom entry shapes)
├── modes/
│   ├── registry.ts             # Mode definitions, reference file paths
│   └── injector.ts             # before_agent_start handler — injects active mode reference
├── commands/
│   ├── think.ts                # /think [mode] — set or display active mode
│   ├── thoughts-start.ts       # /thoughts:start <name> — ported from v1
│   └── thoughts-switch.ts      # /thoughts:switch — ported from v1
├── tools/
│   ├── set-thinking-mode.ts    # Tool for LLM to select a mode
│   └── thought-recall.ts       # Ported from v1
├── lib/
│   ├── hooks.ts                # turn_end, input, session_before_tree — ported from v1
│   ├── index-file.ts           # thoughts-index.jsonl — ported from v1
│   ├── summary.ts              # Background summary generation — ported from v1
│   └── helpers.ts              # findThoughtAncestor, captureSnapshot, etc. — ported from v1
└── references/
    ├── sycophancy.md           # Ported from skill
    ├── root-ask.md             # Ported from skill
    └── grill-me.md             # Ported from skill
```

Key design choices:
- Reference files stay as `.md` — don't convert to TypeScript. Content separate from mechanism.
- Mode state stored as a custom entry (`kind: "mode_change"` with `mode`, `anchorId` linking to active thread if any)
- `before_agent_start` re-injects on every turn: reads the latest mode custom entry, loads the corresponding reference file, appends to system prompt. This costs tokens but guarantees continuity.
- Routing logic from the skill (auto-detect from user intent) is preserved as a fallback in the `set_thinking_mode` tool description — the model still auto-routes, but the tool call makes it explicit and stateful.

## Milestones

### M0: Skeleton
Extension loads, registers `/think` command and `set_thinking_mode` tool. No references, no thread tracking — just the wiring. Validates that the model actually calls the tool.

### M1: References
Mode selection loads the correct reference `.md` via `before_agent_start` injection. Prompt-based routing from the skill preserved as fallback. Mode state persisted in custom entries.

### M2: Thread migration
Port thread tracking from v1: `/thoughts:start`, `/thoughts:switch`, `thought_recall` tool, index file, helpers, background summaries, branch auto-labeling. Thinking modes now attach to threads.

### M3: Compaction resilience
Active mode re-injected after compaction via `before_agent_start` reading from custom entry state. Test: start a mode, force compaction, verify mode is still active.

### M4: Polish
TUI status bar shows active mode via `ctx.ui.setStatus()`. `/think` with no args shows current state. Mode override works (switching mid-thread). Clean up edge cases.

### M5: Archive & cutover
Archive thought-partner skill to `~/.agents/_skills-archive/thought-partner/`. Remove old thoughts extension from `~/.pi/agent/extensions/thoughts/`. Update any settings references.

### M6: Temperature (v3, deferred)
Wait for pi native sampling support. If it arrives, add per-mode temperature presets. If not, implement via `before_provider_request` with per-provider payload mapping.

## Failure Points

| ID | Failure mode | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| F1 | Temperature injection breaks on provider switch | Deferred to v3 | N/A | Log payload shapes per provider when v3 ships |
| F2 | Model ignores or fights the mode tool — doesn't call `set_thinking_mode` | Medium | Core feature breaks | Use `before_agent_start` to inject strong routing instruction. Keep skill's routing logic as fallback. Tool is enforcement, not only activation. |
| F3 | Compaction loses active mode context | Medium | Mode resets silently | Re-inject on every `before_agent_start`. Custom entries survive compaction. |
| F4 | Merging two systems doubles maintenance surface | Medium | Slower iteration | Keep references as `.md`. Port v1 code with minimal changes. Add new code only for mode system. |
| F5 | Mode presets wrong for model behavior (deferred temperature) | Deferred | N/A | Will validate empirically in v3 |
| F6 | Mode conflicts during session (user wants root-ask while in grill-me) | Low | Confusion | Last explicit selection wins. Don't lock. Allow override. |
| F7 | Portability loss — pi-only, not cross-harness | Accepted | Skill users on other harnesses lose access | Archived skill still available at `~/.agents/_skills-archive/` |
| F8 | Debugging opacity — TypeScript hooks vs readable SKILL.md | Low | Harder troubleshooting | Log mode transitions. Keep reference `.md` files inspectable. |

## Decisions

- 2026-06-03: **Full replacement** of both thoughts extension and thought-partner skill — not a parallel new extension. Rationale: one system to maintain, one mental model for the user.
- 2026-06-03: **Mode-based temperature presets deferred to v3** — pi lacks native sampling support; `before_provider_request` is fragile and provider-specific. Wait for platform support or validate the assumption that temperature matters for mode quality.
- 2026-06-03: **Archive location `~/.agents/_skills-archive/`** — outside pi scan path, outside stow-managed folder. Clean break, no token waste.
- 2026-06-03: **Advisory deprecation then archive** — keep thought-partner skill active during M0–M1, archive once mode injection is validated.
- 2026-06-03: **Reference files stay as `.md`** — content separate from mechanism. Easier to edit, inspect, and debug.

## Validation

- **M0**: `pi -e ./thoughts-v2/index.ts` loads without error. `/think sycophancy` sets mode. `set_thinking_mode` tool appears in `pi.getAllTools()`.
- **M1**: Start a mode via tool or command. Verify the correct reference content appears in the system prompt (check via `ctx.getSystemPrompt()`). Verify mode survives a new user prompt.
- **M2**: `/thoughts:start "Should we use REST or GraphQL?"` creates a thread. `/thoughts:switch` lists threads. `thought_recall` retrieves anchored text. All v1 functionality works.
- **M3**: Start a mode, generate enough conversation to trigger compaction, verify mode is still active and correct reference injected.
- **M4**: Status bar shows active mode. `/think` with no args returns current state. Switching mode mid-thread works without error.
- **M5**: `~/.agents/skills/thought-partner/` no longer exists. `~/.pi/agent/extensions/thoughts/` no longer exists. Extension at new location works.

## Outcome

M0–M3 complete on branch `thoughts-v2`. Extension at `thoughts-v2/` with:
- `/think` command + `set_thinking_mode` tool for mode activation
- `before_agent_start` injection of active mode reference into system prompt
- Full v1 thread tracking ported (commands, tools, hooks, index, summaries)
- Compaction resilience via custom entries (survive compaction natively)
- Status bar restoration on `session_start`

Remaining: M4 (polish), M5 (archive & cutover).
