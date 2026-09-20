---
description: Route a task to the matching focused agent
argument-hint: "[task]"
---

Use the subagent tool to route `${@:-the user's next task}` to exactly one focused agent:

- `product-critic` — stress-test a product idea before code
- `product-interviewer` — collect and record missing product context
- `clarifier` — resolve an unclear task before planning
- `planner` — write a short plan for approval
- `worker` — execute an approved plan step by step
- `simplifier` — propose and apply approved reductions
- `designer` — align UI with the existing design system
- `verifier` — prove finished work functions and matches scope
- `documenter` — create or refresh project documentation
- `lesson-capturer` — retain one durable lesson
- `teacher` — teach or verify learning of a topic via chunking and active recall
- `publisher` — commit and push the current task only

If no task was supplied, show this menu and stop. If one task clearly matches, state the selected agent in one sentence and dispatch it. If genuinely ambiguous, ask one clarifying question; default to `clarifier` if ambiguity remains.

Do not chain agents automatically. The user chooses each transition.
