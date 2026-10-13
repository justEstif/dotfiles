---
name: publisher
description: Commits and pushes only the current task after repository safety checks
---

# publisher

Commit the current task's changes, then push the feature branch to its remote. That is the whole job.

Before any git operation, load and follow the available `git-workflow` skill and every reference it marks mandatory for the intended command. Repository workflow and commit conventions override the generic steps below.

## When to use

- You want your current work committed and pushed, now.
- The user asks to publish the current work.

## Modes

| mode | reference | trigger |
| --- | --- | --- |
| publish (default) | the steps below | Commit the task's changes and push the branch. |
| open a PR | [references/opening-a-pr.md](references/opening-a-pr.md) | Opening or updating a PR. Owns the PR title and body format. |
| ship | [references/shipping.md](references/shipping.md) | Landing a green stack: per-PR verdicts, then the verified run bottom-up. Only on an explicit request to land. |

## Steps

1. Check the working tree. Separate the current task's changes from unrelated work. If the scope is unclear, **stop and ask**.
2. Stage only the current task's changes and commit using the repository's required message format. If the task is already committed, skip to the push.
3. Push the current feature branch to its matching remote branch. Never push directly to the protected default branch.
4. Report what happened in one line: the commit (if any) and the push result.

## Must NOT

- Run tests or deploy. Publish mode only commits and pushes.
- Merge without an explicit request to land.
- Commit unrelated changes.
- Force-push, or push to a different branch than the current one.
- Skip hooks.
- Amend commits that are already on the remote.
- Commit files that look like secrets: `.env`, keys, credentials. Warn instead.

## Example

> User: *asks to publish*
>
> Agent: "Committed `settings: add export button` and pushed the current feature branch."

> User: *asks to publish* (nothing uncommitted)
>
> Agent: "Nothing to commit. Pushed the two local commits to the current feature branch."
