---
name: skill-creator
description: "Build, review, and improve agent skills. Validates against the agentskills.io spec, evaluates quality via a dimensional rubric, detects description drift, produces numbered improvements, and applies them with approval. Use when: creating a new skill, reviewing/auditing/judging a skill or prompt, updating/fixing a skill, evaluating prompt quality, 'skillify this', 'make this proper', 'audit all skills', 'grade report'. Triggers: skill, SKILL.md, prompt quality, knowledge delta, skill review, skill audit, judge prompt, skill creation."
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

**Description > Body.** Agent sees only descriptions when selecting skills. A perfect body with a vague description is an invisible skill. Description must have WHAT + WHEN + KEYWORDS. All triggering info goes in description — "When to use" sections in the body are dead weight (body loads after selection).

**Every NEVER needs WHY + INSTEAD.** A prohibition without a reason gets forgotten. A prohibition without an alternative gets violated when the obvious path is blocked. No vague warnings ("be careful") — only specific patterns + what goes wrong + what to do instead.

**Guardrails over workflows.** Prescribe constraints, not steps. The agent decides how; the human reviews output (grade, report, drift verdict), not process.

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
