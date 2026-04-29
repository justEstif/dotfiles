---
name: github
description: "Interact with GitHub using the `gh` CLI. Use when working with GitHub issues, pull requests, CI runs, or API queries. Triggers on: PR review, issue search, workflow run, gh cli, github api, CI status."
---

# GitHub Skill

Use the `gh` CLI to interact with GitHub. Always specify `--repo owner/repo` when not in a git directory, or use URLs directly.

## Pull Requests

Check CI status on a PR:

```bash
gh pr checks 55 --repo owner/repo
```

List recent workflow runs:

```bash
gh run list --repo owner/repo --limit 10
```

View a run and see which steps failed:

```bash
gh run view <run-id> --repo owner/repo
```

View logs for failed steps only:

```bash
gh run view <run-id> --repo owner/repo --log-failed
```

## API for Advanced Queries

The `gh api` command is useful for accessing data not available through other subcommands.

Get PR with specific fields:

```bash
gh api repos/owner/repo/pulls/55 --jq '.title, .state, .user.login'
```

## JSON Output

Most commands support `--json` for structured output. You can use `--jq` to filter:

```bash
gh issue list --repo owner/repo --json number,title --jq '.[] | "\(.number): \(.title)"'
```

## NEVER

- **NEVER** run `gh` commands that mutate state (merge, close, delete) without user confirmation. **Why:** irreversible actions on shared repositories. **Instead:** show the command you would run and ask for approval.
- **NEVER** hardcode `--repo owner/repo` when already in a git directory. **Why:** unnecessary and error-prone if the repo changes. **Instead:** omit `--repo` and let `gh` infer from the current directory.
