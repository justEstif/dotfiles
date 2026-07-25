---
name: fallow
description: "Analyze TypeScript/JavaScript codebases with the fallow CLI for dead code, complexity, hotspots, and ranked refactoring targets. Use when the user wants to find unused files/exports/dependencies, measure code health, identify high-risk files (complex + frequently changed), get prioritized refactoring targets, or set up CI quality gates. Triggers on: fallow, dead code, unused exports, complexity hotspot, codebase health, refactoring targets, CRAP score, cyclomatic complexity, TS/JS codebase cleanup."
compatibility: "Requires `fallow` CLI. Install: `npm install -g fallow`"
---

# Fallow

Codebase intelligence for TypeScript and JavaScript. Two layers:
- **Static** (free): what is connected to what — dead code, complexity, hotspots
- **Runtime** (paid): what actually ran in production

## Decision tree

```
What does the user want?
├── Find unused code          → fallow dead-code
├── Measure health/complexity → fallow health
├── Get ranked refactor list  → fallow health --targets --format json
├── Find highest-risk files   → fallow health --hotspots
├── Understand why X flagged  → fallow dead-code --trace <file:export>
└── CI quality gate           → fallow dead-code --fail-on-regression
```

## Key commands

### Dead code
```bash
fallow dead-code                          # Unused files, exports, deps, circular refs
fallow dead-code --format json            # Structured output for agent consumption
fallow dead-code --changed-since main     # Scope to PR diff only
fallow dead-code --trace src/utils.ts:formatDate  # Why is this flagged as unused?
fallow dead-code --trace-file src/utils.ts        # All edges for a file
```

### Health + complexity
```bash
fallow health                             # Full report: score, complexity, hotspots, targets
fallow health --targets --format json     # Ranked refactoring targets with agent evidence
fallow health --hotspots                  # Files that are both complex AND frequently changed
fallow health --complexity                # Functions exceeding cyclomatic/cognitive thresholds
fallow health --score                     # Single 0–100 grade (A/B/C/D/F)
fallow health --changed-since main        # Scope to PR diff
```

### CI regression gates
```bash
# On main branch — save baseline
fallow dead-code --save-regression-baseline

# On each PR — fail if issues grew
fallow dead-code --fail-on-regression
fallow dead-code --fail-on-regression --tolerance 2%   # Allow small fluctuation
```

## Non-obvious behaviors

**`--targets` is designed for agents.** `fallow health --targets --format json` returns ranked refactoring candidates with priority scores, effort estimates (low/medium/high), contributing factors, and structured evidence. Use this as your starting point before deciding what to refactor — don't just eyeball complexity scores.

**Hotspot ≠ most complex.** A file with complexity 80 that nobody touches is low priority. A file with complexity 30 changed every sprint is where bugs live. The hotspot score is `normalized_churn × normalized_complexity` — the agent won't derive this weighting alone. Always run `--hotspots` before picking refactoring targets.

**Trace before deleting.** Before removing something fallow flags as unused, run `--trace <file:export>`. Fallow can miss dynamic imports, `require()` strings, or framework magic (Next.js pages, Angular decorators). Trace output shows exactly what edges it found — or didn't.

**Maintainability index formula** (per file, 0–100, higher is better):
```
MI = 100 - (complexity_density × 30) - (dead_code_ratio × 20) - fan_out_penalty
```
Fan-out is logarithmically penalized (capped at 15 pts). A barrel file full of re-exports will score badly on fan-out even with no complexity.

**`--changed-since` scopes analysis without losing graph context.** Fallow still builds the full module graph — it just filters output to changed files. Safe to use in PR checks without missing cross-file dead code.

## Recommended agent workflow

1. **Orient**: `fallow health --score` — get the headline grade
2. **Find dead weight**: `fallow dead-code --format json` — unused files/exports/deps
3. **Find risk**: `fallow health --hotspots` — complex files with high churn
4. **Get ranked targets**: `fallow health --targets --format json` — agent-ready evidence
5. **Trace surprises**: `fallow dead-code --trace <file:export>` for anything that looks wrong
6. **Act**: delete dead code, refactor hotspots starting from highest-priority targets

## NEVER

- **NEVER delete code fallow flags without tracing it first**
  **Why:** Framework conventions (Next.js pages, Angular decorators, re-export barrels) appear unused to static analysis but are consumed at runtime.
  **Instead:** Run `fallow dead-code --trace <file:export>` and inspect the edges. If no edges exist AND no framework convention applies, then delete.

- **NEVER rank refactoring targets by complexity score alone**
  **Why:** Complexity without churn = stable risk. The hotspot formula weights both — a medium-complexity file touched every sprint outranks a high-complexity file nobody touches.
  **Instead:** Use `--hotspots` or `--targets` which apply the weighted formula.

- **NEVER run fallow health without `--format json` when consuming output in an agent loop**
  **Why:** Human format is designed for reading, not parsing. JSON gives structured `findings`, `targets`, `hotspots` arrays you can filter and sort.
  **Instead:** `fallow health --targets --format json | jq '.targets'`
