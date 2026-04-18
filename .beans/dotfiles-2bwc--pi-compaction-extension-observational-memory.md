---
# dotfiles-2bwc
title: 'Pi Compaction Extension: Observational Memory'
status: completed
type: epic
priority: normal
created_at: 2026-04-18T00:40:51Z
updated_at: 2026-04-18T01:34:21Z
---

Design and implement a pi custom compaction extension inspired by Mastra's Observational Memory. This involves creating a background summarization mechanism (Observer) and a higher-level consolidation mechanism (Reflector) to manage long-context conversations efficiently without losing critical details.


## Research Notes
- **pi custom compaction:** Hooks into `session_before_compact`. Can override the default sliding-window+summary compaction by returning a custom `compaction: { summary, firstKeptEntryId, tokensBefore }`.
- **Observational Memory map to Pi:**
  1. We don't just want one big summary at the end; we want a continuous running log of observations.
  2. We could trigger observation background tasks periodically (e.g. tracking token counts or on `turn_start`), saving observations as custom entries via `pi.appendEntry()`.
  3. During `session_before_compact`, we can run the **Reflector** to condense the accumulated observation entries and return that as the official `summary`.
  4. The main challenge is injecting the active observations into the context if they aren't part of the built-in summary yet. We can use `pi.on("before_agent_start")` to prepend the active observation log to the system prompt.

## Summary of Changes\n- Designed and built a pi custom compaction extension inspired by Mastra's Observational Memory.\n- Provides a real-time background Observer model that parses conversation turns and saves observations as custom session entries.\n- Intercepts Pi's default `session_before_compact` to act as a Reflector, consolidating all raw messages and previously generated observations into a clean, emoji-annotated memory log.\n- Integrates perfectly with Pi's interactive TUI via status lines and the `/om` configuration command.

## Summary of Changes\n\n- Created `observational-memory.ts` Pi extension implementing Mastra's Observer and Reflector mechanics.\n- Thread-scoped observations are tracked inline during the session.\n- Resource-scoped (cross-session) memory is implemented by writing Reflector insights to `.pi/om-memory.txt` and loading them back on startup.\n- TUI configuration UI is exposed via `/om` to allow users to select their background inference model.
