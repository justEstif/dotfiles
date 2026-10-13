### Bug fix

**You own this task. Plan, review, verify.** Delegate investigation and the fix to subagents, stay in the lead.

Be scientific. Every shipped line traces to runtime evidence. Belt-and-suspenders that "might help" is a hypothesis, not a fix. It does not ship. When evidence refutes a hypothesis, revert what it motivated. The smallest change the evidence justifies ships, nothing more.

1. Reproduce it yourself on the matching surface (agent-browser for browser and web UIs; run the CLI or TUI directly), even when a debug or instrumentation protocol says to ask the user to reproduce. Ask the user only with a stated, specific reason the surface cannot be reached, and only after driving it as far as it goes. If it won't reproduce directly, synthesize the trigger, tighten conditions, or instrument until it fires.
2. Binary-search the cause. Form the candidate hypotheses, then rule them out until one survives. Seed them with [how](../../explainer/references/how.md) over the affected subsystem and [why](../../explainer/references/why.md) for regression history. Each pass, take the split that cuts the most remaining problem space, get runtime evidence, eliminate. When program state is unclear, add instrumentation or logging and read it as the code runs. Don't guess. Drive a long or stubborn hunt by iterating in fresh passes rather than thrashing one context. Confirm the surviving *mechanism* with runtime evidence before the step-3 architect/interrogate fan-out.
3. Plan the fix. If it crosses a function boundary, [architect](../../planner/references/architect.md) first. Delegate implementation to a subagent with a specific scope.
4. Verify on the same surface. The original repro now passes. "Inconclusive" or wrong-surface is not a pass. Flag it. Unit tests show branch behavior, not bug absence.
5. Stage the commits so the failing repro lands before the fix in git history, in scoped format (`<scope>: <description>`, per [git-workflow](../../git-workflow/SKILL.md)). See [tdd](../../tester/references/tdd.md) for the failing-test-first cadence when the bug has a cheap local test path. Skip it when the test would be expensive, integration-heavy, or unclear.
   This is the canonical [sequence-verifiable-units](../../planner/references/sequence-verifiable-units.md) principle, the failing test first and the fix on top.
6. At Stage 5, after the publish gate, run [opening-a-pr](../../publisher/references/opening-a-pr.md).

**Reply:** what was broken, root cause, fix, how you verified. Paste failing-then-passing repro output verbatim.
