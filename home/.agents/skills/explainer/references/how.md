---
source: https://github.com/cursor/plugins/tree/main/pstack/skills/how
license: MIT (pstack, by poteto)
---

# How

Explore the codebase to answer "how does X work?" questions. Produce architectural explanations at the level of a senior engineer onboarding onto a subsystem, enough to build a working mental model, not so much that it reads like annotated source code.

Explorers and explainers are read-only pi subagents when subagent dispatch is available, otherwise one inline pass per role in a fresh context. Nobody writes.

## 1. Assess complexity

If the scope is ambiguous, state your interpretation and explore. The user can redirect.

- **Simple** (a single module, a small utility, a narrow question such as "how does function X work"): no explorers. Spawn one explainer that explores and explains in one pass, built from [how/explainer-prompt.md](how/explainer-prompt.md) without the explorer-findings section. Go to step 4.
- **Complex** (a subsystem spanning multiple files or services, a cross-cutting feature, a full architectural overview): go to step 2.

When in doubt, take the simple path.

## 2. Explore (complex only)

Decompose the question into 2 to 4 angles, each a distinct slice of the subsystem. Dispatch all explorers in parallel in a single message, each a read-only subagent with its assigned angle. If parallel subagents are unavailable, take the angles one at a time in a single inline pass.

Each explorer goes deep on its angle only, doesn't try to cover everything, and returns the same sections: **Components Found** (key types, services, classes; name, file path, one-sentence description), **Flow** (execution flow step by step, with the data that flows between steps), **Files Read** (every file opened, so the explainer can reference them), **Boundaries** (where this subsystem connects to the rest of the codebase; inputs and outputs), **Non-Obvious Things** (surprising, historically motivated, easy to get wrong), and **Open Questions** (gaps, stated honestly).

## 3. Synthesize (complex only)

Once all explorers have returned, spawn one explainer with [how/explainer-prompt.md](how/explainer-prompt.md) and every explorer's findings filled in.

## 4. Present

Present the explainer's output. Light edits for clarity or context from the conversation are fine. Do not substantially rewrite it.

## Output format

The explanation uses the sections defined in [how/explainer-prompt.md](how/explainer-prompt.md), dropping any that do not apply: Overview, Key Concepts, How It Works, Where Things Live, Gotchas.
