---
name: feedback-loop
description: Set up deterministic feedback loops for AI-assisted coding in a repository, based on the "Feedback Loop Is All You Need" approach. Use when the user asks to "setup feedback loop based on this blog", harden a repo for agents, add guardrails/linters/CI/custom rules/screenshot tests/observability-to-tasks, reduce AI code drift, or migrate CLAUDE.md/team conventions into enforceable checks.
---

# Feedback Loop

Turn repeated review comments and implicit architecture rules into deterministic checks agents can run and fix.

Core idea: instructions help; feedback loops enforce. Prefer boring signals that fail locally and in CI over prompts the agent may forget.

## Workflow

1. Inspect the repo:
   - Run `python3 <skill>/scripts/audit_feedback_loop.py <repo>` for a quick baseline.
   - Read package/build/test config, CI workflows, existing agent docs, and recent conventions.
2. Classify the current level:
   - **0 — Vibes**: no reliable CI/linters; humans review everything.
   - **1 — Guardrails**: standard linters + CI; architectural drift still gets through.
   - **2 — Architecture as Code**: custom rules encode team conventions.
   - **3 — Organism**: agent → rules → CI → observability → tasks → agent.
3. Pick the next smallest loop that catches real failures:
   - Start from repeated PR comments, recurring agent mistakes, TODOs in `CLAUDE.md`, or known migration rules.
   - Ask “Can this be a lint rule?” before adding prose instructions.
4. Implement guardrails in this order unless the repo clearly needs another sequence:
   - Existing formatter/linter/test command runs locally and in CI with zero warnings.
   - Strict type checking where applicable.
   - Complexity limits: function size, nesting, params, statements, cyclomatic/cognitive complexity.
   - Framework-appropriate plugins: bug-prevention, imports, accessibility, security, React/UI rules, etc.
   - Custom lint rules for project-specific conventions.
   - Smoke/e2e/screenshot tests for critical flows.
   - Observability issue intake that turns production/staging failures into tracked tasks.
5. Wire the agent loop:
   - Document exact commands in agent instructions (`CLAUDE.md`, `.github/copilot-instructions.md`, etc.).
   - Ensure CI runs the same commands.
   - Make commands fail hard (`--max-warnings=0`, nonzero exit on screenshots/security checks).
   - Add a safe scheduled/background-agent task only after checks exist.
6. Validate by intentionally creating one small violation and confirming local/CI checks catch it, then revert.

## What to build first

Prefer one concrete, high-signal rule over a large aspirational system.

Good first rules:
- Ban `console.log` in production code; require the project logger.
- Ban legacy design-system imports in migrated directories.
- Ban barrel-file imports or require approved import boundaries.
- Forbid magic spacing values outside design tokens.
- Limit complexity (`complexity`, `max-depth`, `max-lines-per-function`, `max-params`, `max-statements`).

For JavaScript/TypeScript repos, consider ESLint with strict TypeScript, SonarJS, unicorn, import boundaries, a11y, React hooks, Playwright, and screenshot/visual tests. For other stacks, map the same ideas to native tools: Ruff/mypy/pytest for Python, RuboCop for Ruby, clippy/rustfmt for Rust, golangci-lint for Go.

## Decision rules

- If a convention appears in prose and can be checked mechanically, encode it in a tool.
- If a bug reaches review twice, create a guardrail before fixing it a third time.
- If a rule creates many legacy violations, add it with a scoped migration plan rather than abandoning it.
- If a custom rule is controversial, treat the PR changing the rule as the architecture discussion.
- If checks are flaky, quarantine or fix them quickly; flaky feedback destroys trust.

## Bundled resources

- `scripts/audit_feedback_loop.py`: repo baseline scanner that reports likely level, existing guardrails, gaps, and next actions.
- `references/playbook.md`: compact implementation playbook and examples for common guardrails.
