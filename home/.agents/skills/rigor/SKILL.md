---
name: rigor
description: "Seven pstack rigor references (poteto, MIT). Load for: TDD, failing/regression tests, or a bug with a cheap local test target (tdd); benchmarking or reporting speedups/performance numbers (benchmark-checklist); 'blast radius', 'what could this break', or a distrusted small diff (blast-radius); repeated agent mistakes corrected by the operator (correct); autonomous, multi-phase, or long-running work needing an evidence-backed decision trail (show-me-your-work); no scripted UI/CLI/service verification or a request for a repo control/verification skill (create-verification-skill); 'audit the verify skill' or a stale feature map (maintain-verification-skill)."
source: https://github.com/cursor/plugins/tree/main/pstack
license: MIT (pstack, by poteto)
---

# Rigor

The 7 pstack rigor skills by poteto (MIT), ported from the Cursor pstack plugin into `references/`. Bodies are the source skills' text; only Cursor machinery was adapted. Read the matched reference, not all of them.

| member | reference | trigger |
| --- | --- | --- |
| tdd | references/tdd.md | Explicit TDD / failing-test / regression-test request, or a bug with a cheap local test target. |
| benchmark-checklist | references/benchmark-checklist.md | You produced or are about to report a performance number. |
| blast-radius | references/blast-radius.md | "Blast radius of X", "what could this break", distrusted small diff. |
| correct | references/correct.md | The operator keeps correcting agents in this repo for the same mistakes. |
| show-me-your-work | references/show-me-your-work.md | Long-running or unattended work needing a reviewable decision trail. |
| create-verification-skill | references/create-verification-skill.md | Project has no scripted way to drive and prove the real app. |
| maintain-verification-skill | references/maintain-verification-skill.md | Audit the generated verify skill; feature map drifted from the app. |

## Bundle rules

- **Verification skills are repo-scoped.** The create/maintain pair writes generated skills to `.pi/agent/skills/verify-<app>/` in the project — project-local and pi-visible — never into `~/.agents/skills/`. Browser-driving recipes route through the local `agent-browser` skill.
- **Decision logs stay local by default.** `decisions.tsv` in the work dir, or `.audit/<task-slug>.tsv`, left out of git; commit only when a reviewer needs the trail to trust the result. Template: [references/decision-log-template.tsv](references/decision-log-template.tsv); row helper: [scripts/log.sh](scripts/log.sh).
- **tdd and benchmark-checklist are the procedures behind principles:** tdd applies [test-behavior-not-implementation](../principles/references/test-behavior-not-implementation.md) and the failing-test-first unit shape from [sequence-verifiable-units](../principles/references/sequence-verifiable-units.md); benchmark-checklist is the full procedure the [explain-the-number](../principles/references/explain-the-number.md) principle demands. blast-radius pairs with how/why ([../understand/references/how.md](../understand/references/how.md), [../understand/references/why.md](../understand/references/why.md)) and escalates wide changes to [arena](../fanout/references/arena.md).
- **Never block on the human mid-run.** Where a member faces a fork, the [never-block-on-the-human](../principles/references/never-block-on-the-human.md) principle governs unattended stages; gates belong to the `task` skill, not here.

## References

- [decision-log-template.tsv](references/decision-log-template.tsv) — header row copied to start a clean decision log.
- [create-verification-skill/feature-map-example/](references/create-verification-skill/feature-map-example/) — worked example of a generated skill's feature map.
