# Evaluation Rubric

## Grade Scale

| Grade | %      | Meaning                     |
| ----- | ------ | --------------------------- |
| A     | 90%+   | Production-ready            |
| B     | 80–89% | Minor improvements needed   |
| C     | 70–79% | Clear improvement path      |
| D     | 60–69% | Significant issues          |
| F     | <60%   | Fundamental redesign needed |

Grade = total scored / total applicable max (as %).

## Group Detection

```
[ ] SKILL.md?                  → U + S (120 pts)
[ ] AGENTS.md / system prompt? → U + C (120 pts)
[ ] Contains bash/shell rules? → Also + B (150 pts max)
[ ] Other?                     → U only (80 pts)
```

Multiple groups apply additively.

**Spec Cache** (for S1 scoring only): `~/.claude/tmp/agentskills-spec-YYYY-MM-DD.md`. Glob for today → read if found → else WebFetch `https://agentskills.io/specification` → write to cache.

---

## Group U: Universal (80 pts)

| ID  | Dimension            | Pts | 0–33%                   | 34–66%                         | 67–89%                             | 90%+                                      |
| --- | -------------------- | --- | ----------------------- | ------------------------------ | ---------------------------------- | ----------------------------------------- |
| U1  | Knowledge Delta      | 20  | Restates basics         | Mixed expert + redundant       | Mostly expert                      | Pure delta — every paragraph earns tokens |
| U2  | Mindset + Procedures | 15  | Only generic procedures | Domain procedures, no thinking | Good thinking + domain workflows   | Expert thinking + non-obvious procedures  |
| U3  | Anti-Pattern Quality | 15  | No anti-patterns        | Vague warnings                 | Specific NEVER with some reasoning | Non-obvious WHY from real failures        |
| U4  | Freedom Calibration  | 15  | Severely mismatched     | Partially appropriate          | Good for most scenarios            | Fragile=rigid, creative=free              |
| U5  | Practical Usability  | 15  | Confusing/contradictory | Usable with gaps               | Clear for common cases             | Edge cases + error recovery               |

## Group S: Skill (40 pts) — SKILL.md only

| ID  | Dimension              | Pts | 0–33%                   | 34–66%                        | 67–89%                          | 90%+                              |
| --- | ---------------------- | --- | ----------------------- | ----------------------------- | ------------------------------- | --------------------------------- |
| S1  | Spec Compliance        | 15  | Invalid frontmatter     | Vague description             | WHAT present, weak WHEN         | WHAT + WHEN + KEYWORDS            |
| S2  | Progressive Disclosure | 15  | Everything in SKILL.md  | References exist, no triggers | MANDATORY triggers present      | Triggers + "Do NOT load" guidance |
| S3  | Pattern Recognition    | 10  | No recognizable pattern | Partial match                 | Clear pattern, minor deviations | Pattern fits task perfectly       |

## Group C: AGENTS.md (40 pts) — behavioral prompts

| ID  | Dimension               | Pts | 0–33%             | 34–66%         | 67–89%               | 90%+                          |
| --- | ----------------------- | --- | ----------------- | -------------- | -------------------- | ----------------------------- |
| C1  | Behavioral Clarity      | 15  | Contradictory     | Some conflicts | Minor edge ambiguity | Zero contradictions           |
| C2  | Scope Definition        | 15  | Over/under-scoped | Some waste     | Well-scoped          | Governs exactly what's needed |
| C3  | Structural Organization | 10  | Prose walls       | Inconsistent   | Clear sections       | Critical rules prominent      |

## Group B: Bash (30 pts) — shell guidance

| ID  | Dimension              | Pts | 0–33%            | 34–66%                     | 67–89%                     | 90%+                           |
| --- | ---------------------- | --- | ---------------- | -------------------------- | -------------------------- | ------------------------------ |
| B1  | Rule Specificity & WHY | 10  | Vague warnings   | Names constructs, weak WHY | Specific + non-obvious WHY | Exact construct + failure mode |
| B2  | Anti-Pattern Coverage  | 10  | Generic hazards  | Some env-specific          | Good coverage              | Comprehensive env-specific     |
| B3  | Scope & Exceptions     | 10  | Over/under-broad | Mostly right               | Well-scoped + exceptions   | Precise scope + alternatives   |
