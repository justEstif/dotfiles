---
name: plan
description: Create and maintain lightweight Markdown plans in locally excluded .ai/plans/ for complex, ambiguous, risky, or multi-session work. Use when the user asks for a plan, PLAN.md-style artifact, implementation plan, design plan, migration plan, execution plan, roadmap, handoff, or when reasoning, decisions, discoveries, validation, or recovery context should survive the chat. Tasks and checklists are optional, not required.
---

# Plan

Use Markdown plans as durable reasoning artifacts. A plan exists when future execution would benefit from preserved context, rationale, decisions, or validation criteria — not merely because work has multiple steps.

## Core Judgment

Before creating or updating a plan, ask: **Would a fresh agent or human make better decisions with this written down?**

Create a plan for:
- ambiguous work where assumptions need to be made explicit
- significant features, refactors, migrations, investigations, or rollouts
- work likely to span sessions or require handoff
- decisions whose rationale should survive implementation
- risky changes needing validation, rollback, or sequencing

Do not create a plan for trivial edits, obvious one-shot fixes, or purely conversational advice unless the user explicitly asks.

## File Convention

Default to `.ai/plans/<slug>.md` for working plans. This path is hidden, tool-agnostic, and has precedent in agent-planning workflows.

Before writing there, ensure `.ai/plans/` is locally excluded from git via `.git/info/exclude`. Add `.ai/plans/` there when absent. Do not modify tracked `.gitignore` unless the user explicitly wants the convention shared by the repository.

If operating in a read-only planning context, do not write files; recommend the path and provide plan content for the caller to save.

Use `.ai/plans/PLAN.md` only when the repository has one dominant active plan.

Use `.ai/plans/<slug>.md` when multiple efforts may coexist or when the plan is scoped to a feature/refactor/investigation.

If a repo already has an established ignored planning directory, follow that convention instead of creating `.ai/plans/`.

Before creating a new plan, look for existing relevant plan files and update the best match instead of duplicating context.

## Plan Shape

Include only sections that earn their keep. Prefer this order:

```markdown
# Plan: <title>

## Purpose

What this plan is trying to make true, and what success looks like.

## Context

Repo facts, constraints, prior decisions, links, and assumptions needed to resume without chat history.

## Approach

The chosen direction and why it beats plausible alternatives.

## Milestones

Optional. Use when sequencing, checkpoints, or staged validation matter.

## Tasks

Optional. Use checkboxes only when they reduce ambiguity or help execution tracking.

## Decisions

- YYYY-MM-DD: Decision — rationale and consequences.

## Discoveries

- YYYY-MM-DD: Finding — implication for the plan.

## Validation

How to prove the work succeeded. Include commands, observable behavior, expected outputs, or review criteria when known.

## Outcome

Final result, gaps, follow-ups, and whether the plan is complete, obsolete, or superseded.
```

## Quality Bar

A useful plan is self-contained enough to restart from. It preserves:
- the why, not just the what
- assumptions that affect implementation
- decisions and rejected alternatives when they matter
- discoveries that changed the direction
- validation that proves success beyond “code changed”

Keep plans concise. Omit boilerplate sections when they would be empty or obvious.

## Updating Existing Plans

When work proceeds, update the plan at the point where knowledge changed:
- new fact learned → `Discoveries`
- choice made → `Decisions`
- strategy changed → `Approach` plus a decision entry
- work completed or abandoned → `Outcome`
- execution needs decomposition → add `Milestones` or `Tasks`

If a plan is stale, do not silently follow it. Mark what is obsolete, explain why, and update the current direction.

## NEVER

- **NEVER create a plan for trivial work.**
  **Instead:** answer or implement directly.
  **Why:** planning overhead becomes noise and trains agents to produce bureaucracy.

- **NEVER force a task list.**
  **Instead:** add `Tasks` only when checkboxes clarify execution or handoff.
  **Why:** many plans are about reasoning, tradeoffs, or validation rather than task tracking.

- **NEVER let the plan depend on chat history.**
  **Instead:** include the minimum context a fresh agent/human needs to continue.
  **Why:** the point of a plan is recovery across sessions, compaction, and handoff.

- **NEVER record only the chosen steps without rationale.**
  **Instead:** capture why the approach was chosen and which constraints shaped it.
  **Why:** future agents can reproduce instructions but cannot infer intent from a checklist.

- **NEVER keep stale plans silently.**
  **Instead:** update `Outcome`, add a supersession note, or revise the affected sections.
  **Why:** outdated plans are worse than no plan because they look authoritative.

- **NEVER modify tracked `.gitignore` just to hide local plans.**
  **Instead:** use `.git/info/exclude` by default.
  **Why:** local plans are agent working state, not repository policy.
