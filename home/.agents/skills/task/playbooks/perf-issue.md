---
source: https://github.com/cursor/plugins/tree/main/pstack/skills/poteto-mode
license: MIT (pstack, by poteto)
---

### Perf issue

**You own the measurement story. Plan, review, verify the numbers.** Tie every fix to a measurement, don't read source instead of measuring.

1. Capture a baseline trace on the matching surface ([agent-browser](../../agent-browser/SKILL.md) for browser and web UIs; run the CLI directly). Vet the baseline, and each later number, with the [benchmark-checklist](../../rigor/references/benchmark-checklist.md) skill.
2. [how](../../understand/references/how.md) to ground hypotheses. Don't claim a perf ceiling without running it first.
   Try the performance mantras in order, cheapest first:
   1. Don't do it. Stop work whose result nothing uses rather than cheapening it.
   2. Do it, but don't do it again.
   3. Do it less.
   4. Do it later.
   5. Do it when they're not looking.
   6. Do it concurrently.
   7. Do it cheaper.

   When an earlier mantra meets the target, stop.
3. Plan the fix from the trace. If it crosses a function boundary, [architect](../../fanout/references/architect.md) first. Delegate implementation to a subagent. Review the diff. Capture a post-fix trace.
   Apply the [sequence-verifiable-units](../../principles/references/sequence-verifiable-units.md) principle, verifying each attempt before trying the next.
4. Parse and compare the artifacts (JSON to sqlite, diff). "Inconclusive" or wrong-surface is not a pass. Flag it.
5. Cite the measurement in the PR.
6. Run [Opening a PR](opening-a-pr.md).

For sustained improvement against a metric rather than a one-off fix, use the Hillclimb playbook ([hillclimb.md](hillclimb.md)).

**Reply:** baseline number, post-fix number, delta, artifact path.
