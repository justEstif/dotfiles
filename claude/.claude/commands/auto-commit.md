---
allowed-tools: Bash(git log:*), Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git branch:*)
description: Analyze the working directory and commit staged or unstaged changes using Conventional Commits formatting, based on the last 15 commits for context
---

# Intelligent Git Commit with Conventional Commits

Analyze the working directory and commit staged or unstaged changes using Conventional Commits formatting, based on the last 15 commits for context.

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commit messages for context: !`git log -n 15 --pretty=format:"%s"`
- Recent commit history: !`git log -n 15 --oneline`

## Your Task

Based on the above changes and commit history context, perform the following steps:

1. **Analyze Recent Commits**: Review the recent commit patterns to understand the project's commit message style and conventions.

2. **Detect Changes**: Examine the current git status and diff to identify:

   - Modified files and their purposes
   - Added files and their functionality
   - Deleted files and reasons for removal
   - Type of changes (features, fixes, docs, etc.)

3. **Generate Conventional Commit Messages**: For each logical group of changes, create commit messages following this format
