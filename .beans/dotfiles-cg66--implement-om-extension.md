---
# dotfiles-cg66
title: Implement OM Extension
status: completed
type: task
priority: normal
created_at: 2026-04-18T00:54:18Z
updated_at: 2026-04-18T01:34:16Z
parent: dotfiles-2bwc
---

Write the om-extension.ts file that registers the /om command, tracks tokens, runs the Observer in the background, and hooks into session_before_compact for the Reflector.

Drafted initial `/om` configuration and custom compaction Reflector.

Moved om extension file to ~/.pi/agent/extensions

Fixed model registry API call: changed `ctx.modelRegistry.getModels()` to `ctx.modelRegistry.getAll()`.


## Observer mechanics
- We will track recent tokens using `ctx.sessionManager.getBranch()`.
- We can run this check on `turn_end`.
- We filter the branch to find all messages since the *last* recorded Observation entry.
- If the token count of these unobserved messages exceeds `OBSERVATION_THRESHOLD` (e.g. 5,000 for our simple version), we trigger a background `complete()` call to summarize them into an Observation entry via `pi.appendEntry("om-observation", { summary, range })`.
- We will also hook `before_agent_start` to read all previous `om-observation` entries and prepend them to the system prompt so the LLM actually *has* the Observational Memory context.


## Summary of Changes
- Created `observational-memory.ts` extension for pi.
- Registers `/om` to select a background observation model.
- Updates the Pi footer status bar (`ctx.ui.setStatus`) live with remaining tokens until an observation is triggered.
- Listens to `turn_end`, checks unobserved tokens against `OBSERVATION_THRESHOLD`, and fires async `complete()` calls if crossed.
- Appends `om-observation` custom entries to the session graph.
- Hooks `before_agent_start` to inject these background observations into the main agent's system prompt so it always has access to the long context.
- Implements the `session_before_compact` Reflector sweep to squash raw messages AND existing observations into Pi's default compacted summary format.

Fixed TUI freeze issue with `/om` command by explicitly routing keyboard input to the SelectList child.

Implemented resource-scoped cross-session memory tracking in `observational-memory.ts`. The Reflector now splits output into Thread and Resource observations, saving the latter to `.pi/om-memory.txt` and injecting it into the system prompt for all future sessions in that directory.
