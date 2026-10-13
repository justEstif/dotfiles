---
name: briefer
description: Rebuilds working context by catching the user up, recalling past sessions, resuming in-flight work, and checkpointing work before a pause
---

# briefer

Keep work continuous across messages, sessions, and agents. The read side rebuilds context; the write side leaves a clean checkpoint.

## When to use

- "Catch me up", "what happened while I was away".
- "Recall my work on X", "where did I leave off".
- Resuming or taking over a prior agent's work from a session or a pushed branch.
- Pausing: going offline, an explicit pause, or imminent context compaction.

## Modes

| mode | reference | trigger |
| --- | --- | --- |
| ketchup | [references/ketchup.md](references/ketchup.md) | Summarize this one chat since the user's last message. |
| recall | [references/recall.md](references/recall.md) | Rebuild context across past sessions plus live repo state. |
| pickup | [references/session-pickup.md](references/session-pickup.md) | Resume one specific prior session's in-flight work. |
| pause | [references/pause-safely.md](references/pause-safely.md) | Checkpoint in-flight work so pickup can resume it. |

## Rules

- **Catch-up with a named feature or file routes to recall**, not ketchup.
- **Pause and pickup are a pair.** Pause writes what pickup reads; keep their formats in step.
- Plain voice comes from `writer`'s plain mode. Visuals come from `show-me`.
- Durable lessons belong to `capturer`, not to a checkpoint.

## Must NOT

- Push or open a PR as part of a pause. A local `wip:` commit is the limit.
