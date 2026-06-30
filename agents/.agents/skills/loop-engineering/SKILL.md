---
name: loop-engineering
description: "Design agent loops instead of one-off prompts: scheduled or goal-driven automation, worktree isolation, durable state, skills/policies, connectors/MCP, maker-checker subagents, cost budgets, safety gates, and human approval boundaries. Use when setting up recurring AI engineering workflows, repo maintenance loops, CI/PR/issue triage loops, long-running agents, autonomous or semi-autonomous coding tasks, or when replacing repeated manual prompting with a system that discovers, acts, verifies, records state, and escalates."
---

# Loop Engineering

Replace repeated prompting with a small control system that prompts agents for you.

A loop discovers work, isolates execution, applies persistent project knowledge, uses tools/connectors, splits maker from checker, records durable state, and decides whether to continue, stop, or escalate.

The goal is not maximum autonomy. The goal is reliable leverage: deterministic checks where possible, explicit human judgment where needed, and state that survives beyond one chat.

## Primitives

Every loop should name these pieces:

1. **Trigger / automation** — manual command, scheduled task, cron, CI, hook, `/loop`, `/goal`, or event from a connector.
2. **Isolation** — branch, git worktree, disposable checkout, or read-only mode so parallel agents do not collide.
3. **Skill / policy** — durable project knowledge: skills, AGENTS/CLAUDE instructions, ADRs, conventions, local commands.
4. **Connectors** — GitHub, CI, issue tracker, logs, metrics, Slack, database, browser, MCP, or other real tools.
5. **Maker/checker split** — one agent/step proposes or edits; another verifies against spec, tests, gates, and risk.
6. **State / memory** — file or tracker item outside chat: `LOOP.md`, `.ai/STATE.md`, issue, Linear ticket, run log.
7. **Budget / boundary** — max cadence, runtime, token/cost budget, permissions, allowlist, denylist, and kill switch.

If a loop lacks state, it rediscovers the same work. If it lacks a checker, it grades its own homework. If it lacks isolation, parallelism becomes chaos. If it lacks boundaries, it turns mistakes into repeated mistakes.

## Maturity

- **L0 One-off prompting** — human manually prompts and checks everything.
- **L1 Report-only loop** — automation discovers and summarizes; no writes beyond state/report.
- **L2 Assisted loop** — loop drafts changes in isolated worktree/branch; human approves before commit/PR/merge.
- **L3 Allowlisted action loop** — loop may perform narrow low-risk actions with deterministic checks and rollback path.
- **L4 Operating loop** — trigger → triage → state → worktree → maker → checker → CI/tooling → ticket/PR/state update, with monitoring and kill switch.

Default rollout: **L1 report-only → L2 assisted → L3 allowlisted**. Do not start with unattended writes.

## Design workflow

When asked to design or upgrade a loop:

1. Define the repeated human prompting being replaced.
2. Identify input signals: PR comments, CI failures, issues, logs, dependency alerts, recent commits, TODOs, review failures.
3. Choose the smallest useful trigger and cadence.
4. Define scope and permissions: read-only, draft-only, patch-only, specific directories, specific labels, no secrets, no prod writes.
5. Choose isolation: branch/worktree/disposable checkout/read-only.
6. Define state: exact file/tracker location and required fields.
7. Split maker/checker: independent verifier or deterministic gate must decide whether done is true.
8. Define human gate: what requires approval, what can be auto-closed, what must escalate.
9. Define budget and kill switch.
10. Validate with a dry run or intentional small violation before increasing autonomy.

## Common patterns

- **Daily triage** — read CI, issues, recent commits, TODOs; update state with ranked findings.
- **PR babysitter** — monitor PR checks/reviews; summarize blockers and next actions.
- **CI sweeper** — reproduce failing CI, draft a fix in a worktree, run local gate, request review.
- **Dependency sweeper** — patch-only updates with changelog links and tests; escalate majors.
- **Issue triage** — label/dedupe/summarize; draft reproduction steps; no product decisions without approval.
- **Post-merge cleanup** — detect temporary flags, dead code, migration residue, stale TODOs.
- **Observability-to-task** — group logs/errors into actionable tickets with user/business/error context.
- **Guardrail hardening** — convert repeated review comments and agent mistakes into lint/CI/pre-commit checks.

## Safety rules

- Start read-only unless the user explicitly asks for implementation.
- Prefer deterministic gates over prose reminders.
- Keep the maker away from the checker.
- Use worktrees for parallel write work.
- Store state outside the conversation.
- Make autonomy boring: narrow scope, explicit allowlist, clear rollback.
- Escalate ambiguity, architecture decisions, security-sensitive changes, destructive operations, and high-cost loops.
- Track cost and cadence. Subagents and frequent loops can burn tokens quickly.
- Reduce loop parallelism when human review bandwidth is the bottleneck.
- Quarantine flaky checks quickly; ignored signals destroy the loop.

## Useful artifacts

A minimal `LOOP.md` or state file should include:

```markdown
# Loop: <name>

Purpose: <repeated work replaced>
Trigger: <manual/scheduled/event>
Scope: <what it may read/write>
Isolation: <branch/worktree/read-only>
State: <where findings and attempts are recorded>
Maker: <agent/step that proposes or edits>
Checker: <agent/step/gates that verify>
Human gate: <approval/escalation rules>
Budget: <cadence/runtime/token/cost cap>
Kill switch: <how to stop/quarantine>
Last run: <date/result>
Next action: <smallest next step>
```

A loop is ready to increase autonomy only when its state, checker, human gate, budget, and kill switch have been tested.
