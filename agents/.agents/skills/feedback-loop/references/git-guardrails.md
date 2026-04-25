# Git Guardrails for Agent Workflows

Agent failure stories commonly involve force-pushing over teammates' work, pushing straight to main, committing secrets, running destructive reset/clean commands, or mixing production credentials with local automation. Treat git and deployment paths as high-risk interfaces.

## Minimum guardrails

- Protect `main`, `master`, `prod`, `production`, `release/*`, and deployment branches in the forge:
  - Require PRs, review, and passing checks.
  - Disallow force pushes and deletions.
  - Require linear history if the team prefers it.
  - Require signed commits/tags where practical.
- Install local hooks via a tracked hook manager (`pre-commit`, Husky, Lefthook, Overcommit, lefthook, or native `core.hooksPath`).
- Add pre-commit checks for formatting, linting, typecheck where fast, secret scanning, and generated-file consistency.
- Add pre-push checks for the full local gate or at least lint/typecheck/tests plus branch safety.
- Configure agent tool permissions to block or ask before dangerous git commands.
- Keep production deploy permissions separate from coding-agent credentials.

## Commands agents should not run without explicit approval

Block or require confirmation for:

```text
git push --force
git push --force-with-lease
git push origin main
git push origin master
git push origin prod
git push origin production
git reset --hard
git clean -fd
git clean -fdx
git branch -D
git tag -d
git push --delete
git rebase -i
rm -rf .git
```

Prefer `--force-with-lease` over `--force` only for human-approved branch rewrites; agents should not rewrite shared history by default.

## Hook patterns

### Pre-commit

Use for fast checks that prevent bad commits:

- Secret scan (`gitleaks`, `detect-secrets`, `trufflehog filesystem`).
- Format/check staged files.
- Lint staged files.
- Reject `.env`, private keys, certificates, tokens, local MCP config, and production credentials.
- Reject conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
- Reject debug statements or temporary files.

### Pre-push

Use for slower safety gates:

- Reject direct pushes to protected branches.
- Reject force pushes from agent contexts.
- Run the repo's full gate (`npm run check`, `make check`, `pytest`, etc.).
- Verify branch is up to date with remote before pushing.
- Run secret scanning over pushed commits, not just staged files.

Example native pre-push logic:

```sh
branch="$(git symbolic-ref --short HEAD)"
case "$branch" in
  main|master|prod|production|release/*)
    echo "Direct pushes to $branch are blocked. Open a PR." >&2
    exit 1
    ;;
esac

case " $* " in
  *" --force "*|*" --force-with-lease "*)
    echo "Force pushes require explicit human approval." >&2
    exit 1
    ;;
esac
```

Hooks are advisory because users can bypass them with `--no-verify`. Enforce critical rules in the remote forge and CI too.

## GitHub/GitLab policy checks

- Enable branch protection/rulesets for protected branches.
- Require status checks matching local gates.
- Require conversation resolution and CODEOWNERS for sensitive areas.
- Restrict who can push to protected branches.
- Block force pushes and branch deletion.
- Enable secret scanning and push protection.
- Use environments with required reviewers for production deploys.
- Use short-lived, least-privilege tokens for agents.

## Agent instruction snippet

Add to agent docs:

```markdown
## Git safety

- Never push directly to `main`, `master`, `prod`, `production`, or `release/*`.
- Never use `git push --force`, `git reset --hard`, `git clean -fdx`, branch deletion, or tag deletion without explicit user approval in the current conversation.
- Before committing, run the pre-commit checks or repo gate.
- Before pushing, run the full local gate and push only the current feature branch.
- Do not commit secrets, `.env` files, private keys, local MCP configs, or production credentials.
- If git reports divergence or conflicts, stop and explain the situation instead of rewriting history.
```

## Incident patterns to guard against

- **Force-push overwrote shared work**: prevent with branch protection, no-force policy, and agent permission denies.
- **Direct push to production branch**: prevent with protected branches, pre-push hook, and PR-only rules.
- **Secrets committed by broad `git add .`**: prevent with secret scanning, denylisted paths, and staged-file review.
- **Destructive cleanup removed work**: prevent with command permission denies for `reset --hard`, `clean -fdx`, and recursive deletes.
- **Production database/cloud resource touched during coding task**: prevent with separate credentials, environment approvals, read-only default access, and explicit deploy/runbook steps.
- **Prompt injection through PR comments or repo files**: prevent by treating external text as untrusted, limiting tool permissions, and requiring human approval for privileged git/deploy operations.
