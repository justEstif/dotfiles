# Pattern Selection

## Decision Tree

```
One correct output?
├── YES → Specific format/system state?
│          ├── YES → Tool (~300 lines, low freedom)
│          └── NO  → Process (~200 lines, medium freedom)
└── NO  → Value in distinctive choices?
           ├── YES → Deep internalization needed?
           │          ├── YES → Philosophy (~150 lines, high freedom)
           │          └── NO  → Mindset (~50 lines, high freedom)
           └── NO  → Route to sub-scenarios?
                      ├── YES → Navigation (~30 lines, medium freedom)
                      └── NO  → Mindset
```

## Signatures

**Mindset**: Strong NEVER list (5+ with WHY), thinking frameworks ("Before X, ask..."), no step-by-step.

**Navigation**: SKILL.md = routing only. Each route → separate reference file.

**Philosophy**: Two phases: absorb principles → express with them. Anti-patterns are aesthetic.

**Process**: Numbered phases, clear exit conditions, checkpoints, error recovery.

**Tool**: Decision trees for format choices, exact commands, MANDATORY READ triggers, fallback paths.

## Common Mismatches

- Tool for judgment workflow → over-constrains
- Mindset for format-specific task → agent guesses when it needs exact steps
- Process for multiple sub-domains → loads everything; use Navigation
- Philosophy for technical task → unpredictability where precision is needed
