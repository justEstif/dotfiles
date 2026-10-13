---
name: tester
description: Proves work runs on the real artifact, with behavior tests, benchmark discipline, and generated verify skills that drive the real app
---

# tester

Show that the work does what it claims, on the real artifact, with evidence. A self-report, a compiling build, or a green proxy is not proof.

## When to use

- Writing, changing, or deciding whether to keep a test.
- You produced, or are about to report, a performance number.
- The project has no scripted way to drive and prove the real app, or its verify skill drifted.
- Before declaring any task done.

## Rules

- **Prove it on the real thing.** Run the command, load the page, drive the CLI. Paste the actual output. Commit the proof artifact only when the work is large enough that a reviewer needs it, alongside `task`'s [decision log](../task/references/decision-log.md).
- **A fix starts with a failing test** when a cheap local test target exists. The test fails before the fix and passes after.
- **Verify skills are repo-scoped.** Generate them at `.pi/skills/verify-<app>/` in the project, never in `~/.agents/skills/`. Browser recipes go through `agent-browser`.
- **The `verifier` agent applies these rules.** This skill holds the procedures it runs.

## Modes

| mode | reference | trigger |
| --- | --- | --- |
| behavior tests | [references/test-behavior-not-implementation.md](references/test-behavior-not-implementation.md) | Call the code as its users do; delete tests that assert internals or use weak matchers. |
| benchmark | [references/benchmark-checklist.md](references/benchmark-checklist.md) | Before trusting or reporting a measured number: find what limits it, rule out that it measured something else. |
| create verify skill | [references/create-verification-skill.md](references/create-verification-skill.md) | Generate a project skill that drives and proves the app. Example: [feature-map-example/](references/create-verification-skill/feature-map-example/). |
| maintain verify skill | [references/maintain-verification-skill.md](references/maintain-verification-skill.md) | Audit a generated verify skill whose feature map drifted. |

## Must NOT

- Report a number before running the benchmark procedure.
- Call a fix done on a test that never failed first.
