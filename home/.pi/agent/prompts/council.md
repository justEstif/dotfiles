---
description: Get three independent analyses of a consequential decision, then synthesize one verdict
argument-hint: "<decision or question>"
---

Turn `$@` into one self-contained brief containing the decision, relevant repository context, constraints, known evidence, and required answer format.

Use the subagent tool in parallel mode to send that exact brief to three independent `worker` agents. Their task is read-only analysis: they must not modify files or coordinate with one another.

After all three return:

1. State one definitive verdict.
2. Summarize each analysis in 2–3 lines.
3. Identify every material disagreement.
4. Explain why the verdict accepts one argument over the others.
5. Report the split when applicable, such as `2–1`.

Do not average incompatible recommendations. Do not act on the verdict.
