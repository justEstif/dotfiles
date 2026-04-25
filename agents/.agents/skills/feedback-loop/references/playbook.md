# Feedback Loop Playbook

## Baseline checklist

- Local commands: install, format, lint, typecheck, test, e2e documented and runnable.
- Git safety: pre-commit/pre-push hooks, branch protection, no direct pushes to production branches, no agent force-pushes; see `git-guardrails.md`.
- CI: runs the same commands as local; fails on warnings; uses least-privilege permissions and protected-branch required checks; see `ci-guardrails.md`.
- Complexity: hard caps on function length, depth, params, statements, cyclomatic/cognitive complexity.
- Design quality: checks target cognitive load, change amplification, and unknown unknowns; see `design-guardrails.md`.
- Architecture: enforce import boundaries, information hiding, design-system rules, logging, data access, and migration constraints.
- Visual behavior: screenshot/visual tests for the top critical pages or flows.
- Runtime feedback: Sentry/Datadog/log alerts create tasks with enough context for an agent to act.
- Agent docs: explain why rules exist and list exact verification commands.

## JS/TS implementation sketch

Use existing project conventions first. If missing, propose minimal additions:

```bash
npm install -D eslint prettier typescript eslint-plugin-sonarjs eslint-plugin-unicorn eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks @playwright/test
```

Useful ESLint settings for complexity and overexposed interfaces:

```js
{
  rules: {
    complexity: ["error", 10],
    "max-depth": ["error", 3],
    "max-lines-per-function": ["error", { max: 40, skipBlankLines: true, skipComments: true }],
    "max-params": ["error", 4],
    "max-statements": ["error", 20],
    "no-console": ["error", { allow: ["warn", "error"] }],
    "sonarjs/cognitive-complexity": ["error", 12]
  }
}
```

Run with:

```bash
eslint . --max-warnings=0
```

## Custom rule pattern

Use design principles to choose rules: deep modules, information hiding, consistency, obviousness, and pulling complexity downward. Avoid red flags: shallow modules, pass-through methods/variables, information leakage, temporal decomposition, overexposed configuration, conjoined methods, special-general mixtures, repetition, non-obvious code, and vague naming.

Turn this repeated review comment:

> Do not import Ant Design in migrated shadcn pages.

Into a deterministic check:

1. Identify forbidden import sources and allowed paths.
2. Write a lint rule or use `no-restricted-imports` if enough.
3. Add one failing test/fixture for the forbidden pattern.
4. Add one passing test/fixture for the approved pattern.
5. Run it locally and in CI.
6. Add one sentence to agent docs explaining the rule and approved alternative.

Prefer built-in restriction mechanisms before writing custom AST code. When the rule targets design quality, document the complexity symptom it prevents: cognitive load, change amplification, or unknown unknowns.

## Git safety pattern

Before trusting agents with commits or scheduled/background work:

1. Add branch protection/rulesets in GitHub/GitLab for `main`, `master`, `prod`, `production`, and release branches.
2. Require PRs and passing checks before merge.
3. Disallow force pushes and branch deletion on protected branches.
4. Add tracked pre-commit hooks for formatting/linting/secret scanning.
5. Add pre-push hooks that block protected branches and run the local gate.
6. Add agent docs that forbid force-push, direct-to-main push, `reset --hard`, and `clean -fdx` without explicit approval.

Hooks can be bypassed, so mirror critical policy in remote branch protection and CI.

## CI pattern

A good first CI job has no secrets, uses read-only permissions, and runs on pull requests:

```yaml
name: verify
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run format:check
      - run: npm run lint -- --max-warnings=0
      - run: npm run typecheck
      - run: npm test
```

Adapt to the repo package manager and stack. Prefer a single `check` command that CI, hooks, and agents all run. For deployment, sensitive paths, matrix builds, and PR security rules, read `ci-guardrails.md`.

## Screenshot/e2e starting point

Pick three flows users would notice immediately:

- Landing or dashboard page renders correctly.
- Main create/edit flow works.
- Auth or checkout-critical path works.

For Playwright, add screenshots only after stabilizing data, viewport, timezone, animations, and fonts. Flaky screenshots should be fixed before expanding coverage.

## Observability-to-task loop

For Level 3, ensure alerts include:

- Error message and stack/trace ID.
- Environment and release/commit SHA.
- URL/route/job name/user action.
- Recent deploy link.
- Reproduction hints or log query.

Create tasks/issues automatically only for actionable, deduplicated failures; otherwise send summaries for human triage.
