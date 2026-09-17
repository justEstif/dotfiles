---
description: Implement, review, repair, and independently verify a bounded task
argument-hint: "<task>"
---
Use the subagent tool with the chain parameter for this workflow:

1. `worker`: implement and test `$@`.
2. `reviewer`: review the change from `{previous}` for patch-introduced defects.
3. `worker`: apply valid findings from `{previous}` and rerun relevant checks. If there are no findings, leave the code unchanged.
4. `verifier`: independently prove the final change from `{previous}` works and matches `$@`.

Pass each result with `{previous}`. Return the verifier's evidence and verdict. If the verdict is **Not ready**, report the blocker instead of claiming completion.
