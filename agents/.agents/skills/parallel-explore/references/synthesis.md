# Synthesis Patterns

The fan-in step is where parallel exploration earns its tokens. Raw investigation output is just N independent reports — synthesis is what turns them into a decision.

Use these patterns as needed. Not all apply to every decision.

## Conflict Resolution

When two paths make contradictory claims:

1. **Factual conflicts** ("both claim best performance"): Resolve with evidence, not opinions. Ask: what benchmark, metric, or code measurement would settle this? If the agent can't measure it, flag it as an open question.
2. **Value conflicts** ("fast to ship" vs "clean architecture"): This is a real trade-off. Map it explicitly: how much speed are you trading for how much cleanliness? Make the exchange rate visible.
3. **Timeline conflicts** ("quick win now" vs "strategic play in 6 months"): Decompose — can you get the quick win *and* start the strategic play? If not, which timeline aligns with the user's actual constraints (funding runway, market window, team morale)?

## Assumption Surfacing

For each surviving path, explicitly state the assumptions it depends on:

```
Path A (microservices) assumes:
  - Team can handle operational complexity of N services
  - Service boundaries are stable enough to avoid constant redistribution
  - Network latency between services is acceptable for SLA

Path B (modular monolith) assumes:
  - Module boundaries can be enforced without process isolation
  - The team won't grow beyond what a single deployable can support
```

If an assumption is unverified and load-bearing (the path fails if it's wrong), flag it for validation before committing.

## Elimination Cascade

Sometimes synthesis is mostly elimination:

1. Apply dealbreakers → remove paths that fail hard constraints
2. Apply success criteria → remove paths that can't achieve the target outcome
3. Among survivors → compare on the dimension that matters most (user specifies this in Step 1)

If elimination leaves zero paths, the frame is wrong. Go back to Step 1 and relax constraints or add new paths.

## Reversibility Weighting

Not all decisions are equal. Jeff Bezos' one-way vs two-way door framework:

- **One-way door** (hard to reverse): Invest heavily in analysis. The 10 extra minutes of synthesis is worth it. Consider building a throwaway prototype of the top 2 paths before committing.
- **Two-way door** (easy to reverse): Pick the fastest path to validate. The cost of being wrong is low — the cost of over-analyzing is real.

Weigh reversibility explicitly. Don't spend 30 minutes synthesizing a two-way door.

## When Paths Converge

Sometimes parallel investigation reveals that seemingly different paths actually want the same thing:

- Two architecture approaches that both reduce to "start modular, extract services as needed"
- Three tech selections where the real choice is between two ecosystems, not three libraries
- Product paths that share 80% of implementation and differ only in one feature toggle

When you spot convergence, name it explicitly. Reframe the decision around the actual disagreement, not the surface-level options. This is often the highest-value output of parallel exploration.
