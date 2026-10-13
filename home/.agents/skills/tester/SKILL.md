---
name: tester
description: Proves work runs — test-first fixes, behavior tests, benchmark discipline, and generated verify skills that drive the real app
---

# tester

Show that the work does what it claims, on the real artifact, with evidence. A self-report is not proof.

## When to use

- A TDD, failing-test, or regression-test request, or a bug with a cheap local test target.
- Writing, changing, or deciding whether to keep a test.
- You produced, or are about to report, a performance number.
- The project has no scripted way to drive and prove the real app, or its verify skill drifted.
- Before declaring any task done.

## Modes

| mode | reference | trigger |
| --- | --- | --- |
| prove it | [references/prove-it-works.md](references/prove-it-works.md) | Before "done": verify the real artifact, not a proxy. |
| tdd | [references/tdd.md](references/tdd.md) | Failing test first, then the fix. |
| behavior tests | [references/test-behavior-not-implementation.md](references/test-behavior-not-implementation.md) | Call the code as its users do; delete tests that assert internals. |
| benchmark | [references/benchmark-checklist.md](references/benchmark-checklist.md) | Full procedure before trusting or reporting a measured number. |
| explain the number | [references/explain-the-number.md](references/explain-the-number.md) | Find what limits a number; rule out that it measured something else. |
| create verify skill | [references/create-verification-skill.md](references/create-verification-skill.md) | Generate a project skill that drives and proves the app. |
| maintain verify skill | [references/maintain-verification-skill.md](references/maintain-verification-skill.md) | Audit a generated verify skill whose feature map drifted. |

## Rules

- **Verify skills are repo-scoped.** Generate them at `.pi/skills/verify-<app>/` in the project, never in `~/.agents/skills/`. Browser recipes go through `agent-browser`. Worked example: [references/create-verification-skill/feature-map-example/](references/create-verification-skill/feature-map-example/).
- **The `verifier` agent applies prove-it.** This skill holds the procedures it runs.

## Must NOT

- Report a number before running the benchmark procedure.
- Call work done on a test that never failed first, when the change was a fix.
