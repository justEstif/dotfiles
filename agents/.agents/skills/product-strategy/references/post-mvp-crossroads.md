# Post-MVP Crossroads

You've shipped an MVP and now face competing paths — user feedback, bug reports, feature requests, technical debt all shouting at once. This framework sequence helps you choose among them strategically.

## Three-framework sequence

Run these in order. Each framework answers a different question:

1. **Opportunity Solution Tree** → What opportunities exist?
2. **RICE Scoring** → Which ones are worth pursuing?
3. **3 Horizons of Growth** → How do I balance allocation across them?

### 1. Opportunity Solution Tree (Teresa Torres)

Map the landscape before jumping to features.

```
Root = Desired Outcome (e.g., "increase WAU by 20%")
├── Opportunity A: "Users churn after first session because onboarding is confusing"
│   ├── Solution A1: Guided walkthrough
│   └── Solution A2: Progressive disclosure of features
├── Opportunity B: "Power users hit a wall — no batch operations"
│   ├── Solution B1: Bulk actions UI
│   └── Solution B2: API access for automation
└── Opportunity C: "Mobile users can't complete core flow"
    └── Solution C1: Responsive redesign
```

**Build this with the user.** Start from the outcome they care about most. Branch into *opportunities* (user problems, friction points, underserved segments) before branching into *solutions*. This forces comparison of opportunities before comparison of features — most people skip straight to features.

**Key moves:**
- If the user jumps to a solution, ask "what opportunity does this address?" — trace back to the branch.
- If all branches are solutions with no parent opportunity, the tree is upside down. Rebuild.
- If the tree has only one branch, the user hasn't explored enough. Ask "what else could achieve this outcome?"

### 2. RICE Scoring

Quantify tradeoffs across the opportunities surfaced in step 1. Acts as reality check.

For each opportunity (or solution, if the tree is narrow enough):

| Factor | Definition | Scale |
|--------|-----------|-------|
| **Reach** | Users affected per quarter | Number |
| **Impact** | Effect per user | 3=massive, 2=high, 1=medium, 0.5=low, 0.25=minimal |
| **Confidence** | How sure are you? | 100%=high, 80%=medium, 50%=low |
| **Effort** | Person-quarters of work | Number (lower = better) |

**Score = (Reach × Impact × Confidence) / Effort**

**Key moves:**
- High-impact + high-effort + low-confidence = scores drop. This is the feature idea everyone loves but nobody has validated. Flag it for research, not roadmap.
- Low-hanging fruit (high reach, low effort, medium confidence) often surfaces here when it was invisible in the opportunity tree. Highlight these.
- If confidence is below 50% on multiple items, you have a research problem, not a prioritization problem. Stop and propose lightweight validation experiments before scoring.
- Don't pretend precision. RICE surfaces rough ordering, not exact ranking. Items within 20% of each other are tied.

### 3. Three Horizons of Growth (McKinsey)

Balance allocation across timelines. Catches the common trap of spending 100% on future features while the MVP leaks users.

| Horizon | Focus | Allocation | Examples |
|---------|-------|-----------|---------|
| **H1** | Maintain/defend the core | ~70% | Bug fixes, performance, retention, onboarding fixes, core UX polish |
| **H2** | Nurture emerging opportunities | ~20% | Adjacent use cases, new segments, integrations, feature expansion |
| **H3** | Create viable options | ~10% | Experimental features, long-term pivots, exploratory R&D |

**Key moves:**
- Map the RICE-scored items to horizons. If everything lands in H2 or H3, the core is leaking. Rebalance toward H1.
- If the user resists H1 ("bugs aren't exciting"), frame it in terms of the outcome from the Opportunity Tree: "fixing onboarding churn directly moves your WAU target. A new integration doesn't."
- H3 items should be tiny bets with fast feedback loops, not big commitments. If an H3 item requires more than 2 weeks of effort, break it into a probe.
- The 70/20/10 split is a starting point, not a law. Adjust based on stage: very early post-MVP might be 80/15/5.

## Anti-patterns to watch for

- **Feature factory**: Jumping straight to RICE without mapping opportunities. Scores features, not problems. Results in a polished product nobody needs.
- **Bias toward building**: Every opportunity maps to a new feature. Ask "could we solve this by removing something? By fixing an existing feature?"
- **All horizons, no priorities**: Using the 70/20/10 split to justify doing everything. Each horizon still needs internal prioritization.
- **Analysis paralysis**: Spending more time on the tree than building. If the tree has more than 12 leaf nodes, you've gone too deep. Pick a branch and ship.

## Output

End with a concrete allocation:

```
H1 (core): [top items, estimated effort]
H2 (emerging): [top items, estimated effort]
H3 (options): [top items, estimated effort]

Next action: [single most impactful thing to do this week]
```

**Write this allocation as a standing document, not a meeting outcome.** The doc is the commitment — revisit it at each milestone to check drift. If what you're actually working on doesn't match the allocation, the document makes the gap visible. If priorities changed, update the doc and state why — don't silently abandon the plan.
