---
# dotfiles-fgjr
title: Configure Strict ESLint Rules for AI Agents
status: completed
type: task
priority: normal
created_at: 2026-04-18T01:56:02Z
updated_at: 2026-04-18T02:01:36Z
---

Implement the strict ESLint constraints and plugins recommended in 'Feedback Loop Is All You Need' to provide deterministic feedback to AI coding agents.

The article strongly recommends using strict ESLint rules to constrain AI agents, rather than relying solely on prompting/CLAUDE.md.

Key recommendations:
1. **Strict Complexity Limits**:
   - `complexity` (caps cyclomatic complexity, e.g., `complexity: 10`)
   - `max-depth` (limits nesting, e.g., `max-depth: 3`)
   - `max-lines-per-function` (forces decomposition, e.g., `max-lines-per-function: 40`)
   - `max-params` (keeps interfaces narrow)
   - `max-statements` (stops functions from doing too much)
2. **SonarJS Plugin**:
   - Use for `cognitive-complexity` (smarter about nested conditionals) and bulk-eliminating bug classes.
3. **Other Plugins**:
   - `unicorn`
   - `perfectionist`
4. **General Practices**:
   - Run with `--max-warnings=0` to force agents to fix issues instead of ignoring warnings.
   - Use Strict TypeScript.
   - Enforce opinionated React constraints (if using React) to prevent "creative" patterns.
   - Forbid things like `console.log` in production via custom rules.

The philosophy is: "CLAUDE.md explains the why... A lint rule makes sure it can't get it wrong. If you can only have one — take the linter."

\n\nCreated an isolated NPM package `eslint-config-agent-strict` within `~/dotfiles` containing all the recommended rules and limits. This is ready to be published to the NPM registry to be used globally.
