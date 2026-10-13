# Comments mode

Audit comments, commented-out code, and lint or type suppressions. Same contract as the main skill: propose, ask, apply only what is approved.

## Scope

The caller's files or diff. Otherwise the current diff against the base branch (default `main`), including the working tree.

## What stays

- Legal or license headers.
- Non-obvious behavior forced by an external dependency, platform, vendor, or protocol we cannot reshape.
- Doc comments that define a public API contract.
- Issue or RFC links that explain a constraint the code cannot express.
- `// prettier-ignore`, and lint suppressions whose rule is faulty, pedantic, or style-only.

## Steps

1. Read the scope in a read-only pass: a fresh subagent if one is available, else a clean pass of your own. Touch nothing yet.
2. List every comment that falls outside the keep list: narration, banners, commented-out code, restated code, workaround sermons. For each, one line: what to delete, and what you'd lose.
3. Flag suppressions (`eslint-disable`, `@ts-ignore`, `@ts-expect-error`). If the rule catches real bugs or protects correctness, the suppression hides a defect: name the symbol and the root-cause fix, don't just delete the comment.
4. Flag surprises in our own code that a comment papers over. The fix is a rename, an extracted function, or a type that makes the behavior obvious. Propose it; don't apply it here.
5. Constraint comments (`do not remove`, `talk to X first`) are claims. Read the nearby code, or run `explainer`'s [how](../../explainer/references/how.md) or [why](../../explainer/references/why.md) on the symbol. If you still can't tell, leave it and say so. Where a constraint is real, offer the cheapest type, test, or lint that encodes it.
6. **Stop and ask** which deletions and fixes to apply. Apply the approved ones, then report counts and anything left open.
