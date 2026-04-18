# eslint-config-agent-strict

An incredibly strict ESLint configuration designed specifically to put deterministic boundaries around autonomous coding agents (like Claude Code, Cursor, Devin, etc.).

Based on the philosophy from [Feedback Loop Is All You Need](https://zernie.com/blog/feedback-loop-is-all-you-need/).

> "CLAUDE.md explains the why and helps the agent get it right on the first try. A lint rule makes sure it can't get it wrong. Skills speed you up. Linters keep you honest. If you can only have one — take the linter."

## Why?

Agents write code faster than humans can review. If you do not put hard constraints on their output, they will generate code that compiles but is architecturally terrifying (e.g., 150-line functions with 6 levels of nesting). This config sets brutal complexity limits, forcing the agent to decompose, name things properly, and abstract away logic before CI will pass.

## Included Packages

- `eslint-plugin-sonarjs`: Eliminates entire bug classes before they start.
- `eslint-plugin-unicorn`: Opinionated, strict heuristics.
- `eslint-plugin-perfectionist`: Ends formatting/sorting debates.
- `typescript-eslint`: Strict types. If types are loose, agents find the cracks.

## Core Rules

* `max-lines-per-function`: 40
* `complexity`: 10
* `max-depth`: 3
* `max-params`: 4
* `max-statements`: 15
* `sonarjs/cognitive-complexity`: 15

## Usage

1. Install this package in your project:
   ```bash
   npm i -D eslint-config-agent-strict
   ```

2. Create your `eslint.config.js`:
   ```javascript
   import agentStrict from "eslint-config-agent-strict";

   export default [
     ...agentStrict,
     // Add your project-specific overrides here
   ];
   ```

3. Ensure you run your linter with `--max-warnings=0` in CI so the agent is forced to fix every issue.
