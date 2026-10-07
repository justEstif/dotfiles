---
description: Implement the approved plan, verify, capture the lesson, then publish
argument-hint: "[plan path or notes]"
---

Ship an approved plan end to end. Requires a plan the user has already approved (e.g. from `/task`).

1. Dispatch the `worker` subagent with the approved plan. Wait for it to finish.
2. Dispatch the `verifier` subagent on the worker's result. If verification fails, send the findings back to the `worker` subagent and repeat until it passes — never advance on a failed verification.
3. Load the `lesson-capturer` skill and follow it: capture the one durable lesson from this task into `LEARNED.md`.
4. Load the `publisher` skill and run its safety checks, but stop and ask the user for approval before any commit or push.
5. Only after the user approves, publish.

Plan: $@
