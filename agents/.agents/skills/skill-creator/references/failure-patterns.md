# Failure Patterns

Quick-reference checklist. Check for these during evaluation.

## Skill Failures

| #   | Pattern            | Symptom                                | Fix                                                            |
| --- | ------------------ | -------------------------------------- | -------------------------------------------------------------- |
| 1   | Tutorial           | Explains basics Agent knows            | Delete. Focus on expert decisions and trade-offs.              |
| 2   | Dump               | SKILL.md > 500 lines                   | Core in SKILL.md (<300), detail in `references/`.              |
| 3   | Orphan References  | `references/` exists, never loaded     | Add MANDATORY READ triggers at workflow steps.                 |
| 4   | Checkbox Procedure | Step 1, 2, 3... mechanical             | Transform to "Before X, ask yourself..."                       |
| 5   | Vague Warning      | "Be careful", "avoid errors"           | Specific NEVER + non-obvious reason + alternative.             |
| 6   | Invisible Skill    | Good content, never activates          | Description needs WHAT + WHEN + KEYWORDS.                      |
| 7   | Wrong Location     | "When to use" in body, not description | Triggering info → description field. Body loads after trigger. |
| 8   | Over-Engineered    | README, CHANGELOG, CONTRIBUTING        | Delete all auxiliary files.                                    |
| 9   | Freedom Mismatch   | Rigid for creative, vague for fragile  | Match freedom to consequence of mistakes.                      |

## AGENTS.md / System Prompt Failures

| #   | Pattern             | Symptom                                         | Fix                                                  |
| --- | ------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| 10  | Contradiction       | Two sections, same scenario, different outcomes | Make scope explicit per section.                     |
| 11  | Default Restatement | "Be helpful", "write clear code"                | Test: "does Agent do this anyway?" Delete yes.       |
| 12  | Scope Wall          | Rules for every conceivable case                | Cover 5–10 real failure modes. Trust defaults.       |
| 13  | Prose Wall          | Rules buried in paragraphs                      | Labeled sections, bullet lists, each rule parseable. |

## Bash Guidance Failures

| #   | Pattern               | Symptom                    | Fix                                        |
| --- | --------------------- | -------------------------- | ------------------------------------------ |
| 14  | Generic Shell Warning | "Be careful with commands" | Name exact construct + exact failure mode. |
| 15  | Missing Alternative   | NEVER with no replacement  | Every NEVER needs INSTEAD.                 |
