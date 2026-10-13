---
name: fanout
description: "The 4 pstack fan-out skills (poteto, MIT) as reference files. Load when a trigger matches: sketching types, signatures, and module structure before coding and staying in the loop while implementation fills in — 'architect this', 'design this', non-trivial work where jumping to code would lock in the wrong shape (architect); N parallel candidates on the same task, pick a base, graft the strongest parts of the losers into it — 'arena this', 'throw it in the arena', bakeoff, competing prototypes for a novel design (arena); fanning out N parallel workers for coverage, races, gauntlets, or exploration and returning one aggregated report — 'swarm this' (swarm); adversarial multi-reviewer review of a change before shipping — 'interrogate', 'adversarial review', 'challenge this', 'stress test this code', 'find blind spots', 'tear this apart' (interrogate)."
source: https://github.com/cursor/plugins/tree/main/pstack
license: MIT (pstack, by poteto)
---

# Fanout

The pstack fan-out skills by poteto (MIT), ported from the Cursor pstack plugin into `references/`. Bodies are the source skills' text; only Cursor machinery was adapted (model seats → same-model runners with varied briefs, Task spawns → pi subagents, cross-judging → independent fresh-context passes). Read the matched reference, not all of them.

| member | reference | trigger |
| --- | --- | --- |
| architect | references/architect.md | Sketch types, signatures, and module boundaries before code; "architect this", "design this", non-trivial work where jumping to code would lock in the wrong shape. |
| arena | references/arena.md | N parallel candidates on one task, pick a base, graft the losers' strengths; "arena this", "throw it in the arena", competing prototypes. |
| swarm | references/swarm.md | Fan out N parallel workers, drain them, return one report; "swarm this", parallel coverage, races, gauntlets, exploration. |
| interrogate | references/interrogate.md | Adversarial review before shipping; "interrogate", "challenge this", "stress test this code", "find blind spots", "tear this apart". |

## Bundle rules

- **One model, varied briefs.** Every fan-out shape runs its runners, workers, and reviewers on the same model. Diversity comes from deliberately varied briefs and fresh contexts, never from model seats or routing.
- **Isolate every parallel writer** in its own output location — a git worktree when possible — per the [separate-before-serializing-shared-state](../principles/references/separate-before-serializing-shared-state.md) principle.
- **Keep bulk out of the parent context** per the [guard-the-context-window](../principles/references/guard-the-context-window.md) principle: subagents write artifacts to paths; the parent reads summaries, the picked artifact, and compact tables, never raw dumps.
- **Dispatch:** pi subagents in a single message when subagent dispatch is available; otherwise one fresh inline pass per runner/worker/reviewer, sequentially, each starting from a clean context.
- **interrogate never auto-applies changes.** Its deliverable is a synthesized verdict; the human decides what to act on.
