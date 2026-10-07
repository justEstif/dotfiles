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

## Steps

1. If the `clarifier` skill produced a confirmed summary, use it as the basis for the plan. Do not reopen settled questions unless new evidence conflicts with it.
2. Read `assets/plan-template.md` relative to this skill's directory and `$HOME/.pi/agent/pi-work/AGENTS.md` for the shared naming contract. Create the destination directory if missing. Save the plan as `$HOME/.pi/agent/pi-work/<repo-or-folder>--YYYY-MM-DD--<task>--plan.md`, retaining the chosen prefix on updates. If the naming contract is missing, stop and request its installation rather than invent a conflicting convention.
3. Fill the template using exactly its four sections. No other headings. Include the confirmed brief in “What we're doing”; if a matching lesson file exists, link to it there using a relative Markdown link.
4. Show the exact plan path and contents to the user.
5. **Stop and ask** for approval. Do not implement until they approve.
6. If any step feels big, split it or cut it. Do not nest sub-steps.

## Plan format

Use `assets/plan-template.md` for the four required sections and their placeholder guidance. Replace the guidance with the plan content; keep the section headings unchanged.

## Must NOT

- Exceed one page. If longer, split the task into multiple plans.
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
