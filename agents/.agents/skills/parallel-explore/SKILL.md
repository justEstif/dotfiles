---
name: parallel-explore
description: Fan out with subagents or deliberately separate investigation tracks to explore competing paths, hypotheses, or search spaces, then synthesize findings into a recommendation. Use when wide search beats sequential discussion — architecture options, tech selection, debugging theories, product paths, strategy directions, or any decision with 2-5 plausible hypotheses. Different from thought-partner, which routes to one thinking framework for dialogue; this runs parallel investigations with distinct lenses. Triggers on "explore in parallel", "use subagents", "fan out", "wide search", "multiple hypotheses", "investigate multiple paths", "compare options", "evaluate alternatives", "parallel exploration", "which direction", "compare approaches", "can't decide between".
---

# Parallel Explore

When facing N competing paths or hypotheses, fan out across subagents or deliberately separate investigation tracks, then synthesize into a decision. AI agents are uniquely good at this — parallel investigation reduces anchoring on whichever path you would have explored first.

## Process

### 1. Frame the decision

Before spawning any investigation, write a clear statement of:

- **The decision**: What exactly needs to be decided? One sentence.
- **The paths**: List the 2-5 competing options. Name each one.
- **The success criteria**: What would make you confident in a choice? What are the dealbreakers?
- **The lenses**: Assign a distinct investigative lens to each path (see Lens Selection below).

Show this to the user. Get confirmation or adjustments before proceeding.

### 2. Fan out — parallel investigation

**If sub-agents available** (Agent tool with `subagent_type=Explore`): spawn one agent per path. Each agent investigates its assigned path through its assigned lens. Include the full decision frame (from Step 1) in each prompt so agents work from the same context.

**If sub-agents unavailable**: investigate each path sequentially, but switch lens deliberately between them. State which lens you're using at the start of each investigation to maintain deliberate perspective-taking.

Each investigation produces:

1. **Strengths** — what this path has going for it, through the lens
2. **Risks** — what could go wrong, what this path gives up
3. **Evidence** — concrete signals from the codebase/docs/context that support or contradict this path
4. **Dependencies** — what this path requires (time, people, tech, organizational buy-in)
5. **Reversibility** — how hard to undo if wrong (one-way vs two-way door)

### 3. Fan in — synthesize

**MANDATORY — READ `references/synthesis.md`** for conflict resolution, assumption surfacing, elimination cascade, and convergence detection patterns.

Compare all paths against each other along the success criteria from Step 1. Do NOT just list pros/cons — that's what the agent would do without this skill. Instead:

**Conflict mapping**: Where do paths disagree? If Path A and Path B both claim "best for performance," that's a factual claim to resolve, not an opinion to weigh.

**Hidden agreements**: Where do seemingly different paths actually converge? This often reveals the real decision is narrower than it appeared.

**Elimination**: Which paths fail a dealbreaker? Remove them early rather than carrying dead weight through synthesis.

**Survival test**: For each surviving path, what would have to be true for this to be the wrong choice? This surfaces assumptions that deserve verification.

### 4. Recommend

Give a single clear recommendation with:

- **The choice** — which path and why
- **The hedge** — what to validate first, what triggers a pivot to the runner-up
- **The next action** — one concrete step to take this week

If you genuinely can't recommend one (tied on all criteria), say so and propose what additional information would break the tie. Do not manufacture false clarity.

## Lens Selection

Each path gets a different lens. The point is to avoid investigating every path the same way — that produces same-shaped output and misses path-specific insights.

**Default lens assignments** (adapt based on context):

| Path count | Lens assignment |
|-----------|----------------|
| 2 paths | Lens 1: "User impact first" · Lens 2: "Cost/complexity first" |
| 3 paths | Add Lens 3: "Strategic alignment — which path opens the most future doors?" |
| 4 paths | Add Lens 4: "Devil's advocate — what's the strongest case AGAINST the popular favorite?" |
| 5+ paths | Add custom lenses based on the domain. Ask: "what dimension is this decision most sensitive to?" |

**Domain-specific lenses:**

- **Architecture choices**: scalability lens, developer-experience lens, operational-complexity lens
- **Tech selection**: ecosystem-maturity lens, migration-cost lens, team-expertise lens
- **Product paths**: user-pain-severity lens, revenue-proximity lens, differentiation lens
- **Debugging theories**: reproduction-confidence lens, blast-radius lens, fix-complexity lens
- **Career decisions**: growth-trajectory lens, lifestyle-fit lens, optionality lens

If the user proposes their own lenses, use those instead.

## Composing with thought-partner

This skill is standalone, but it composes naturally with thought-partner modes:

- Each parallel agent could use **sycophancy** to adversarially stress-test its assigned path
- The overall decision might benefit from **systems-thinking** to map second-order effects of each path
- If the decision reduces to "build or not" for a single surviving path, hand off to **build-or-not**

Composition happens by reference — this skill doesn't load thought-partner references. If the agent naturally reaches for a thought-partner mode mid-investigation, that's fine.

## NEVER

- **NEVER** investigate all paths through the same lens. **Why:** produces same-shaped analysis, misses path-specific insights, wastes the parallel advantage. **Instead:** deliberately assign different lenses and state which lens is active.
- **NEVER** present a menu of equally-weighted options without a recommendation. **Why:** the user asked for help deciding, not a formatted list of their own options. **Instead:** always give a single recommendation with reasoning. If genuinely tied, say so and propose what breaks the tie.
- **NEVER** skip the framing step (Step 1) and jump straight to investigation. **Why:** without shared success criteria, each agent optimizes for different things and synthesis becomes comparing apples to oranges. **Instead:** always write the decision frame first and get user confirmation.
- **NEVER** carry paths that fail a dealbreaker through to synthesis. **Why:** dead paths add noise and make the comparison harder to follow. **Instead:** eliminate early, state why, and focus synthesis on surviving paths.
