---
name: skill-creator
description: "Build, review, and improve agent skills: agentskills.io spec validation, quality rubric, description-drift detection, numbered improvements applied with approval. Use when creating, auditing, fixing, or grading a skill or prompt ('skillify this', 'audit all skills', 'grade report')."
compatibility: Python 3.10+ recommended for skills-ref validation (optional). Works without it using built-in checks.
---

# Skill Creator

Build, judge, and sharpen agent skills. Every line must earn its tokens.

## Core Constraint

**Knowledge delta = Expert knowledge − what Agent already knows.** For every section: mark it [E]xpert / [A]ctivation / [R]edundant. Target >70% Expert. Delete [R]. "Would Agent do this without being told?" — if yes, it's [R].

This single constraint governs everything else. Description quality, progressive disclosure, NEVER rules, freedom calibration — all downstream of: _does this line add knowledge the agent doesn't have?_

## Guardrails

### Spec validation (run first, always)

```bash
scripts/validate-skill <path>
```

Uses `skills-ref validate` if installed, else built-in checks. Catches: frontmatter, name rules, description length, missing references, auxiliary files, NEVER format, MANDATORY READ triggers. Fix all errors before quality evaluation.

### Quality evaluation

**MANDATORY — READ `references/rubric.md`** before evaluating. **MANDATORY — READ `references/failure-patterns.md`** for common issues.

### Structural (when creating/modifying)

**MANDATORY — READ `references/patterns.md`** before selecting a pattern. **WebFetch `https://agentskills.io/specification`** for current frontmatter requirements.

Proposed changes must clear: no rule conflicts, no duplicate guidance, no principles violations, no vague scope. Extend existing skills before creating new ones.

## Non-Obvious Moves

These are the things that take experience to learn. The agent won't figure them out alone.

**Read body before description.** When reviewing a skill, form an independent summary from the body first. Then compare to the description. Starting from the description anchors you to its framing — you'll miss drift.

**Description > Body.** Agent sees only descriptions when selecting skills. A perfect body with a vague description is an invisible skill. All triggering info goes in description — "When to use" sections in the body are dead weight (body loads after selection).

**Short, precise descriptions.** As short as possible while unambiguous about when to apply: WHAT (one clause) + WHEN (the specific task it's for, not the domain it touches). "Create and validate Postgres migrations. Use when adding or changing a migration, or reviewing its rollout" — not "use when working with databases, queries, or persistence." Add a DO-NOT-trigger clause only when a plausible confusable domain exists. No `Keywords:` lists — selection is semantic, and keyword walls dilute the trigger, bloat every session's context, and can contradict sibling skills' descriptions.

**Every NEVER needs WHY + INSTEAD.** A prohibition without a reason gets forgotten. A prohibition without an alternative gets violated when the obvious path is blocked. No vague warnings ("be careful") — only specific patterns + what goes wrong + what to do instead.

**Guardrails over workflows.** Prescribe constraints, not steps — and match specificity to fragility. Modern models handle nuance, so elaborate step-by-step itineraries now hinder more than they help. Reserve exact sequences for fragile operations (exact commands, order-dependent steps); give rationale + freedom everywhere else — an agent that knows *why* adapts, an agent following a script can't.

**Boundaries as outcomes, not fear.** Strong ALWAYS/ask-first language is for genuinely destructive or irreversible actions only. Capable models honor it to a fault — "ask before running anything" makes them stop work you'd want finished. State the boundary and the safe path instead: "local tests use disposable fixtures — run and rerun them without asking."

**Define done.** Workflow skills must define completion — what to verify and report — rather than a review checkpoint after first pass. A "stop for review" line pulls the model to an early stopping point; if work should continue past first success (run it, inspect, fix what fails), say so, and say where exploration should stop.

**Write for many models.** Repo skills outlive your current model and guide other contributors' agents. Don't encode workarounds for one model's weakness: guidance that only helps a weak model and overconstrains a strong one should be conditional or cut.

## Output Formats

### Drift report

```
## Recap: <skill>
**Description claims:** [one line]
**Body actually does:** [one line — from body only]
**Drift:** [specific discrepancies, or "None"]
**Verdict:** Aligned / Minor drift / Significant drift
```

### Batch report

Sorted grade ascending (worst first). Split into Needs Work (<B) and Passing (≥B). Top 5 improvements per skill.

### Applying improvements

One at a time with diff. Commit after each approval. Cap at 3 revisions per item before surfacing to human.

## NEVER

- **NEVER restate what Agent already knows** ("write clean code", "handle errors")
  **Instead:** Ask "Would Agent do this without being told?" Delete yes.
  **Why:** Padding dilutes expert signal.

- **NEVER dump everything in SKILL.md**
  **Instead:** Body < 300 lines; heavy content → `references/` with MANDATORY READ triggers.
  **Why:** Agent drowns in irrelevant content on every invocation.

- **NEVER create a new skill when an existing one covers the domain**
  **Instead:** Extend existing skills first.
  **Why:** Duplicate skills split activation signals.

- **NEVER skip spec validation before quality evaluation**
  **Instead:** Run `scripts/validate-skill <path>` first.
  **Why:** Quality scoring is meaningless when basic format compliance fails.

- **NEVER score based on formatting or length**
  **Instead:** Score for expert knowledge density.
  **Why:** Formatting is cheap; rewarding it masks content gaps.

- **NEVER apply two improvements in one change**
  **Instead:** One at a time with independent approval.
  **Why:** Bundling defeats per-item review.

- **NEVER prescribe a fixed workflow for tasks the agent can figure out**
  **Instead:** Give guardrails and let the agent choose the path.
  **Why:** Prescribed steps force a human mental model — loses parallelism, can't adapt, rots over time.

- **NEVER stuff descriptions with keyword lists or over-broad triggers**
  **Instead:** Short WHAT + precise WHEN; DO-NOT clause only for genuinely confusable domains.
  **Why:** Long descriptions get truncated, contradict sibling skills, and over-trigger — loading guidance the task doesn't need.

- **NEVER make reference loads unconditional**
  **Instead:** Trigger each reference on the task state that needs it ("before configuring CI", "if validation fails").
  **Why:** Forcing every read burns context on guidance that may never apply.
