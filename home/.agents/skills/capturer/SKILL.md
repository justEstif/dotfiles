---
name: capturer
description: Captures one durable lesson from completed work; on reflect, mines the session into skill edits; on repeated corrections, encodes the lesson as a check
---

# capturer

Capture one lesson so the next session starts smarter.

## When to use

- After completed work passes verification.
- When a bug had a non-obvious cause.
- When a decision took longer than it should have.
- When the user asks to capture a lesson.

## Modes

| mode | reference | trigger |
| --- | --- | --- |
| lesson (default) | the steps below | One durable lesson from finished work. |
| reflect | [references/reflect.md](references/reflect.md) | "Reflect", or mine the session for learnings and route them into skills. Never writes to the lesson log; its own approval gate lives in that file. |
| encode | [references/encode.md](references/encode.md) | The user keeps correcting the same mistake. Turn it into a lint, type, test, or script. |

## Lesson mode

1. After completed work passes verification, decide whether one durable lesson exists. If none does, say no capture is warranted and stop.
2. Write one lesson to the matching `<prefix>--learned.md` in `~/.agents/work/`, following the naming contract in planner's [references/artifact-naming.md](../../planner/references/artifact-naming.md), using the entry format in `assets/lesson-template.md`.
3. Link the paired plan and lesson artifacts to each other with relative Markdown links when both exist.
4. Show the destination path and exactly what was added.

One lesson per capture. Never session logs or task state.
