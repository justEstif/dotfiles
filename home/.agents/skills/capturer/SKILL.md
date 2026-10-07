---
name: capturer
description: Captures one durable, non-obvious lesson from completed work for future sessions
---

# capturer

Capture one lesson so the next session starts smarter.

## When to use

- After completed work passes verification.
- When a bug had a non-obvious cause.
- When a decision took longer than it should have.
- When the user asks to capture a lesson.

## Steps

1. Look at the recent work and pick **one** durable, non-obvious lesson. Skip routine facts; if none would save future work, say so and stop without creating a lesson file.
2. Read `assets/lesson-template.md` relative to this skill's directory and `$HOME/.pi/agent/pi-work/AGENTS.md` for the shared naming contract. If that contract is missing, stop and request its installation.
3. With a plan in pi-work, retain its exact prefix and replace `--plan.md` with `--learned.md`. Otherwise use the naming contract to select `$HOME/.pi/agent/pi-work/<repo-or-folder>--YYYY-MM-DD--<task>--learned.md`; do not move historical plans or lessons. Get the current local time (`HH:MM`) for the entry heading.
4. Read the target lesson file if it exists. Check for semantic duplicates only in that file. If the same lesson is already there, say so and stop without writing.
5. Fill the template with the local time, short title, and lesson. Max three lines per entry; omit optional context if unnecessary.
6. Create the destination directory and file if missing. Append one non-duplicate entry without replacing existing content; separate entries with a blank line. If its paired plan exists, add one relative link to it outside the lesson entry, and ensure the plan links back within “What we're doing” without changing its approved scope or four-section shape.
7. Show the user the destination path and exactly what was added, including any navigation links added to either file.

## Entry rules

- Line 1: `## HH:MM — short title` using local time.
- Line 2: the lesson itself.
- Line 3: optional context or consequence. Omit if line 2 is enough.
- No essays. If it needs more than three lines, it belongs in a doc, not here.
- Plan navigation links are file-level metadata, not part of the three-line lesson entry.

## Must NOT

- Write more than one lesson per run.
- Log routine facts or create a lesson merely to complete a workflow.
- Duplicate an entry in the target task's lesson file.
- Check other tasks for duplicates or migrate existing artifacts.
- Ask the user to approve before appending. Append, show, done.

## Example

> Agent: "Added to $HOME/.pi/agent/pi-work/example-app--2026-07-11--theme-toggle--learned.md:
>
> ## 14:30 — Theme flash on load
> The theme must be set in a blocking inline script, not in React.
> Anything set after hydration flashes the wrong theme."
