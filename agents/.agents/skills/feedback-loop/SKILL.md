---
name: feedback-loop
description: Set up deterministic feedback loops for AI-assisted coding in a repository, based on the "Feedback Loop Is All You Need" approach and A Philosophy of Software Design principles. Use when the user asks to "setup feedback loop based on this blog", harden a repo for agents, add guardrails/linters/CI/custom rules/screenshot tests/observability-to-tasks, reduce AI code drift, migrate CLAUDE.md/team conventions into enforceable checks, encode software-design principles/red flags as repo checks, add CI gates, add git safety guardrails such as pre-commit/pre-push hooks, protected branches, and no-direct-push-to-main policies, or improve logging with structured wide events and canonical log lines.
---

# Feedback Loop

Turn repeated review comments, implicit architecture rules, and software-design principles into deterministic checks agents can run and fix.

Core idea: instructions help; feedback loops enforce. Prefer boring signals that fail locally and in CI over prompts the agent may forget. Use *A Philosophy of Software Design* as the design-quality lens: reduce cognitive load, change amplification, and unknown unknowns by encouraging deep modules, information hiding, obviousness, consistency, and strategic design investment.

## Workflow

1. Run the audit script to baseline the repo:
   `python3 ~/.agents/skills/feedback-loop/scripts/audit_feedback_loop.py <repo-root>`
   (If the skill is installed elsewhere, substitute the actual path to the `feedback-loop` skill directory.)
2. Classify the current level:
   - **0 - Vibes**: no reliable CI/linters; humans review everything.
   - **1 - Guardrails**: standard linters + CI; architectural drift still gets through.
   - **2 - Architecture as Code**: custom rules encode team conventions.
   - **3 - Organism**: agent → rules → CI → observability → tasks → agent.
3. Pick the next smallest loop that catches real failures. Prefer one concrete, high-signal rule over a large aspirational system:
   - Start from repeated PR comments, recurring agent mistakes, TODOs in `CLAUDE.md`, known migration rules, or design red flags.
   - Before adding any prose to `CLAUDE.md`, ask: *Can this fail deterministically?* If yes, it belongs in a check, not a document.
   - For design problems, ask which complexity symptom the rule prevents: cognitive load, change amplification, or unknown unknowns.
   - Good first rules: required CI check mirroring the local gate; block direct pushes to `main`/`master`/`prod`; secret scanning in pre-commit; ban `console.log` in favour of structured wide-event logger; ban legacy design-system imports in migrated directories; ban barrel-file imports or enforce approved import boundaries; forbid magic spacing values outside design tokens; complexity limits (`max-depth`, `max-lines-per-function`, `max-params`); import-boundary rules to prevent information leakage; flag wrapper-only modules that hide no complexity.
   - For JS/TS: ESLint with strict TypeScript, SonarJS, unicorn, import boundaries, a11y, React hooks, Playwright/screenshot tests. Other stacks: Ruff/mypy/pytest (Python), RuboCop (Ruby), clippy/rustfmt (Rust), golangci-lint (Go).
4. Implement guardrails in this order. Deviate only when a specific failure mode demands it — for example, skip straight to git safety if direct pushes to `main` are actively happening, or skip to secret scanning if credentials have leaked. Otherwise, the sequence exists because earlier layers make later ones cheaper:
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
5. Wire the agent loop:
   - Document exact commands in agent instructions (`CLAUDE.md`, `.github/copilot-instructions.md`, etc.).
   - Ensure CI runs the same commands.
   - Make commands fail hard (`--max-warnings=0`, nonzero exit on screenshots/security checks).
   - Add a safe scheduled/background-agent task only after checks exist.
6. Validate by intentionally creating one small violation and confirming local/CI checks catch it, then revert.

**MANDATORY READ `references/playbook.md`** for stack-specific examples before implementing any guardrail.

## NEVER

- **NEVER add a prose instruction when a lint rule is possible**
  **Instead:** Encode it as a check that runs on every commit.
  **Why:** Prose in `CLAUDE.md` is forgotten. A failing lint rule is not.

- **NEVER add a rule that generates 50+ legacy violations without a migration plan**
  **Instead:** Add it scoped to new files only (`overrides` / `exclude`), with a tracked migration task.
  **Why:** Teams disable noise rules immediately — the rule dies and takes trust with it.

- **NEVER let flaky checks persist**
  **Instead:** Quarantine or fix within one day of first flake.
  **Why:** One flaky check teaches agents (and humans) to re-run and ignore — the feedback loop collapses.

- **NEVER log strings when wide events are possible**
  **Instead:** Emit one structured event per request with all user/business/error context attached.
  **Why:** String logs are optimized for writing, not querying. Wide events let you answer "why did this premium user fail?" in one query instead of grep archaeology across 15 services.

- **NEVER skip the audit step**
  **Instead:** Run `audit_feedback_loop.py` first; know the current level before proposing changes.
  **Why:** Adding level-3 checks to a level-0 repo creates rejection and revert, not adoption.

- **NEVER delete a check because it's blocking someone right now**
  **Instead:** Quarantine it (disable in CI with a tracked task, not a comment) → fix the violation → re-enable. If the check is fundamentally wrong, change the rule via PR so the architecture discussion is explicit.
  **Why:** Deleting under pressure is how feedback loops die. The next agent sees no check and the violation spreads. Quarantine preserves intent while unblocking.

## Decision rules

- If a convention or design principle appears in prose and can be checked mechanically, encode it in a tool.
- If a bug or design red flag reaches review twice, create a guardrail before fixing it a third time.
- If a rule creates many legacy violations, add it with a scoped migration plan rather than abandoning it.
- If a custom rule is controversial, treat the PR changing the rule as the architecture discussion.
- If checks are flaky, quarantine or fix them quickly; flaky feedback destroys trust.

## Bundled resources

- `scripts/audit_feedback_loop.py`: repo baseline scanner that reports likely level, existing guardrails, gaps, and next actions.
- `references/playbook.md`: compact implementation playbook and examples for common guardrails.
- `references/ci-guardrails.md`: CI setup patterns, required checks, least-privilege workflow policies, and CI anti-patterns.
- `references/design-guardrails.md`: software-design principles and red flags mapped to deterministic checks.
- `references/git-guardrails.md`: git hooks, branch protections, dangerous command denies, and agent git-safety instructions.
- `references/logging-guardrails.md`: wide-event logging philosophy, canonical log line structure, required fields, tail sampling, and what to enforce as checks.
