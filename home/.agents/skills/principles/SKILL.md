---
name: principles
description: "The 24 pstack working principles (poteto, MIT) as reference files. Load when any trigger matches: refactoring, diff size, or temptation to add abstractions or layers — smallest change, bias to deletion (laziness protocol); choosing core types and data structures before writing logic, scaffold-vs-feature sequencing, what concurrent actors share (foundational thinking); integrating a new requirement into an existing design (redesign from first principles); two or more fixes sharing one premise failed the same gate (attack the premise); sequencing an addition, refactor, or rewrite — remove dead code and redundant validators first (subtract before you add); code that is hard to trace, layers between question and answer, hidden state in the reader's head (minimize reader load); planned rewrites and migrations with phase boundaries — converge on the target architecture (outcome-oriented execution); product, UX, or feature-scope tradeoffs — user delight over implementation convenience (experience first); novel UI interaction or architectural decision with no codebase precedent — build 2-3 competing prototypes (exhaust the design space); non-trivial edits, migrations, analyses, checks — build the codemod, script, or generator instead of hand work (build the lever); stateful logic, code that branches a lot, shape assumptions repeated across files (model the domain); wiring validation, error handling, or framework adapters — guards at boundaries, pure business core (boundary discipline); designing types, reviewing signatures, statically-typed code — make illegal states unrepresentable (type system discipline); commands, lifecycle steps, or processing loops amid crashes, restarts, retries — converge to the same end state (make operations idempotent); introducing a new internal API while old callers exist — migrate and delete in one wave (migrate callers then delete legacy APIs); concurrent actors might write the same file, branch, key, or state object (separate before serializing shared state); after completing a task, before declaring done — verify the real artifact, not a proxy (prove it works); debugging — reproduce first, trace to root cause, no nil-check guards silencing crashes (fix root causes); multi-step work, sweeps, migrations, and how you stack commits and PRs — units that each end in a verifiable state (sequence work into verifiable units); writing, changing, or keeping a test — call the code as its users do (test behavior, not implementation); before trusting, reporting, or acting on a measured number — speedup, regression, throughput, latency, eval result (explain the number); context filling up — large outputs, long files, repeated reads, fan-out planning, route bulk to subagents (guard the context window); tempted to ask 'should I do X?' on reversible work (never block on the human); writing the same instruction a second time or noticing a recurring correction — encode it as a lint, flag, check, or script (encode lessons in structure)."
disable-model-invocation: true
source: https://github.com/cursor/plugins/tree/main/pstack
license: MIT (pstack, by poteto)
---

# Principles

The 24 pstack working principles by poteto (MIT), ported verbatim from the Cursor pstack plugin into `references/` — one rule per file, each self-contained. Bodies are the source skills' text unchanged; only frontmatter was adapted.

**When to load:** when a trigger in the index below matches the work — designing, refactoring, debugging, verifying, measuring, testing, or planning fan-out. Read only the matched principle's file (or a few), not all 24. Principles compose: laziness protocol gates what you write; prove-it-works gates when you are done.

| rule | reference | trigger |
| --- | --- | --- |
| Laziness Protocol | references/laziness-protocol.md | Refactoring, diff size, or temptation to add abstractions/layers — smallest change, bias to deletion. |
| Foundational Thinking | references/foundational-thinking.md | Before writing logic: core types and data structures first; structural decisions protect option value. |
| Redesign From First Principles | references/redesign-from-first-principles.md | Integrating a new requirement into an existing design. |
| Attack the Premise | references/attack-the-premise.md | Two or more fixes sharing one premise failed the same gate — census the actors, question the premise. |
| Subtract Before You Add | references/subtract-before-you-add.md | Sequencing an addition, refactor, or rewrite — remove dead code and redundant validators first. |
| Minimize Reader Load | references/minimize-reader-load.md | Code that is hard to trace — count layers between question and answer, hidden state in the reader's head. |
| Outcome-Oriented Execution | references/outcome-oriented-execution.md | Planned rewrites/migrations with phase boundaries — converge on the target, no throwaway compat states. |
| Experience First | references/experience-first.md | Product, UX, or feature-scope tradeoffs — delight over implementation convenience; fewer, polished. |
| Exhaust the Design Space | references/exhaust-the-design-space.md | Novel UI interaction or architecture with no codebase precedent — build 2-3 competing prototypes and compare. |
| Build the Lever | references/build-the-lever.md | Any non-trivial work — build the codemod/script/generator instead of working by hand; the tool is rerunnable proof. |
| Model the Domain | references/model-the-domain.md | Stateful logic, heavily branching code, or shape assumptions repeated across files. |
| Boundary Discipline | references/boundary-discipline.md | Wiring validation, error handling, or framework adapters — guards at system boundaries, pure core. |
| Type System Discipline | references/type-system-discipline.md | Designing types or signatures in statically-typed languages — make illegal states unrepresentable. |
| Make Operations Idempotent | references/make-operations-idempotent.md | Commands, lifecycle steps, or loops that run amid crashes, restarts, and retries — converge to the same end state. |
| Migrate Callers Then Delete Legacy APIs | references/migrate-callers-then-delete-legacy-apis.md | New internal API with old callers still present — migrate and delete in the same wave. |
| Separate Before Serializing Shared State | references/separate-before-serializing-shared-state.md | Concurrent actors might write the same file, branch, key, or state object — eliminate sharing first. |
| Prove It Works | references/prove-it-works.md | After completing a task, before declaring done — verify the real artifact, not a proxy or self-report. |
| Fix Root Causes | references/fix-root-causes.md | Debugging — reproduce first, trace to the root cause; no nil-check guards that silence crashes. |
| Sequence work into verifiable units | references/sequence-verifiable-units.md | Multi-step work and commit/PR stacking — units that each end in a verifiable state, checked before the next. |
| Test Behavior, Not Implementation | references/test-behavior-not-implementation.md | Writing, changing, or keeping a test — call the code as its users do; delete tests that assert internals. |
| Explain the Number | references/explain-the-number.md | Before trusting or reporting a measured number — find what limits it; rule out that it measured something else. |
| Guard the Context Window | references/guard-the-context-window.md | Context filling up — large outputs, repeated reads, fan-out planning; bulk to subagents, summaries in main thread. |
| Never Block on the Human | references/never-block-on-the-human.md | Tempted to ask 'should I do X?' on reversible work — decide and proceed. |
| Encode Lessons in Structure | references/encode-lessons-in-structure.md | Writing the same instruction twice or recurring corrections — encode as lint, metadata flag, runtime check, or script. |
