### Program plan (multi-phase or multi-PR)

The plan is the deliverable. Do not implement. Execution starts only on the user's explicit go, through `task`.

1. When the change is one or two files with an obvious approach, skip this mode and write the one-page plan.
2. Settle open questions by [prototype](../../task/playbooks/prototype.md) before writing. Keep each prototype's branch, SHA, and screenshots for the plan. Ask the user only about product or preference calls no run can settle, per `clarifier`'s [Before you ask](../../clarifier/SKILL.md#before-you-ask).
3. Explore in subagents or fresh passes that return file pointers, conventions, test commands, and entry points, not dumps.
4. Save the plan under `$HOME/.pi/agent/pi-work/` with planner's naming contract, using the skeleton below.
5. Validate every skill and path the plan names: `node ~/.agents/scripts/check-skill-links.mjs` and `node ~/.agents/skills/task/scripts/stages.mjs` for skills; check repo paths directly.
6. Show the plan path and stop for approval.

## Skeleton

```markdown
# <Program> plan

<Under ten lines: what changes, for whom, and the PR ids in order.>

## PRs

### <PR id>: <scoped title>

- **Depends on:** <PR id, or "none, branches from main">
- **Files:** <globs this PR may touch>
- **Change:** <one to three sentences>
- **Verify:** <the unit command, the real-surface check (agent-browser or the CLI), and the perf number if one applies, each with its pass predicate>
- **Review gate:** <"interaction change: user reviews screenshots before merge", or "none">

## Risks

<What could break, and the one fact that makes each risk acceptable.>
```

## Rules

- One PR is one change with its own evidence. Each PR builds and passes standalone, per `git-workflow`'s PR-size budget.
- Stacks use gh-stack: the root targets `main`, each child targets its parent branch.
- Commits use scoped format (`<scope>: <description>`) per `git-workflow`.
- Every push, PR, and merge goes through `task`'s Stage 5 gate. Merging is the user's call, PR by PR, through `publisher`'s [shipping](../../publisher/references/shipping.md).
