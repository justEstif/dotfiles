---
# dotfiles-jqn6
title: Debug OM Extension Token Tracking and Triggering
status: completed
type: bug
priority: normal
created_at: 2026-04-18T01:36:07Z
updated_at: 2026-04-18T01:54:44Z
---

The observational memory background trigger is not activating even when tokens (21.3k) exceed the 10.0k threshold.

The turn_end event was silently aborting because observerModel was undefined if the session had been restored/reloaded without hitting the full 'session_start' lifecycle event where it was originally initialized. Added a fallback to automatically assign gemini-2.5-flash inside turn_end if it's missing.

\n\nAlso added a more robust default model selector (finding the first available fast model like haiku/flash/mini instead of hardcoding gemini-2.5-flash) and enabled detailed error logging to .pi/om-debug.log if the observation process fails silently.

\n\nResolved LSP syntax errors in `~/.pi/agent/extensions/` by generating a `package.json`, installing the Pi types (`@mariozechner/pi-coding-agent`, `@mariozechner/pi-tui`, `@mariozechner/pi-ai`), adding a `tsconfig.json`, and fixing the generic type signatures for `Model` to `Model<any>` within the `observational-memory.ts` file.
