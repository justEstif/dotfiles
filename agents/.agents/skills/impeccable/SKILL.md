---
name: impeccable
description: "Route to the right Impeccable command for UI/design work. Use when the user invokes /impeccable or asks which Impeccable command to use. Triggers: impeccable, /impeccable, which command, design command, UI command, improve design, audit UI, polish UI, critique design."
---

# Impeccable — Command Router

Before routing: confirm Impeccable is installed. If not, ask the user:

> "Impeccable isn't installed. Run `npx skills add pbakaus/impeccable` to add it — want me to do that?"

## Setup Gate (run once per project)

**Run `/impeccable teach` first** before any other command. It writes `PRODUCT.md` and offers `DESIGN.md`. Every later command reads both. Skip it and commands fall back to generic SaaS patterns — the floor is meaningfully higher with context.

If `PRODUCT.md` already exists, skip teach.

## Routing Table

| Situation                                        | Command                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| Starting fresh — new feature or page             | `/impeccable shape` → `/impeccable craft`                                |
| Something feels off, can't name it               | `/impeccable live`                                                       |
| Typography feels generic or accidental           | `/impeccable typeset`                                                    |
| Layout / spacing / visual rhythm is broken       | `/impeccable layout`                                                     |
| Design is too safe, too beige                    | `/impeccable bolder` or `/impeccable colorize`                           |
| Design is too loud, too busy                     | `/impeccable quieter` or `/impeccable distill`                           |
| Want personality without redesigning             | `/impeccable delight`                                                    |
| Motion/animation needed                          | `/impeccable animate` (purposeful) · `/impeccable overdrive` (cinematic) |
| UX copy is confusing                             | `/impeccable clarify`                                                    |
| Doesn't work on mobile                           | `/impeccable adapt`                                                      |
| First-run / empty states                         | `/impeccable onboard`                                                    |
| Edge cases, i18n, error states                   | `/impeccable harden`                                                     |
| UI feels slow                                    | `/impeccable optimize`                                                   |
| "Is this any good?"                              | `/impeccable critique`                                                   |
| Technical quality check (a11y, perf, responsive) | `/impeccable audit`                                                      |
| Final pre-ship pass                              | `/impeccable polish`                                                     |
| Find reusable patterns / tokens                  | `/impeccable extract` → `/impeccable document`                           |

## Command Clusters

**Energy dial** — bolder ↔ quieter, colorize ↔ distill
**Specific discipline** — typeset, layout, animate, clarify, adapt, onboard, harden, optimize
**Review** — critique (opinionated), audit (scored), polish (final pass)
**System** — teach, document, extract
**Build** — shape, craft, live

Call `/impeccable` alone for freeform design work with no specific discipline in mind.

## NEVER

- **NEVER pin every command**
  **Why:** Re-explodes the `/` menu that v3.0 consolidation cleaned up.
  **Instead:** Pin only the 2–3 you reach for daily.

- **NEVER run alongside Anthropic's frontend-design skill**
  **Why:** Vocabulary collision — they cancel each other out.
  **Instead:** Pick one. Impeccable is actively maintained; Anthropic's is not.

- **NEVER treat Impeccable as a linter**
  **Why:** It's an opinionated design partner. Ignoring its opinions without a reason degrades output.
  **Instead:** Push back with a reason — it will work with you.

- **NEVER skip `teach` on a new project**
  **Why:** Commands default to generic patterns without `PRODUCT.md`.
  **Instead:** Run teach once; every later command benefits automatically.
