---
description: "Audit a repo and set up the next-smallest AI guardrail loop"
argument-hint: "<audit|plan|implement|validate> [focus]"
argument-completions:
  $1:
    - value: audit
      description: Read-only repo baseline and loop maturity report
    - value: plan
      description: Propose guardrail loops without editing files
    - value: implement
      description: Implement the smallest safe guardrail after audit/plan
    - value: validate
      description: Test existing guardrails with intentional violations
---

Use the `loop-engineering` and `repo-guardrails` skills for this request.

Requested mode/focus:

```text
$ARGUMENTS
```

If no mode is clear, default to `audit` and do not edit files.

Modes:

- `audit [focus]` — read-only. Baseline the current repo, classify guardrail/loop maturity, list existing local gates, CI, hooks, agent instructions, state files, and obvious gaps. Do not change files.
- `plan [focus]` — read-only unless creating a plan is explicitly requested. Propose 1–3 next-smallest guardrail loops with trigger, scope, isolation, state, maker/checker split, human gate, budget, kill switch, and validation step.
- `implement [focus]` — first audit briefly, then implement the smallest safe deterministic guardrail or report-only loop. Prefer local gate/CI parity before autonomy. Ask before risky, broad, or unattended write-loop changes.
- `validate [focus]` — verify existing guardrails. Intentionally create one small safe violation, confirm local/CI-equivalent checks catch it, then revert. If unsafe, explain why and propose a safer validation.

Rules:

1. Start by reading the relevant skill files if they are available:
   - `/Users/ebeyene/dotfiles/agents/.agents/skills/loop-engineering/SKILL.md`
   - `/Users/ebeyene/dotfiles/agents/.agents/skills/repo-guardrails/SKILL.md`
2. For repo guardrail implementation, follow mandatory references from `repo-guardrails` before editing CI, git hooks, logging, or design rules.
3. Run the bundled audit script when available:
   `python3 /Users/ebeyene/dotfiles/agents/.agents/skills/repo-guardrails/scripts/audit_feedback_loop.py <repo-root>`
4. Treat loop rollout as: report-only → assisted fixes → allowlisted unattended actions.
5. Never set up unattended write automation unless state, checker, human gate, budget, and kill switch are explicit and approved.
6. Use worktrees/branches for parallel or agent-authored write work.
7. Prefer deterministic checks over prose instructions.
8. Keep the maker/checker split explicit.
9. Keep durable state outside chat, such as `LOOP.md`, `.ai/STATE.md`, or a tracker item, only after asking if the location is ambiguous.
10. Be concise. Output: maturity, findings, recommended next loop, files changed, commands run, and validation status.

Proceed with the requested mode.
