---
name: planner
description: Writes a short, bounded implementation plan for approval before building
---

# planner

Turn confirmed understanding into a short written plan. The user approves it before any building starts.

## When to use

- After the `clarifier` skill confirms the summary.
- The user asks for a plan and the idea is already clear.
- A plan is needed before any building starts.

## Modes

The default is the one-page plan below. Two larger shapes have their own reference:

| mode | reference | trigger |
| --- | --- | --- |
| design contract | [references/architect.md](references/architect.md) | New module, core types, or code crossing a function boundary, where jumping to code would lock in the wrong shape. Sketch types, signatures, and boundaries first; the contract feeds the one-page plan. |
| program plan | [references/program-plan.md](references/program-plan.md) | Work spanning phases or stacked PRs. The one-page cap is lifted only here; each phase still ends in a verifiable unit. |

Design principles the modes apply, read when the trigger matches:

| principle | trigger |
| --- | --- |
| [foundational-thinking](references/foundational-thinking.md) | Before writing logic: core types and data structures first. |
| [model-the-domain](references/model-the-domain.md) | Stateful or heavily branching code, shape assumptions repeated across files. |
| [type-system-discipline](references/type-system-discipline.md) | Designing types or signatures: make illegal states unrepresentable. |
| [boundary-discipline](references/boundary-discipline.md) | Validation, error handling, framework adapters: guards at boundaries, pure core. |
| [redesign-from-first-principles](references/redesign-from-first-principles.md) | Integrating a new requirement into an existing design. |
| [exhaust-the-design-space](references/exhaust-the-design-space.md) | Novel interaction or architecture with no precedent: 2-3 competing prototypes. |
| [sequence-verifiable-units](references/sequence-verifiable-units.md) | Multi-step work: each unit ends in a state you can check. |

## Steps

1. If the `clarifier` skill produced a confirmed summary, use it as the basis for the plan. Do not reopen settled questions unless new evidence conflicts with it.
2. Read `assets/plan-template.md` relative to this skill's directory and `references/artifact-naming.md`, both relative to this skill's directory, for the shared naming contract. Create the destination directory if missing. Save the plan as `$HOME/.pi/agent/pi-work/<repo-or-folder>--YYYY-MM-DD--<task>--plan.md`, retaining the chosen prefix on updates. If the naming contract is missing, stop and request its installation rather than invent a conflicting convention.
3. Fill the template using exactly its four sections. No other headings. Include the confirmed brief in “What we're doing”; if a matching lesson file exists, link to it there using a relative Markdown link.
4. Show the exact plan path and contents to the user.
5. **Stop and ask** for approval. Do not implement until they approve.
6. If any step feels big, split it or cut it. Do not nest sub-steps.

## Plan format

Use `assets/plan-template.md` for the four required sections and their placeholder guidance. Replace the guidance with the plan content; keep the section headings unchanged.

## Must NOT

- Exceed one page outside program-plan mode. If longer, split the task or switch modes.
- Add headings beyond the four sections.
- Start implementing. The plan ends at approval.

## Example "What we're NOT doing"

> **What we're NOT doing**
> - No theme customization beyond light/dark
> - No per-page theme overrides
> - No settings page — just the header toggle

## Example interaction

> Agent: *(writes the plan in `$HOME/.pi/agent/pi-work/`, shows its exact path and contents)*
>
> "Here is the plan. Four sections: what we're doing, steps, what we're not doing, how we'll know it works. Approve this before I build?"
>
> User: "Approved."
>
> Agent: *(stops. The user can dispatch the `worker` agent next.)*
