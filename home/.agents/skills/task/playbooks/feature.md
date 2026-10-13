### Feature

**You own the design. Plan, review, verify.** Delegate implementation. Stay in the lead.

1. [how](../../explainer/references/how.md) over the affected subsystem.
2. If the work adds a new module, core types, or a public interface, the approved plan carries a [design contract](../../planner/references/architect.md). Implement against it.
3. For nontrivial multi-step work, write the throughput checkpoint as todo items: what must run first, which workstreams are independent (disjoint files or layers), what shared state forces serializing, and why the decomposition you chose is the smallest safe one. Mark an item `n/a: <reason>` rather than dropping it.
4. Name the data shape before writing logic: a state machine over scattered booleans, a table over branching, one typed model over repeated shape assumptions. Hand implementation to `worker` with file paths, that shape, and success criteria. Surgical edits. Port shared-primitive changes to every consumer and verify each. Commit as you go.
5. Verify on the matching surface (agent-browser for browser and web UIs; run the CLI directly). "Inconclusive" or wrong-surface is not a pass. Flag it.
6. Rebase into small, ordered commits, each one a unit that builds and passes on its own. Stack follow-ups.
7. If the design is contested, [interrogate](../../reviewer/references/interrogate.md) before shipping.
8. At Stage 5, after the publish gate, run [opening-a-pr](../../publisher/references/opening-a-pr.md).

Code-coupled work (one feature, one migration) goes to a single owner with the checkpoint inline. That owner fans out internally after the blocking phase. Parent-level fan-out is for slices that produce independent artifacts (audits, cross-subsystem investigations, competing experiments). Rewrite the checkpoint at phase boundaries. Spawn a fresh owner rather than chaining interrupts.

**Reply:** what you built, what you chose and why, the throughput checkpoint, open decisions. Tables for design alternatives.
