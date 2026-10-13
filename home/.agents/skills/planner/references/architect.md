# Design contract

Sketch types, function signatures, and module boundaries with `not implemented` bodies and pseudocode before writing logic. The sketch is the contract the one-page plan points at. It goes to the user with the plan, through planner's approval gate.

## 1. Ground

Run `explainer`'s [how](../../explainer/references/how.md) over every subsystem the new code touches. Naming a file isn't grounding. If the design changes ownership or layering, also run [why](../../explainer/references/why.md) on the existing shape so its rationale becomes a constraint. Skip only for greenfield work with nothing to integrate.

## 2. Sketch

Write the caller's usage first, then derive the types from it. One file of types and signatures for a small change; a module map plus types for larger work.

Prefer the design that hides more behind a smaller public surface. Assume the next contributor is an agent that sees only the files it opened and copies the nearest example: a change that looks right from one file should be right for the whole repo.

When two structurally different shapes both look viable and the choice is expensive to reverse, sketch both and compare them, or settle it with a [prototype](../../task/playbooks/prototype.md). Use an [arena](../../task/references/dispatch/arena.md) only when the user asks for one or the fork is contested after a prototype.

## 3. Agree

Show the sketch with the plan and stop for approval. For adversarial pressure first, run `reviewer`'s [interrogate](../../reviewer/references/interrogate.md) on it.

## 4. Implement against it

Replace `not implemented` bodies with code. Deviations from the sketch are signal: if a function needs a parameter the sketch didn't anticipate, decide whether the sketch was wrong, the requirement was missed, or the implementation is overreaching, and say which.

## 5. Scrap when it's wrong

If implementation keeps producing friction the sketch can't absorb, throw it out instead of bolting on fixes. The signal is a pattern, not one instance:

- The same workaround shape across unrelated code.
- Several unrelated edge cases that each need a special-case branch.
- Types that need escape hatches (`any`, casts, optional fields that are always set) to compile.
- Callers that must know the abstraction's internals to use it.

When you scrap, re-ground, redesign as if the new constraints were day-one assumptions, make the new sketch smaller than the old one, and take it back through step 3.
