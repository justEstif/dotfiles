---
name: repo-guardrails
description: "Design repo feedback loops for AI-assisted engineering: deterministic local/CI gates, lint/custom rules, worktree-safe agent flows, maker/checker subagents, durable state, observability-to-tasks, cost/safety limits, and git protections. Use when hardening a repo for agents, reducing AI code drift, migrating CLAUDE.md guidance into enforceable checks, encoding software-design red flags as checks, adding CI/pre-commit/pre-push/protected-branch guardrails, or designing scheduled/goal-driven maintenance loops. For diagnosing which modules/interfaces should change, use software-design first; for writing behavior through tests, use tdd."
---

# Repo Guardrails as Loops

Turn repeated review comments, implicit architecture rules, production signals, and agent mistakes into deterministic loops that find work, isolate it, check it, record state, and escalate when judgment is needed.

Core idea: instructions help; feedback loops enforce; loops compound. Prefer boring signals that fail locally and in CI over prompts the agent may forget. Use *A Philosophy of Software Design* as the design-quality lens: reduce cognitive load, change amplification, and unknown unknowns by encouraging deep modules, information hiding, obviousness, consistency, and strategic design investment.

Loop-engineering stance: do not just prompt agents to "be careful." Design the system that prompts, constrains, verifies, and remembers for them. Build loops like someone who intends to stay the engineer: verification, comprehension, cost, and approval boundaries remain explicit human responsibilities.

## Loop primitives

A repo guardrail loop should name these pieces explicitly:

1. **Automation / trigger**: manual command, pre-commit, pre-push, CI, scheduled job, `/loop`, `/goal`, cron, or GitHub Action.
2. **Isolation**: branch or git worktree for agent-created changes; never let parallel agents share a dirty checkout.
3. **Skill / policy**: persistent repo knowledge in `SKILL.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, ADRs, or equivalent.
4. **Connectors**: issue tracker, GitHub, CI, logs, error monitoring, Slack, database, or MCP tools the loop may read/write.
5. **Maker/checker split**: one agent or step proposes/implements; a separate reviewer/verifier validates against tests, rules, and stated intent.
6. **State / memory**: durable file or tracker item (`.ai/STATE.md`, `LOOP.md`, Linear/GitHub issue) recording findings, attempts, decisions, and next actions.

If a loop lacks state, it re-discovers the same work. If it lacks a checker, it grades its own homework. If it lacks isolation, parallelism becomes chaos. If it lacks triggers, it is just a one-off prompt.

## Maturity levels

Classify the repo and pick the next smallest loop that catches real failures:

- **0 - Vibes**: no reliable CI/linters; humans review everything.
- **1 - Guardrails**: standard linters + CI; local gate exists; architectural drift still gets through.
- **2 - Architecture as Code**: custom rules encode team conventions, migrations, import boundaries, and design red flags.
- **3 - Assisted Loops**: scheduled/report-only loops discover issues, update state, open drafts, or propose fixes with human approval.
- **4 - Organism**: automation → isolated worktree → maker → checker → CI/observability → task/PR → state update, with explicit cost and safety limits.

Do not jump from level 0 to unattended level 4. Roll out as **report-only → assisted fixes → allowlisted unattended actions**.

## Workflow

1. Run the audit script to baseline the repo:
   `python3 ~/.agents/skills/repo-guardrails/scripts/audit_feedback_loop.py <repo-root>`
   (If the skill is installed elsewhere, substitute the actual path to the `repo-guardrails` skill directory.)
2. Classify the current maturity level.
3. Identify real input signals:
   - repeated PR comments, recurring agent mistakes, TODOs in `CLAUDE.md`, flaky CI, open issues, production errors, known migrations, dependency/security alerts, or design red flags.
   - Before adding any prose to agent instructions, ask: *Can this fail deterministically?* If yes, it belongs in a check, not only a document.
   - For design problems, ask which complexity symptom the rule prevents: cognitive load, change amplification, or unknown unknowns.
4. Design the smallest useful loop using the loop primitives:
   - Trigger: when does it run?
   - Scope: which files/issues/signals may it touch?
   - Isolation: branch/worktree strategy.
   - State: where findings and decisions are written.
   - Checker: what independent step/agent/tool decides whether done is true?
   - Human gate: what must be approved by a person?
   - Kill switch: how to pause/disable/quarantine it.
   - Budget: cadence, max runtime, token/spend cap, and escalation threshold.
5. Implement guardrails in this order. Deviate only when a specific failure mode demands it — for example, skip straight to git safety if direct pushes to `main` are actively happening, or skip to secret scanning if credentials have leaked. Otherwise, the sequence exists because earlier layers make later ones cheaper:
   - One documented local gate command runs formatting, linting, typechecking, tests, and build.
   - CI mirrors the local gate exactly; fails on warnings. **MANDATORY READ `references/ci-guardrails.md`** before configuring CI.
   - Strict type checking where applicable.
   - Complexity limits: function size, nesting, params, statements, cyclomatic/cognitive complexity.
   - Framework-appropriate plugins: bug-prevention, imports, accessibility, security, React/UI rules, etc.
   - Custom lint rules for project-specific conventions and design red flags. **MANDATORY READ `references/design-guardrails.md`** before encoding design checks.
   - Architecture checks for module boundaries, information hiding, dependency direction, and public API shape.
   - Structured logging: one wide event per request with user/business/error context. **MANDATORY READ `references/logging-guardrails.md`** before implementing logging checks.
   - Git safety checks: pre-commit/pre-push hooks, protected branches, secret scanning, and blocked destructive commands. **MANDATORY READ `references/git-guardrails.md`** before implementing.
   - Smoke/e2e/screenshot tests for critical flows.
   - Observability issue intake that turns production/staging failures into tracked tasks.
   - Scheduled/report-only loops that read the above signals and update state.
   - Assisted or unattended action loops only after the checker, state, and kill switch exist.
6. Wire the agent loop:
   - Document exact commands in agent instructions (`CLAUDE.md`, `.github/copilot-instructions.md`, `AGENTS.md`, etc.).
   - Ensure CI runs the same commands.
   - Make commands fail hard (`--max-warnings=0`, nonzero exit on screenshots/security checks).
   - Use worktrees for parallel agent changes.
   - Split maker from checker: implementer subagent, reviewer/verifier subagent, then CI/local gate.
   - Keep durable state in a repo-local excluded file or issue tracker; do not rely on chat history.
7. Validate by intentionally creating one small violation and confirming local/CI checks catch it, then revert.

**MANDATORY READ `references/playbook.md`** for stack-specific examples before implementing any guardrail.

## Good first loops

- **Daily triage loop**: scheduled read-only scan of CI failures, open issues, recent commits, TODOs, and audit output; writes `.ai/STATE.md` or updates tracker. No fixes in week one.
- **PR babysitter loop**: watches a PR, summarizes failing checks/review comments, proposes next commands, and updates state. Human owns merge.
- **CI sweeper loop**: detects failing CI, reproduces locally, proposes or drafts a fix in an isolated worktree, then asks for approval.
- **Dependency/security sweeper**: opens patch-only updates with tests and changelog links; major updates require human approval.
- **Post-merge cleanup loop**: looks for dead code, TODOs, temporary flags, or migration residue after merges; proposes scoped cleanup.
- **Observability-to-task loop**: groups errors/log anomalies into tracked tasks with user/business/error context and reproduction hints.

## Good first rules

- required CI check mirroring the local gate
- block direct pushes to `main`/`master`/`prod`
- secret scanning in pre-commit and CI
- ban `console.log` in favour of structured wide-event logger
- ban legacy design-system imports in migrated directories
- ban barrel-file imports or enforce approved import boundaries
- forbid magic spacing values outside design tokens
- complexity limits (`max-depth`, `max-lines-per-function`, `max-params`)
- import-boundary rules to prevent information leakage
- flag wrapper-only modules that hide no complexity

For JS/TS: ESLint with strict TypeScript, SonarJS, unicorn, import boundaries, a11y, React hooks, Playwright/screenshot tests. Other stacks: Ruff/mypy/pytest (Python), RuboCop (Ruby), clippy/rustfmt (Rust), golangci-lint (Go).

## NEVER

- **NEVER add a prose instruction when a lint rule is possible**
  **Instead:** Encode it as a check that runs on every commit.
  **Why:** Prose in agent instructions is forgotten. A failing lint rule is not.

- **NEVER run unattended write loops before report-only loops have earned trust**
  **Instead:** Start read-only/report-only, then assisted fixes, then tightly allowlisted unattended actions.
  **Why:** Autonomy amplifies bad judgment as quickly as good judgment.

- **NEVER let the maker be the only checker**
  **Instead:** Use a separate verifier step/agent plus deterministic tests/gates.
  **Why:** The agent that wrote the change is biased toward declaring it done.

- **NEVER run parallel agents in the same dirty checkout**
  **Instead:** Use branches/worktrees and clear ownership per loop run.
  **Why:** File collisions and hidden state make results unreproducible.

- **NEVER create loops without durable state**
  **Instead:** Write findings, attempts, approvals, and next actions to a file or tracker outside chat context.
  **Why:** The agent forgets; the repo/tracker remembers.

- **NEVER add a rule that generates 50+ legacy violations without a migration plan**
  **Instead:** Add it scoped to new files only (`overrides` / `exclude`), with a tracked migration task.
  **Why:** Teams disable noise rules immediately — the rule dies and takes trust with it.

- **NEVER let flaky checks persist**
  **Instead:** Quarantine or fix within one day of first flake.
  **Why:** One flaky check teaches agents and humans to re-run and ignore — the feedback loop collapses.

- **NEVER log strings when wide events are possible**
  **Instead:** Emit one structured event per request with all user/business/error context attached.
  **Why:** String logs are optimized for writing, not querying. Wide events answer production questions directly.

- **NEVER skip the audit step**
  **Instead:** Run `audit_feedback_loop.py` first; know the current level before proposing changes.
  **Why:** Adding level-4 loops to a level-0 repo creates rejection and revert, not adoption.

- **NEVER delete a check because it's blocking someone right now**
  **Instead:** Quarantine it with a tracked task → fix the violation → re-enable. If the check is fundamentally wrong, change the rule via PR so the architecture discussion is explicit.
  **Why:** Deleting under pressure is how feedback loops die.

## Decision rules

- If a convention or design principle appears in prose and can be checked mechanically, encode it in a tool.
- If a bug or design red flag reaches review twice, create a guardrail before fixing it a third time.
- If a loop would act without state, checker, budget, and kill switch, keep it report-only.
- If a rule creates many legacy violations, add it with a scoped migration plan rather than abandoning it.
- If a custom rule is controversial, treat the PR changing the rule as the architecture discussion.
- If checks are flaky, quarantine or fix them quickly; flaky feedback destroys trust.
- If token/runtime costs are unclear, estimate first and lower cadence/scope before adding subagents.
- If humans cannot keep up with review, reduce loop parallelism; worktrees remove collisions, not review bandwidth limits.

## Bundled resources

- `scripts/audit_feedback_loop.py`: repo baseline scanner that reports likely level, existing guardrails, gaps, and next actions.
- `references/playbook.md`: compact implementation playbook and examples for common guardrails.
- `references/ci-guardrails.md`: CI setup patterns, required checks, least-privilege workflow policies, and CI anti-patterns.
- `references/design-guardrails.md`: software-design principles and red flags mapped to deterministic checks.
- `references/git-guardrails.md`: git hooks, branch protections, dangerous command denies, and agent git-safety instructions.
- `references/logging-guardrails.md`: wide-event logging philosophy, canonical log line structure, required fields, tail sampling, and what to enforce as checks.
