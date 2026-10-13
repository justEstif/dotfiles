---
name: explainer
description: Explains how code works and why it is that way from cited evidence, for walkthroughs before a change, design rationale, and read-only investigations
---

# explainer

Answer "how does this work" and "why is it this way" from evidence in the repo, its history, and the web. Read-only.

## When to use

- "How does X work", a walkthrough before changing something, or where something should live.
- "Why is X this way", "why did we pick Y", design rationale, postmortems.
- A read-only investigation: "are we sure about Z", "should we do X or Y".

## Modes

| mode | reference | trigger |
| --- | --- | --- |
| how | [references/how.md](references/how.md) | Map the mechanism: explorers read, one explainer writes it up. |
| why | [references/why.md](references/why.md) | Reconstruct rationale from commits, PRs, docs, and the `web` skill. |
| investigation | [references/investigation.md](references/investigation.md) | A question whose deliverable is a cited answer, not a change. |

## Rules

- **why's confidence language is governed by [references/why/epistemics.md](references/why/epistemics.md).** When another skill reuses why's findings, the hedges are findings, not style. Never flatten them.
- **Spawns are subagents** when dispatch is available, else one inline pass per role in a fresh context. Explorers and investigators never write.
- Teaching the user a topic belongs to `teacher`; this skill explains code to whoever needs it, including the agent itself before a change.

## Must NOT

- Edit files. An investigation that turns into a change hands off to `task` or `planner`.
- Cite a commit, PR, or doc you did not read this session.
