# CI Guardrails for Agent Workflows

CI is the remote source of truth for agent work. Local hooks improve speed, but CI must enforce every rule that protects shared branches, releases, credentials, and production.

## Minimum CI contract

Every repo should expose one local command and run the same command in CI:

```bash
npm run check      # JS/TS example
make check         # language-neutral example
just check         # justfile example
```

The command should usually include:

1. Dependency/install integrity check.
2. Format check, not auto-format.
3. Lint with zero warnings.
4. Strict typecheck or compile.
5. Unit tests.
6. Build/package.
7. Secret scan.
8. E2E/screenshot/security checks when applicable.

## CI policies for agents

- Run on every pull request and push to protected branches.
- Require CI success before merge.
- Use branch protection/rulesets so CI cannot be bypassed by agents.
- Use least-privilege tokens; default `GITHUB_TOKEN` permissions to read-only and grant write only per job.
- Never expose production secrets to pull-request jobs, especially from forks.
- Separate verification from deployment. Deploy jobs should require environments, approvals, or protected branches.
- Pin or trust GitHub Actions carefully; avoid random third-party actions in privileged jobs.
- Use concurrency groups to cancel stale runs but never cancel production deploys mid-flight without intent.
- Upload artifacts: test reports, coverage, screenshots, traces, build output, and lint reports.
- Make failures actionable: logs should tell an agent exactly which command failed and where artifacts are.

## GitHub Actions baseline

```yaml
name: check

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: check-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  check:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run check
```

If the repo lacks a single gate, create one rather than duplicating command lists across local docs, hooks, and CI.

## Matrix only after the baseline works

Add matrix builds when compatibility matters:

```yaml
strategy:
  fail-fast: false
  matrix:
    node-version: [20, 22]
```

Avoid expensive matrices before the core loop is trusted. Agents need fast feedback first.

## Required checks by risk

| Risk | CI guardrail |
| --- | --- |
| Agent submits code that only works locally | clean install, build, tests in fresh runner |
| Agent ignores formatter/linter | format check + lint with zero warnings |
| Agent weakens types | strict typecheck and compile as required checks |
| Agent commits secrets | secret scanning in PR and push CI; GitHub push protection if available |
| Agent breaks UI visually | Playwright/Chromatic/screenshot artifacts |
| Agent changes migrations/schema unsafely | migration dry-run against disposable DB; require reviewer for schema paths |
| Agent touches sensitive code | CODEOWNERS + required review + path-filtered extra tests |
| Agent opens huge risky PR | size/changed-files check; label or fail above threshold unless approved |
| Agent changes CI/deploy config | required human review for `.github/workflows`, deploy scripts, IaC |
| Agent bypasses release process | deployment environments with required reviewers |

## Path-sensitive checks

Use path filters to add stricter checks only when relevant:

- DB migrations → migration dry-run, rollback check, schema diff artifact.
- Infrastructure/Terraform → `fmt`, `validate`, `plan` artifact, no auto-apply from PR.
- Auth/security code → SAST, dependency audit, CODEOWNERS.
- UI components/pages → screenshot/e2e tests.
- Package/dependency files → lockfile consistency, vulnerability audit, license check.
- Agent/tool config → human review and permission audit.

## CI anti-patterns

Avoid:

- CI that runs different commands than local development.
- Warning-only checks for rules you care about.
- `continue-on-error` for required quality/security gates.
- Deployment from pull-request workflows.
- Production secrets available to untrusted code.
- Auto-merge without required checks and branch protection.
- Slow monolithic pipelines that agents cannot iterate against.
- Flaky tests left in the required path without quarantine or fix.

## Agent doc snippet

```markdown
## CI expectations

- Run the local gate before handing work back: `<repo check command>`.
- CI runs the same gate and is the source of truth for merge readiness.
- Do not weaken, skip, or delete CI checks to make a PR pass.
- Do not add `continue-on-error` to quality/security jobs without explicit approval.
- Do not expose secrets to PR workflows or add deployment from PR workflows.
- If CI fails, inspect the failing job and artifacts, fix the root cause, and rerun.
```
