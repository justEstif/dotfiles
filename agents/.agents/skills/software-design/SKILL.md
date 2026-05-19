---
name: software-design
description: Find deepening opportunities in a codebase and design deep modules, informed by the domain language in CONTEXT.md and decisions in docs/adr/. Use when improving architecture, finding refactoring opportunities, consolidating tightly-coupled modules, making a codebase more testable and AI-navigable, designing new modules/APIs/abstractions, or applying software design principles. Triggers on code reviews, refactoring tasks, module/API design, architecture discussions, red flags, shallow modules, information leakage, design quality, module depth.
---

# Software Design

Surface architectural friction and propose **deepening opportunities** — refactors that turn shallow modules into deep ones. Also guide the design of new modules for depth from the start. The aim is testability and AI-navigability.

**MANDATORY — READ `references/language.md`** for glossary and principles. **MANDATORY — READ `references/deepening.md`** for dependency categorisation and seam discipline. **MANDATORY — READ `references/red-flags.md`** for detection signals to use during exploration.

Informed by the project's domain model — `CONTEXT.md` and any `docs/adr/`. The domain language gives names to good seams; ADRs record decisions this skill should not re-litigate. See [CONTEXT-FORMAT.md](../domain-model/CONTEXT-FORMAT.md) and [ADR-FORMAT.md](../domain-model/ADR-FORMAT.md).

## Glossary

Use these terms exactly in every suggestion. Consistent language is the point — don't drift into "component," "service," "API," or "boundary." Full definitions in [LANGUAGE.md](references/language.md).

- **Module** — anything with an interface and an implementation (function, class, package, slice).
- **Interface** — everything a caller must know to use the module: types, invariants, error modes, ordering, config. Not just the type signature.
- **Implementation** — the code inside.
- **Depth** — leverage at the interface: a lot of behaviour behind a small interface. **Deep** = high leverage. **Shallow** = interface nearly as complex as the implementation.
- **Seam** — where an interface lives; a place behaviour can be altered without editing in place. (Use this, not "boundary.")
- **Adapter** — a concrete thing satisfying an interface at a seam.
- **Leverage** — what callers get from depth.
- **Locality** — what maintainers get from depth: change, bugs, knowledge concentrated in one place.

Key principles (see [LANGUAGE.md](references/language.md) for the full list):

- **Deletion test**: imagine deleting the module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep.
- **The interface is the test surface.**
- **One adapter = hypothetical seam. Two adapters = real seam.**
- **Define errors out of existence** — choose semantics that eliminate error conditions rather than propagating them.
- **Strategic over tactical** — invest 10-20% extra per change in design quality; compound returns beat short-term velocity.

## Process

### 1. Explore

Read existing documentation first:

- `CONTEXT.md` (or `CONTEXT-MAP.md` + each `CONTEXT.md` in a multi-context repo)
- Relevant ADRs in `docs/adr/` (and any context-scoped `docs/adr/` directories)

If any of these files don't exist, proceed silently — don't flag their absence or suggest creating them upfront.

Then use the Agent tool with `subagent_type=Explore` to walk the codebase. Don't follow rigid heuristics — explore organically and note where you experience friction:

- Where does understanding one concept require bouncing between many small modules?
- Where are modules **shallow** — interface nearly as complex as the implementation?
- Where have pure functions been extracted just for testability, but the real bugs hide in how they're called (no **locality**)?
- Where do tightly-coupled modules leak across their seams?
- Which parts of the codebase are untested, or hard to test through their current interface?

Apply the **deletion test** to anything you suspect is shallow: would deleting it concentrate complexity, or just move it? A "yes, concentrates" is the signal you want.

**Red flag scan** — while exploring, actively check against [RED-FLAGS.md](references/red-flags.md). The red flags are detection signals, not a checklist to tick off. Use them to sharpen your instincts about where friction signals real shallowness vs. acceptable trade-offs.

### 2. Present candidates

Present a numbered list of deepening opportunities (see [DEEPENING.md](references/deepening.md) for dependency categorisation and seam discipline). For each candidate:

- **Files** — which files/modules are involved
- **Problem** — why the current architecture is causing friction (connect to a red flag from [RED-FLAGS.md](references/red-flags.md) when applicable)
- **Solution** — plain English description of what would change
- **Benefits** — explained in terms of locality and leverage, and also in how tests would improve

**Use CONTEXT.md vocabulary for the domain, and [LANGUAGE.md](references/language.md) vocabulary for the architecture.** If `CONTEXT.md` defines "Order," talk about "the Order intake module" — not "the FooBarHandler," and not "the Order service."

**ADR conflicts**: if a candidate contradicts an existing ADR, only surface it when the friction is real enough to warrant revisiting the ADR. Mark it clearly (e.g. _"contradicts ADR-0007 — but worth reopening because…"_). Don't list every theoretical refactor an ADR forbids.

Do NOT propose interfaces yet. Ask the user: "Which of these would you like to explore?"

### 3. Grilling loop

Once the user picks a candidate, drop into a grilling conversation. Walk the design tree with them — constraints, dependencies, the shape of the deepened module, what sits behind the seam, what tests survive.

Side effects happen inline as decisions crystallize:

- **Naming a deepened module after a concept not in `CONTEXT.md`?** Add the term to `CONTEXT.md` — same discipline as `/domain-model` (see [CONTEXT-FORMAT.md](../domain-model/CONTEXT-FORMAT.md)). Create the file lazily if it doesn't exist.
- **Sharpening a fuzzy term during the conversation?** Update `CONTEXT.md` right there.
- **User rejects the candidate with a load-bearing reason?** Offer an ADR, framed as: _"Want me to record this as an ADR so future architecture reviews don't re-suggest it?"_ Only offer when the reason would actually be needed by a future explorer to avoid re-suggesting the same thing — skip ephemeral reasons ("not worth it right now") and self-evident ones. See [ADR-FORMAT.md](../domain-model/ADR-FORMAT.md).
- **Want to explore alternative interfaces for the deepened module?** See [INTERFACE-DESIGN.md](references/interface-design.md).
- **Designing a new module (greenfield)?** Apply "Design it twice" — propose at least two radically different interfaces. See [INTERFACE-DESIGN.md](references/interface-design.md) for the parallel sub-agent pattern.

## Pragmatic Application

These are guidelines, not laws. When reviewing:

- A shallow method that improves readability at call sites is fine
- Comments explaining "why" are valuable; don't demand them for obvious code
- Small helper functions for repeated 3-line patterns are acceptable
- Perfect information hiding is not always worth the refactoring cost

Always weigh the **cost of change** against the **complexity reduction**. Recommend changes only when the net benefit is clear.

## NEVER

- **NEVER** propose interfaces in step 2 (present candidates). **Why:** interfaces lock in thinking before the user has chosen which problem to solve. **Instead:** present the problem and solution in plain English, then ask which candidate to explore.
- **NEVER** re-litigate a decision recorded in an ADR unless the friction is real. **Why:** ADRs exist to stop endless re-argument. **Instead:** only surface ADR conflicts when the pain is measurable, and mark them clearly.
- **NEVER** suggest refactors without connecting to a complexity consequence. **Why:** "this is shallow" is not actionable without linking to cognitive load, change amplification, or unknown unknowns. **Instead:** always explain WHY something is a problem in terms of its downstream effects.
- **NEVER** demand dogmatic compliance on every principle. **Why:** real codebases have constraints — perfect design is not the goal. **Instead:** prioritize the highest-impact issues and note low-severity ones only when asked.
