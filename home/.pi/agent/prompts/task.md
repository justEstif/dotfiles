---
description: Clarify an unclear task, then plan it, pausing for approval at each gate
argument-hint: "[task]"
---

Work through an unclear task in two gated stages. At each gate, stop and wait — do not proceed on an assumed yes. Do not build anything in either stage.

## Stage 1 — Clarify

1. Load the `clarifier` skill and follow it fully: ask the questions, wait for the answers, then produce the 3-line summary.
2. Gate: the user confirms the brief. Until they do, stop.

## Stage 2 — Plan

1. On the confirmed brief, load the `planner` skill and follow it fully — the brief is the basis, settled questions stay settled.
2. Present the plan to the user.
3. Gate: stop and ask for approval. Do not implement, even after approval — the user decides the next move (usually `/ship`).

Task: $@
