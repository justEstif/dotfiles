### Shipping

Land a green stack only when the user explicitly asks to land it. You own what lands.

1. **Verify each PR independently.** One verifier per PR that did not write the code, exercising the real surface (`agent-browser` for web UIs, the CLI directly otherwise) against parent vs head. Each returns `PASS`, `PASS+NOTES`, or `FAIL`. CI green and bot approvals are not verdicts. Report verdicts in chat; post them on the PR only if the user asks.
2. **Find the ceiling.** Walk up from the lowest unmerged PR and stop at the first one without a passing verdict. Only the contiguous verified run from the root is landable.
3. **Ask before each merge.** Show the PR, its verdict, and its checks at the current head, and merge only on the user's yes, with `gh pr merge <pr> --squash`. Arm auto-merge only if the user asked for merge-when-ready.
4. **Re-verify after anything moves the patch.** If a rebase or retarget changed the PR's diff since its verdict, the verdict is stale: verify again. Never force-push to refresh a branch; if a pushed branch needs rebasing onto its parent, stop and ask how the user wants it done.
5. **Recompute after every merge.** Fetch `main`, confirm the merge landed, check that the next PR now targets the right base, and repeat from step 3.

**Reply:** each PR's verdict and who produced it, what landed, the ceiling, and what verifying the next PR would take.
