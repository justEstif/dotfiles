---
description: Clarify, plan, implement, verify, capture, and publish with explicit approval gates
argument-hint: "[task or approved plan path]"
---

Run one task through the stages below. This prompt orchestrates skills; skills own their instructions, templates, and artifact-writing behavior. Stop and wait at every approval gate. Approval applies only to the gate currently presented, never to future gates.

## Stage 1 — Clarify

1. Load `clarifier` and follow it fully: inspect relevant context, ask only unsettled questions, wait for answers, and produce its 3-line brief.
2. Gate: ask the user to confirm the brief. Until they do, stop. Do not build anything.

## Stage 2 — Plan

1. Load `planner` and follow it using the confirmed brief. Do not reopen settled questions. The skill owns its asset template and saves the plan under `$HOME/.pi/agent/pi-work/` using the shared naming contract.
2. Show the exact plan path and contents.
3. Gate: ask “Approve this plan and start implementation?” Stop and wait. An explicit approval to that question authorizes Stage 3, not publication. If the user asks for planning only, stop after plan approval until they explicitly request implementation.

## Stage 3 — Implement and verify

1. Dispatch `worker` with the approved plan path, confirmed constraints, exact repo/cwd, edit boundaries, and no-commit/no-push instructions. Wait for completion.
2. Dispatch a fresh, read-only `verifier` against the worker's result and actual changed files. Wait for its verdict.
3. If verification fails, send the concrete findings to `worker` and repeat verification until it passes. Never advance on a failed or missing verdict. Infrastructure failures or changes requiring unapproved scope must stop and be surfaced to the user; do not silently switch execution modes or expand scope.

## Stage 4 — Capture

1. Load `capturer` and follow it. It owns the asset template and paired task lesson destination in pi-work. Capture one durable lesson if one exists; otherwise report that no capture is warranted.
2. Show the destination and exactly what was added. Do not duplicate skill templates or write a separate workflow log.

## Stage 5 — Publish

1. Load `publisher` and its required repository workflow references. Run read-only safety checks, separating task changes from unrelated work and checking the intended branch and remote.
2. Gate: show the proposed publication scope and ask for approval before any commit or push. Stop and wait; earlier plan or execution approval is not publication approval.
3. Only after explicit publication approval, publish according to repository rules. PR merge or deployment is not implicit; ask separately when required.

## Resuming

If the user supplies an existing plan, read it and establish its approval state from the conversation. Do not infer approval from file existence. A confirmed approved plan plus an explicit implementation request can resume at Stage 3 without repeating settled clarification or planning. If approval is unclear, show the plan and ask the Stage 2 gate question. A renamed artifact or a later capture keeps the original task prefix; do not generate a new task identity mid-run.

Task or plan: $@
