---
description: Ask three independent agents the same consequential question and synthesize one verdict
argument-hint: "<decision or question>"
---

Turn `$@` into one self-contained brief containing the question, relevant files and context, constraints, previous attempts, and required answer format.

Use the subagent tool in parallel mode to send that exact brief to three independent `worker` agents. Require read-only analysis and do not let them see one another's answers.

After all three return:

1. Give one definitive verdict.
2. Summarize each counselor in 2–3 lines.
3. Identify every material disagreement.
4. Explain why the verdict accepts one argument over the others.
5. Report the split when applicable, such as `2–1`.

Do not average incompatible recommendations. Do not modify files or act on the verdict.
