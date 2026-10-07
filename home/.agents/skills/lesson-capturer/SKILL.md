---
name: lesson-capturer
description: Captures one durable, non-obvious lesson from recent work for future sessions
---

# lesson-capturer

Capture one lesson so the next session starts smarter.

## When to use

- After the `publisher` skill completes.
- When a bug had a non-obvious cause.
- When a decision took longer than it should have.
- When the user asks to capture a lesson.

## Steps

1. Look at the recent work and pick **one** lesson. Not two. Not a list.
2. Read `assets/lesson-template.md` relative to this skill's directory before writing the entry.
3. Get the current local date (`YYYY-MM-DD`) and time (`HH:MM`). Use `$HOME/.pi/agent/pi-learned/YYYY-MM-DD-learned.md` for that date as the destination.
4. Read that day's file if it exists. Check for a duplicate only in that file. If the same lesson is already there, say so and stop without writing.
5. Skip routine facts. Do not log "added a component" or "fixed a typo".
6. Fill the template with the local time, a short title, and the lesson. Max three lines; omit the optional context line if it is unnecessary.
7. Create `$HOME/.pi/agent/pi-learned/` and that day's file if missing. Append one non-duplicate entry without replacing existing content; separate entries with a blank line.
8. Show the user the destination path and exactly what was added.

## Entry rules

- Line 1: `## HH:MM — short title` using local time.
- Line 2: the lesson itself.
- Line 3: optional context or consequence. Omit if line 2 is enough.
- No essays. If it needs more than three lines, it belongs in a doc, not here.

## Must NOT

- Write more than one lesson per run.
- Log routine facts that would not save future-you real time.
- Duplicate an entry in that day's file.
- Check other days for duplicates or migrate existing lessons.
- Ask the user to approve before appending. Append, show, done.

## Example

> Agent: "Added to $HOME/.pi/agent/pi-learned/2026-07-11-learned.md:
>
> ## 14:30 — Theme flash on load
> The theme must be set in a blocking inline script, not in React.
> Anything set after hydration flashes the wrong theme."
