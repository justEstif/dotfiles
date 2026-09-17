---
description: Scout, plan, implement, and independently verify a bounded task
argument-hint: "<task>"
---
Use the subagent tool with the chain parameter for this workflow:

1. `scout`: find the code, conventions, tests, and constraints relevant to `$@`.
2. `planner`: produce a bounded implementation plan for `$@` using `{previous}`.
3. `worker`: implement and test the plan from `{previous}`.
4. `verifier`: independently prove the implementation from `{previous}` works and matches `$@`.

Pass each result with `{previous}`. Return the verifier's evidence and verdict. If the verdict is **Not ready**, report the blocker instead of claiming completion.
