# Worktrees

- Use `wtm` for repository work that requires code changes.
- Run `wtm create "<name>" --from <base> --no-shell` from the managed bare repository root. Always quote the worktree name to avoid creating nested directories.
- Do not use raw `git worktree` commands unless `wtm` is unavailable.
- Read-only inspection may happen in the current checkout; create a worktree before editing files.

# Pull requests

Keep every pull request small, focused, and independently reviewable. Treat these as required defaults:

- One PR has one logical purpose: one bug fix, feature slice, refactor, or configuration change. Do not combine unrelated features, broad formatting, drive-by cleanup, dependency upgrades, or generated files with the main change.
- Aim for no more than roughly 300–500 changed, hand-written lines. This is a reviewability guideline, not a loophole: split larger work into smaller PRs. If a larger diff is unavoidable (for example, a migration or generated output), explain why in the PR and separate preparatory changes where possible.
- Make each PR buildable, testable, and safe to merge on its own. Add or update tests with behavior changes, document migrations or rollout/rollback risks, and keep CI green before requesting review.
- Prefer vertical, user-meaningful slices over horizontal layers. If a feature cannot fit in one independently useful PR, use a stack: put foundations first, then dependent feature slices, and keep each layer narrow and coherent.
- Keep the diff easy to review: avoid unrelated renames or formatting churn, use clear commits, and include a concise title plus a body covering the problem, approach, tests, risks, and screenshots or examples when relevant.
- Keep review scope explicit. Call out known limitations, follow-up work, security/data concerns, and any parts that need extra attention. Respond to feedback with updated tests or rationale rather than silently broadening the PR.

Use the GitHub CLI stacked-PR workflow for dependent changes. Split larger changes into separate logical branches, then initialize or adopt the branches from bottom to top with `gh stack init`, add layers with `gh stack add`, inspect with `gh stack view`, and use `gh stack submit` to push branches and create/update their PRs. Keep the stack synchronized with `gh stack sync` or `gh stack rebase`; resolve conflicts before requesting review. Merge stacks from the bottom up, and do not make an upper PR depend on unrelated changes hidden in a lower PR.
