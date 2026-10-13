### Program plan (multi-phase or multi-PR)

The plan is the deliverable. Do not implement. Execution starts only on the user's explicit go, through `task`.

1. When the change is one or two files with an obvious approach, skip this mode and write the one-page plan.
2. Settle open questions by [prototype](../../task/playbooks/prototype.md) before writing. Keep each prototype's branch, SHA, and screenshots for the plan. Ask the user only about product or preference calls no run can settle, per `clarifier`'s [Before you ask](../../clarifier/SKILL.md#before-you-ask).
3. Explore in subagents or fresh passes that return file pointers, conventions, test commands, and entry points, not dumps.
4. Save the plan in the work directory from planner's [naming contract](artifact-naming.md), from [assets/program-plan-template.md](../assets/program-plan-template.md).
5. Validate every skill and path the plan names: run the `task` skill's stage validator (`stages.mjs`) and any link checker the skills repo provides; check repo paths directly.
6. Show the plan path and stop for approval.

## Rules

- One PR is one change with its own evidence. Each PR builds and passes standalone, per `git-workflow`'s PR-size budget.
- Stacks use gh-stack: the root targets `main`, each child targets its parent branch.
- Commits use scoped format (`<scope>: <description>`) per `git-workflow`.
- Every push, PR, and merge goes through `task`'s Stage 5 gate. Merging is the user's call, PR by PR, through `publisher`'s [shipping](../../publisher/references/shipping.md).
