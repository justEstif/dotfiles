---
id: parallel-explore
label: Parallel Explore
description: Compare 2-5 paths or hypotheses with parallel investigations, then synthesize into a recommendation.
routingHints:
  - explore in parallel
  - use subagents
  - fan out
  - wide search
  - compare options
  - evaluate alternatives
  - multiple hypotheses
  - investigate multiple paths
  - can't decide between
routing:
  ifSinglePath: suggest grill-me
  ifWrongQuestion: suggest root-ask
  ifContestedClaim: suggest sycophancy
---

Use this mode when the user has 2-5 plausible paths, hypotheses, or options and needs help deciding. Parallel exploration reduces anchoring on whichever path would be investigated first.

Do not use this for ordinary brainstorming, single-plan critique, or vague “which direction” discussion unless there are concrete competing paths to compare.

## Process

### 1. Frame the decision first

Before investigating or spawning subagents, write a short decision frame:

- **Decision** — what exactly needs to be decided, in one sentence
- **Paths** — the 2-5 competing options/hypotheses, named clearly
- **Success criteria** — what would make a choice good; include dealbreakers
- **Lenses** — the distinct investigative lens for each path

Show the frame to the user and ask for confirmation or adjustments before fan-out.

### 2. Fan out with subagents when independent

When the paths can be investigated independently, use the available `subagent` tool in parallel mode:

- one subagent per path or lens
- include the same decision frame in every task
- make each task read-only unless the user explicitly asked for implementation
- ask each subagent for strengths, risks, evidence, dependencies, and reversibility
- fan in after all outputs return

If subagents are not appropriate, investigate paths sequentially but deliberately switch lenses. State the active lens before each investigation.

### 3. Fan in by resolving conflicts

Do not merely list pros and cons. Synthesize:

- **Conflict mapping** — where paths make competing factual claims
- **Hidden agreements** — where different paths actually converge
- **Elimination** — which paths fail a dealbreaker and should be dropped
- **Survival test** — what would have to be true for the surviving choice to be wrong

### 4. Recommend one path

End with a clear recommendation:

- **Choice** — which path and why
- **Hedge** — what to validate first, and what would trigger pivoting to the runner-up
- **Next action** — one concrete step to take this week

If the options are genuinely tied, say so and name the missing information that would break the tie. Do not manufacture false clarity.

## Default lenses

- **2 paths** — user impact first; cost/complexity first
- **3 paths** — add strategic alignment / future optionality
- **4 paths** — add devil’s advocate against the apparent favorite

Adapt lenses to the domain: architecture, tech selection, debugging theories, product paths, career decisions, or organizational strategy.

## NEVER

- **NEVER** fan out before the decision frame is confirmed. **Why:** each investigation will optimize for different criteria. **Instead:** frame first, then ask for confirmation.
- **NEVER** investigate every path through the same lens. **Why:** same-shaped analysis misses path-specific insights. **Instead:** assign distinct lenses.
- **NEVER** present equally weighted options without a recommendation. **Why:** the user asked for help deciding. **Instead:** recommend one path, or name what would break a true tie.
- **NEVER** carry paths that fail dealbreakers through synthesis. **Why:** dead options add noise. **Instead:** eliminate early and state why.
