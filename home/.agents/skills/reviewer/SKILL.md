---
name: reviewer
description: Adversarially reviews a change before shipping and maps its blast radius — what it could break, where, and why
---

# reviewer

Find what is wrong with a change before it ships. Report a verdict; the user decides what to act on.

## When to use

- "Interrogate this", "challenge this", "stress test this code", "find blind spots", "tear this apart".
- A contested design is about to ship.
- "Blast radius of X", "what could this break", or a small diff you don't trust.

## Modes

| mode | reference | trigger |
| --- | --- | --- |
| interrogate | [references/interrogate.md](references/interrogate.md) | Adversarial multi-lens review with independent reviewers and a synthesized verdict. |
| blast radius | [references/blast-radius.md](references/blast-radius.md) | Trace callers, consumers, and runtime paths a change reaches; rank what could break. |

Sidecars under `references/interrogate/` (reviewer prompt, rubric, code-quality review, lead judgment) belong to interrogate.

## Rules

- **One model, varied briefs.** Reviewers differ by brief and fresh context, never by model seat. Dispatch rules live in `task`'s [swarm](../task/references/dispatch/swarm.md).
- **Wide blast radius escalates to interrogate**, not to a rewrite.
- **Under `task`, state the assumption and continue** instead of stopping to ask. Outside `task`, ask before acting on a finding.
- Simplicity findings go to `simplifier`; UI-system findings go to `designer`.

## Must NOT

- Apply changes. The deliverable is a verdict, not a diff.
