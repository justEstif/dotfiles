# Arena

Open a todolist with one entry per phase (Frame, Fan out, Cross-judge, Pick, Graft, Verify) before launching anything.

## Phase A: Frame

Every candidate works the same task; each gets a deliberately varied brief. The brief is the contract.

1. State the artifact each candidate is producing.
2. Derive the rubric, 3-6 concrete gradeable criteria for what success looks like on *this* task. It is the picker's tool in Phase D. Candidates only see the task.
3. Pick the runners. All runners use the same model; the variation lives in the briefs. Give each runner a deliberately varied brief, with a distinct approach, constraint emphasis, or design direction, so the candidates explore the space instead of converging on the first safe shape. Spawn more runners when the arena covers multiple design directions; two is the floor for judgment-sensitive artifacts.
4. Give each candidate its own output location (a git worktree where possible, otherwise `/tmp/arena-<slug>/candidate-<n>/`), per separate-before-serializing-shared-state.

## Phase B: Fan out

Spawn all N candidates as subagents in a single message when subagent dispatch is available; otherwise run one fresh inline pass per candidate, sequentially, so each starts from a clean context. Each gets the task, its varied brief, the path to the shared grounding, its own output path, and instructions to produce the artifact and a short rationale naming the alternatives it considered and what it rejected.

If a candidate produces no output, proceed with N-1 and note the dropout.

## Phase C: Cross-judge

After all Phase B candidates complete, spawn one read-only judge as an independent fresh-context pass, a subagent when available, else a fresh inline pass. It sees the rubric and the candidates by path label, scores each criterion, and recommends a base with rationale. Its value is independence: a context that never watched the candidates being written and holds no stake in any of them. It runs in parallel with your reading in Phase D. Don't spawn it while candidates are still writing.

## Phase D: Pick a base

Read every candidate end to end before picking. Score each against the rubric criterion by criterion, not on holistic feel, and compare with the judge. Agreement on the base confirms the pick. Disagreement means one of you is biased or the rubric was ambiguous. Read both rationales before deciding.

Pick the base a future maintainer can extend most easily without breaking invariants. When two feel tied, prefer the cleaner boundary or smaller API, per laziness-protocol.

## Phase E: Graft

Walk each losing candidate once more for what is worth porting into the base, usually one or two things per candidate, not most of it. Fold each graft in by hand, per redesign-from-first-principles, so the result stays coherent under one mental model. Don't paste mechanically.

If the candidates converge on one shape, that is strong agreement. Note it and ship the consensus shape. No graft is needed. If they wildly diverge, Phase A was under-specified. Reframe and re-run rather than averaging the divergence.

## Phase F: Verify

Verify the synthesized artifact like any other output, per [prove-it-works](../../../tester/SKILL.md). If verification finds a problem the arena missed, either Phase A was wrong (re-frame and re-run) or a candidate caught it and you missed the graft (go back to Phase E). Don't paper over it.

## Outputs

One synthesized artifact, with a short synthesis note alongside naming the base and why, the judge's verdict, each graft with its source candidate, what was rejected and why, any convergence or dropouts, and the verification result.
