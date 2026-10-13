---
name: task
description: Runs a task end to end — clarify, plan, implement and verify, capture, publish — with approval gates after clarify, after plan, and before push
disable-model-invocation: true
---

# Task

Run one task through the stages below. This skill orchestrates; each loaded skill owns its own instructions, templates, and artifacts. Stop and wait at every approval gate. Approval applies only to the gate currently presented, never to future gates.

[stages/index.json](stages/index.json) holds the stage list (id, name, gate, skills, playbooks). `node scripts/stages.mjs` renders it and checks every named skill and playbook exists. Change a stage there first, then this body.

## Stage 1 — Clarify

1. Load `clarifier` and follow it fully, including its rule to classify each question before asking.
2. Gate: ask the user to confirm the brief. Until they do, stop. Do not build anything.

## Stage 2 — Plan

1. Load `planner` and follow it using the confirmed brief. Do not reopen settled questions. planner picks its mode (one-page, design contract, program plan) and saves the plan under `$HOME/.pi/agent/pi-work/` using its naming contract.
2. Show the exact plan path and contents.
3. Gate: ask "Approve this plan and start implementation?" Stop and wait. Approval authorizes Stage 3, not publication. If the user asked for planning only, stop after approval.

## Stage 3 — Implement and verify

This chat runs the playbook; the worker implements. Match the work to a [playbook](#playbooks), or design one with [figure-it-out](references/figure-it-out.md) when none fits or the effort is large or cross-cutting. Open the todo list with the playbook's steps copied verbatim; a step you skip stays with `skip: <reason>`.

1. Dispatch `worker` with the plan path, confirmed constraints, exact repo and cwd, edit boundaries, and the playbook step it owns. Fan-out steps (arena, swarm, interrogate) are run from this chat, since the worker has no subagent tool.
2. Dispatch a fresh, read-only `verifier` against the worker's result and the actual changed files. Wait for its verdict.
3. If verification fails, send the concrete findings to `worker` and verify again. Never advance on a failed or missing verdict. Infrastructure failures, or changes needing unapproved scope, stop and go to the user.

Local commits in scoped format are allowed and expected here (`git-workflow`'s commit-as-you-work). Push, PR, and merge steps in any playbook wait for Stage 5.

## Stage 4 — Capture

1. Load `capturer` and follow it. Capture one durable lesson if one exists; otherwise say no capture is warranted.
2. Show the destination and exactly what was added.

## Stage 5 — Publish

1. Load `publisher` and the `git-workflow` references it requires. Run read-only safety checks: separate task changes from unrelated work, check the branch and remote.
2. Gate: show the commits and the proposed push or PR scope, and ask for approval before any push, PR, or merge. Earlier approvals do not count.
3. After approval, publish. A PR uses publisher's [opening-a-pr](../publisher/references/opening-a-pr.md). Merging is never implied; it needs its own request and runs publisher's [shipping](../publisher/references/shipping.md).

## Resuming

If the user supplies an existing plan, read it and establish its approval state from the conversation. Do not infer approval from file existence. A confirmed plan plus an explicit implementation request resumes at Stage 3. If approval is unclear, show the plan and ask the Stage 2 gate question. A renamed artifact or a later capture keeps the original task prefix. To resume someone else's in-flight work, use `briefer`'s pickup mode first.

## Stage 3 rules

These govern behavior inside Stage 3. They never add a gate.

### Triggers

Name each reference that shaped a decision and the choice it changed. Cite only references you read this session.

- **Nontrivial change or "are we sure?"** Run `explainer`'s [how](../explainer/references/how.md) first.
- **A "which approach" or "what should this do" fork.** Classify it per `clarifier`'s [Before you ask](../clarifier/SKILL.md#before-you-ask). An observable fact gets a [prototype](playbooks/prototype.md), not a question.
- **New module, core types, or a public interface.** Sketch it with `planner`'s [design contract](../planner/references/architect.md) before implementing.
- **Parallel fan-out.** Use [swarm](references/dispatch/swarm.md) for coverage and exploration, [arena](references/dispatch/arena.md) for a bakeoff between competing implementations.
- **Contested design.** Run `reviewer`'s [interrogate](../reviewer/references/interrogate.md).
- **Prose you write, the reply included.** Follow `writer`. Prose the user wrote stays as written.
- **Before review.** Run `simplifier`'s [comments](../simplifier/references/comments.md) mode.
- **Driving a real UI.** Use `agent-browser`; run CLIs and TUIs directly. For bugs, reproduce on the same surface first.
- **Measuring or reporting a number.** Run `tester`'s [benchmark](../tester/references/benchmark-checklist.md) before acting on it.
- **Before calling it done.** Prove it per [`tester`](../tester/SKILL.md).
- **Repetitive edits.** Build the script or codemod instead ([build-the-lever](references/build-the-lever.md)).
- **PR-status request.** Poll `gh pr view <pr> --json state,mergedAt,mergeStateStatus,statusCheckRollup,autoMergeRequest` after each event. Opening a PR never starts a watch loop.
- **A skill is broken mid-task.** Note it in the reply and fix it as a separate `skills:` commit in dotfiles. Don't silently work around it.
- **Long or unattended work** ("going to bed", "run until X"). Keep a [decision log](references/decision-log.md).

### Autonomy

**Just do it.** Reversible, local work proceeds without asking: edits, local commits, test runs, prototypes.

**Always pause** for anything outward-facing or irreversible: push, PR, merge, deploys, data deletion, messages to people, ticket updates.

**Session overrides:** "don't stop", "going to bed", "run until done" → keep going on local work; outward-facing steps still wait.

**No is an acceptable answer.** Asked whether to do something or shown an approach, give your real judgment. Decline or push back when true. Agreement is not the default.

### Subagents

Dispatch through pi's subagent mechanism when available; otherwise run the pass inline in a fresh context. References that prescribe their own dispatch shape (how, why, arena, swarm, architect, interrogate) keep it. Every fan-out runs one model with varied briefs and isolates each parallel writer in its own worktree.

Give delegates file pointers, not context dumps. You own every subagent's work: review the diff and write your own summary. A second opinion is the same prompt run again in a fresh context.

**Fresh subagents by default.** New work, fix rounds, retries, and follow-ups go to a fresh subagent with consolidated scope: the original brief, every later directive, and the prior agent's report and branch. Reuse an existing subagent only when the work needs state that lives in it and is costly to move (its checkout, uncommitted changes, a running dev server).

### Writing the reply

Write the reply clean as you draft it; a cleanup pass afterward does not remove these patterns.

- **Short declarative sentences.** One thought per sentence.
- **No long-dash character anywhere**, and no mid-sentence colon connector ([unslop](../writer/references/unslop.md) rule 14). A colon before a list is fine.
- **Terse is not an excuse to drop content.** Every section the playbook's reply names stays.
- **Frame impact for the consumer and the maintainer** before any implementation detail.
- **Never fabricate a link, citation, or transcript reference.**
- **Every claim carries its evidence or its label** (measured, inferred, or guess) in the same sentence. Never hand the human a check you could run.

Comments follow the same rule: keep one only for a non-obvious *why* the code can't show. Test and verify scripts get no phase-narrating comments; the assertion message documents the step.

## Playbooks

Large or cross-cutting work, or work the user steps away from, routes to [figure-it-out](references/figure-it-out.md) even when a narrower playbook fits. Multi-PR programs go to `planner`'s program-plan mode in Stage 2.

- **Bug fix.** Reproduce, root-cause, and fix with runtime evidence. [playbooks/bug-fix.md](playbooks/bug-fix.md)
- **Perf issue.** A measured slowness traced and improved against a baseline. [playbooks/perf-issue.md](playbooks/perf-issue.md)
- **Hillclimb.** Sustained improvement of one metric against a target, with a decision log and one commit per accepted win. [playbooks/hillclimb.md](playbooks/hillclimb.md)
- **Feature.** New or changed behavior, built from a named data shape. [playbooks/feature.md](playbooks/feature.md)
- **Refactoring.** A behavior-preserving change to structure. [playbooks/refactoring.md](playbooks/refactoring.md)
- **Prototype.** A throwaway sketch to settle a design or empirical fork by observing it. [playbooks/prototype.md](playbooks/prototype.md)

Read-only investigations belong to `explainer`; pausing and resuming to `briefer`; opening PRs and shipping to `publisher`.
