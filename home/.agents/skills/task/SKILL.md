---
name: task
description: "Run one task end to end: clarify, plan, implement with verification, capture, publish — approval gates after clarify, plan, and publish only; stages 3–4 run unattended under poteto-mode rigor (playbook-matched execution, unslopped prose, verified work). Entry point for a task or approved plan path, poteto-mode / 'work poteto-style' requests, and every playbook trigger: investigation (read-only how does X work / why was Y built / are we sure / should we do X or Y), bug fix (reproduce, root-cause, fix a defect), perf issue (measured slowness vs baseline), hillclimb (sustained improvement of one metric against a target), feature (new behavior from a named data shape), refactoring (behavior-preserving reshape), prototype (throwaway sketch to settle a design or empirical fork), multi-phase or multi-PR plan, session pickup (resume a prior agent's in-flight work), pause safely (clean checkpoint to resume from), opening a PR, shipping (land a green stack with independent per-PR verdicts) — and 'figure it out': design an auditable bespoke playbook for a large migration, ambitious multi-part change, or work a human reviews after stepping away, when no narrower playbook fits."
source: https://github.com/cursor/plugins/tree/main/pstack
license: MIT (pstack, by poteto)
---

# Task

Run one task through the stages below. This skill orchestrates skills; skills own their instructions, templates, and artifact-writing behavior. Stop and wait at every approval gate. Approval applies only to the gate currently presented, never to future gates.

The stage list is data, not prose. [stages/index.json](stages/index.json) holds one row per stage — id, name, gate question, skills loaded, playbook matcher — and `node scripts/stages.mjs` renders the list and validates that every named skill, playbook, and reference exists on disk. Editing stages means editing the index, never this body.

Attribution: the five-stage spine and resuming rules come from the retired local prompt `~/.pi/agent/prompts/task.md`; the rigor layer (non-negotiables, principles index, playbooks) and figure-it-out come from pstack's poteto-mode and figure-it-out skills (poteto, MIT).

## Stage 1 — Clarify

1. Load `clarifier` and follow it fully: inspect relevant context, ask only unsettled questions, wait for answers, and produce its 3-line brief.
2. Gate: ask the user to confirm the brief. Until they do, stop. Do not build anything.

## Stage 2 — Plan

1. Load `planner` and follow it using the confirmed brief. Do not reopen settled questions. The skill owns its asset template and saves the plan under `$HOME/.pi/agent/pi-work/` using the shared naming contract.
2. Show the exact plan path and contents.
3. Gate: ask "Approve this plan and start implementation?" Stop and wait. An explicit approval to that question authorizes Stage 3, not publication. If the user asks for planning only, stop after plan approval until they explicitly request implementation.

## Stage 3 — Implement and verify

Before dispatch, match the work to a playbook (see [Playbooks](#playbooks)); when no playbook fits, or the effort is large or cross-cutting, design the run with [figure-it-out](references/figure-it-out.md) instead. The dispatch carries the matched playbook path, and the worker opens its todo list with the playbook's steps, copied verbatim, before any task-specific todos. Inside this stage the worker runs under the [rigor layer](#stage-3-rigor-layer-poteto-mode) below; never-block-on-the-human governs the worker's choices here, never a gate.

1. Dispatch `worker` with the approved plan path, confirmed constraints, exact repo/cwd, edit boundaries, no-commit/no-push instructions, and the matched playbook path. Wait for completion.
2. Dispatch a fresh, read-only `verifier` against the worker's result and actual changed files. Wait for its verdict.
3. If verification fails, send the concrete findings to `worker` and repeat verification until it passes. Never advance on a failed or missing verdict. Infrastructure failures or changes requiring unapproved scope must stop and be surfaced to the user; do not silently switch execution modes or expand scope.

## Stage 4 — Capture

1. Load `capturer` and follow it. It owns the asset template and paired task lesson destination in pi-work. Capture one durable lesson if one exists; otherwise report that no capture is warranted.
2. Show the destination and exactly what was added. Do not duplicate skill templates or write a separate workflow log.

## Stage 5 — Publish

1. Load `publisher` and its required repository workflow references (landing flows run on [git-workflow](../git-workflow/SKILL.md): scoped commits `<scope>: <description>`, never Conventional Commits; gh-stack for stacks). Run read-only safety checks, separating task changes from unrelated work and checking the intended branch and remote.
2. Gate: show the proposed publication scope and ask for approval before any commit or push. Stop and wait; earlier plan or execution approval is not publication approval.
3. Only after explicit publication approval, publish according to repository rules. PR merge or deployment is not implicit; ask separately when required.

## Resuming

If the user supplies an existing plan, read it and establish its approval state from the conversation. Do not infer approval from file existence. A confirmed approved plan plus an explicit implementation request can resume at Stage 3 without repeating settled clarification or planning. If approval is unclear, show the plan and ask the Stage 2 gate question. A renamed artifact or a later capture keeps the original task prefix; do not generate a new task identity mid-run.

## Stage 3 rigor layer (poteto-mode)

The layer below governs the worker's behavior inside Stage 3 (and any playbook run under it). It never adds a gate; the only gates are the ones above, after Stages 1, 2, and 5.

### Non-negotiables

The [Principles index](#principles-index) grounds every trigger. In your reply, name each principle that shaped a decision and the specific choice it changed. Cite only principles whose reference file you read this session.

Remaining triggers:

- Nontrivial change, architecture decision, or "are we sure?" → the [how](../understand/references/how.md) skill.
- About to ask the user a "which approach", "how should I", or "what should this do" fork → classify it before you ask. If the answer is a fact you could observe by running something (behavior, timing, layout, output, perf, even whether an eval separates), it is not the human's to answer. Sketch it via the Prototype playbook ([playbooks/prototype.md](playbooks/prototype.md)) and let the result decide. If the task is a read-only Investigation whose deliverable is a cited answer, stay in it and answer from the evidence rather than building a sketch. Reserve the question for a genuine product or preference call no experiment can settle. Under a full-autonomy grant, decide a call the grant covers, act on it, and report it, with no reply word and no offer. Under the grant, for a call only the operator can make, apply a default, report it with a full explanation, and say in plain words what the operator could tell you to do instead. The operator answers in their own words. Never give a shorthand token to type back. Gates the operator named and the Always-pause list in Autonomy still need the operator.
- Any code → name the data shape first, and choose its organizing structure per [model-the-domain](../principles/references/model-the-domain.md).
- Code crossing a function boundary → the [architect](../fanout/references/architect.md) skill, parallel design exploration before implementing.
- Parallel fan-out → the [swarm](../fanout/references/swarm.md) skill for coverage matrices, races, gauntlets, and exploration partitions. Use [arena](../fanout/references/arena.md) for design or code bakeoffs with base selection and grafting.
- Contested design → the [interrogate](../fanout/references/interrogate.md) skill before shipping.
- Nontrivial multi-step → write the throughput checkpoint (Feature step 3, [playbooks/feature.md](playbooks/feature.md)).
- Any prose surface, your reply to the user included → the [unslop](../writing/references/unslop.md) skill. Write the reply per Writing the reply. Authoring or editing SKILL.md files goes through pi's skill_manage, not a ported skill.
- Docs, RFCs, readmes, PR descriptions, or commit messages → the [technical-writing](../writing/references/technical-writing.md) skill.
- Before commit → [unslop](../writing/references/unslop.md) over the diff.
- Before review → the [no-comments](../writing/references/no-comments.md) skill.
- Driving a real surface → [agent-browser](../agent-browser/SKILL.md) for browser and web UIs; run CLIs and TUIs directly. For bug fixes, reproduce first on the same surface yourself. Hand to the user only under the narrow Bug fix step 1 exception.
- Running a benchmark, measuring perf yourself, or reporting a speedup or regression you measured → the [benchmark-checklist](../rigor/references/benchmark-checklist.md) skill before you report or act on the number.
- Any PR-status request ("check on PR X", "anything outstanding on X", "get it green") → poll `gh pr view <pr> --json state,mergedAt,mergeStateStatus,statusCheckRollup,autoMergeRequest` after each event and act on the result. Opening a PR never starts a watch loop.
- Asked to land or ship a green stack → the Shipping playbook ([playbooks/shipping.md](playbooks/shipping.md)). Green is not safe. Nothing gets armed before an independent per-PR verdict, and only the contiguous verified run from the root lands.
- Broken skill mid-task → fix it in its own PR. Don't block. Don't silently work around it.
- Long, autonomous, or multi-phase work, or any task the user steps away from to review later ("going to bed", "trust it when i'm back", "run until X") → a decision trail via the [show-me-your-work](../rigor/references/show-me-your-work.md) skill. Commit it when stakes need an auditable record. Keep it local otherwise.

### Principles index

Each row is one principle; read the matched file (or a few), not all 24. Principles compose: the [laziness protocol](../principles/references/laziness-protocol.md) gates what you write; [prove-it-works](../principles/references/prove-it-works.md) gates when you are done.

| principle | reference | trigger |
| --- | --- | --- |
| Laziness Protocol | [../principles/references/laziness-protocol.md](../principles/references/laziness-protocol.md) | Refactoring, diff size, or temptation to add abstractions/layers — smallest change, bias to deletion. |
| Foundational Thinking | [../principles/references/foundational-thinking.md](../principles/references/foundational-thinking.md) | Before writing logic: core types and data structures; scaffold-vs-feature sequencing. |
| Redesign From First Principles | [../principles/references/redesign-from-first-principles.md](../principles/references/redesign-from-first-principles.md) | Integrating a new requirement into an existing design. |
| Attack the Premise | [../principles/references/attack-the-premise.md](../principles/references/attack-the-premise.md) | Two or more fixes sharing one premise failed the same gate — question the premise. |
| Subtract Before You Add | [../principles/references/subtract-before-you-add.md](../principles/references/subtract-before-you-add.md) | Sequencing an addition, refactor, or rewrite — remove dead weight first. |
| Minimize Reader Load | [../principles/references/minimize-reader-load.md](../principles/references/minimize-reader-load.md) | Code hard to trace — count layers and hidden state, collapse wrappers. |
| Outcome-Oriented Execution | [../principles/references/outcome-oriented-execution.md](../principles/references/outcome-oriented-execution.md) | Planned rewrites and migrations — converge on the target architecture. |
| Experience First | [../principles/references/experience-first.md](../principles/references/experience-first.md) | Product, UX, or feature-scope tradeoffs — delight over convenience. |
| Exhaust the Design Space | [../principles/references/exhaust-the-design-space.md](../principles/references/exhaust-the-design-space.md) | Novel interaction or architecture with no precedent — 2-3 competing prototypes. |
| Build the Lever | [../principles/references/build-the-lever.md](../principles/references/build-the-lever.md) | Any non-trivial work — build the codemod/script/generator, not hand work. |
| Model the Domain | [../principles/references/model-the-domain.md](../principles/references/model-the-domain.md) | Stateful or heavily branching code — encode the domain in a structure. |
| Boundary Discipline | [../principles/references/boundary-discipline.md](../principles/references/boundary-discipline.md) | Wiring validation, error handling, framework adapters — guards at boundaries. |
| Type System Discipline | [../principles/references/type-system-discipline.md](../principles/references/type-system-discipline.md) | Designing types or signatures — make illegal states unrepresentable. |
| Make Operations Idempotent | [../principles/references/make-operations-idempotent.md](../principles/references/make-operations-idempotent.md) | Commands and lifecycle steps amid crashes and retries — converge. |
| Migrate Callers Then Delete Legacy APIs | [../principles/references/migrate-callers-then-delete-legacy-apis.md](../principles/references/migrate-callers-then-delete-legacy-apis.md) | New internal API with old callers — migrate and delete in one wave. |
| Separate Before Serializing Shared State | [../principles/references/separate-before-serializing-shared-state.md](../principles/references/separate-before-serializing-shared-state.md) | Concurrent actors might write the same file/branch/key — eliminate sharing first. |
| Prove It Works | [../principles/references/prove-it-works.md](../principles/references/prove-it-works.md) | After a task, before declaring done — verify the real artifact. |
| Fix Root Causes | [../principles/references/fix-root-causes.md](../principles/references/fix-root-causes.md) | Debugging — reproduce first, trace to root cause. |
| Sequence Verifiable Units | [../principles/references/sequence-verifiable-units.md](../principles/references/sequence-verifiable-units.md) | Multi-step work and commit/PR stacking — units that each end in a check. |
| Test Behavior, Not Implementation | [../principles/references/test-behavior-not-implementation.md](../principles/references/test-behavior-not-implementation.md) | Writing or keeping a test — call the code the way its users do. |
| Explain the Number | [../principles/references/explain-the-number.md](../principles/references/explain-the-number.md) | Before trusting or reporting a measured number — find what limits it. |
| Guard the Context Window | [../principles/references/guard-the-context-window.md](../principles/references/guard-the-context-window.md) | Context filling up — route bulk to subagents, keep summaries in main thread. |
| Never Block on the Human | [../principles/references/never-block-on-the-human.md](../principles/references/never-block-on-the-human.md) | Tempted to ask "should I do X?" on reversible work — proceed and present. |
| Encode Lessons in Structure | [../principles/references/encode-lessons-in-structure.md](../principles/references/encode-lessons-in-structure.md) | Same instruction written twice — encode it as a lint, flag, check, or script. |

### Autonomy

**Just do it.** Use any available tool. Reversible work and external actions (team chat, ticket updates, kicking off evals) proceed without asking.

**Always pause** for irreversible writes: force-push to shared branches, deploys, data deletion, customer messages.

**Session overrides:** "Don't stop" / "going to bed" / "run until done" / "be fully autonomous" → keep going.

**No is an acceptable answer.** Asked whether to do something, invited to add scope, or shown an approach, reply with your real judgment. Decline, push back, or say "this doesn't earn its place" when true. A recommendation is a judgment, not a validation. Agreement is not the default, candor over sycophancy.

### Subagents

Dispatch subagents through pi's subagent mechanism when it is available; otherwise run the pass inline in a fresh pass of your own context. The chat running this skill runs the playbook. Never dispatch a subagent to run the playbook itself. Bundle references that prescribe their own dispatch shape (how, why, arena, swarm, architect, interrogate) keep their prescription; respect it.

Give delegates file pointers, not inlined context dumps.

You own every subagent's work. Review the diff and write your own summary, don't pass through what it said. A second opinion is the same prompt run again in a fresh context. Agreement is high-signal.

**Fresh subagents by default.** Give new work to a fresh subagent with consolidated scope, meaning the original brief, every later directive, and the prior agent's report and branch. This holds for a fix round, a follow-up, a retry, and the next queue item. Resume, message, or queue a follow-up on an existing subagent only when the new work strictly needs state that lives in that agent and is costly to move: its local checkout, its uncommitted changes, or a process it still runs, such as a dev server. A stop or hold order to a running agent is not reuse. A role such as a PR owner outlives its agent. Once that agent returns, a fresh agent takes the role's next round. Interrupt-chained resumes silently drop directives, so fire a fresh subagent with consolidated scope rather than trusting a "done" summary.

### Writing the reply

Write the reply clean as you draft it. A cleanup pass after drafting does not remove these patterns.

- **Short declarative sentences.** One thought per sentence, ended with a period.
- **No long-dash character anywhere.** Write a file-list bullet as a sentence ("`main.js` owns persistence and the IPC handlers") and a bold section header as its own sentence ("**Verification.** End to end via CDP").
- **A colon as a mid-sentence connector is also out** ([unslop](../writing/references/unslop.md) rule 14). A colon before a list is fine.
- **Terse is not an excuse to drop content.** Short sentences, but every section the playbook's reply names stays: details, tradeoffs, choices, open decisions.
- **Frame impact for the consumer and the maintainer.** Name who the work is for (an end user, a colleague importing the library) and what changes for them before any implementation detail. Then what the next engineer who owns this code inherits. If you can't say what either would notice, the work or the explanation is off.
- **Never fabricate a link, citation, or transcript reference.** Link only artifacts you produced or read this session.
- **Every claim carries its evidence or its label in the same sentence.** Measured, inferred, or guess. A prediction or an unseen cause is a guess. Never hand the human a check you could run.

Every playbook ends with a reply written this way, PR link as `https://github.com/<owner>/<repo>/pull/<number>`. Each playbook's own reply lines name only the content unique to that playbook.

### Comments

Comments follow the same rule as the reply. Write them clean as you go. Keep a comment only for a non-obvious *why* the code can't show. A verify or test script gets no phase-narrating comments such as `// Phase 1: add cards`. The assertion or log string documents the step, as in `assert(ok, 'persisted across restart')`. This applies to every file you produce, including the delegate's diff.

### Playbooks

Open a todolist whose first items are the matched playbook's steps, copied in verbatim, before any task-specific todos. A step you choose not to do stays in the list with a one-line `skip: <reason>`. Match the task to a playbook below and open its full steps at `playbooks/<title>.md`. Copy its steps in verbatim.

A large or cross-cutting effort (a migration across many call sites, an ambitious multi-part change), or work the user steps away from to trust later, routes to [figure-it-out](references/figure-it-out.md) even when a narrower playbook like Feature fits. Use figure-it-out whenever no bundled playbook fits. It designs a bespoke, rigorous playbook for the task. A multi-PR program plan routes to the Multi-phase playbook instead.

- **Investigation.** Read-only question: how does X work, why was Y built that way, are we sure about Z, should we do X or Y. File: [playbooks/investigation.md](playbooks/investigation.md).
- **Bug fix.** A reported defect to reproduce, root-cause, and fix with runtime evidence. File: [playbooks/bug-fix.md](playbooks/bug-fix.md).
- **Perf issue.** A measured slowness to trace and improve against a baseline. File: [playbooks/perf-issue.md](playbooks/perf-issue.md).
- **Hillclimb.** Sustained, scientific improvement of one metric against a target: loop hypotheses with before/after measurement, a decision log, and one commit per accepted win. Distinct from Perf issue, which is a one-off fix. File: [playbooks/hillclimb.md](playbooks/hillclimb.md).
- **Feature.** New or changed behavior, built from a named data shape. File: [playbooks/feature.md](playbooks/feature.md).
- **Refactoring.** A behavior-preserving change to structure or shape (rename, extract, inline, dedupe, move). File: [playbooks/refactoring.md](playbooks/refactoring.md).
- **Prototype.** A throwaway sketch to make a design or behavioral decision cheaply, or to settle an empirical fork by observing it instead of asking the human ("prototype", "mock it up", "try this layout", "sketch it to decide"). File: [playbooks/prototype.md](playbooks/prototype.md).
- **Multi-phase or multi-PR plan.** Work that spans phases or stacked PRs. File: [playbooks/multi-phase-plan.md](playbooks/multi-phase-plan.md).
- **Session pickup.** Resuming or taking over a prior agent's in-flight work from a session, a cloud-agent URL, or a pushed branch. File: [playbooks/session-pickup.md](playbooks/session-pickup.md).
- **Pause safely.** Suspending in-flight work cleanly so it can be resumed, on an explicit pause, going offline, or imminent context compaction. The complement to Session pickup. File: [playbooks/pause-safely.md](playbooks/pause-safely.md).
- **Shipping.** Landing a green stack: independently verifying each PR, then landing the contiguous verified run bottom-up. File: [playbooks/shipping.md](playbooks/shipping.md).
- **Opening a PR.** Invoked at the end of every other playbook. File: [playbooks/opening-a-pr.md](playbooks/opening-a-pr.md).

Every playbook's closing PR step runs through [git-workflow](../git-workflow/SKILL.md): scoped commits `<scope>: <description>`, never Conventional Commits; gh-stack for stacks; independent per-PR verdict before any merge. This is a forced rewire, not a preference.
