# Interrogate

Spawn N independent reviewers on the same model, each in a fresh context with a distinct lens, to adversarially review code changes. The adversarial signal comes from independent fresh contexts and genuinely different review questions, not reviewer count. The deliverable is a synthesized verdict. Do NOT auto-apply changes.

## Step 1, Scope

Identify what to review from context:

- If the user points at specific files or a diff, use that.
- If on a feature branch, run `git diff main...HEAD` (or the appropriate base branch) for the full changeset.
- If the user's message references recent work, gather the relevant files.

Package the diff or file contents with any surrounding context files the reviewers need to understand the code.

## Step 2, Intent

Before spawning reviewers, state the intent in one clear paragraph from the user's message, commit messages, the PR description if one exists, and the code. If you're unsure about the intent, ask the user before proceeding. Under `task`, state your best reading of the intent as an assumption and proceed.

## Step 3, Spawn Reviewers

Launch all reviewers in a single message as read-only subagents when subagent dispatch is available; otherwise run them as sequential fresh inline passes. Default to three reviewers on the same model, one per lens:

- **Correctness** — bugs, edge cases, error handling, state and concurrency, idempotency, security.
- **Behavior** — does the change, called through its public surface the way users call it, do what the intent states; behavior tests, integration paths, verification gaps.
- **Slop** — agent-tell bloat: speculative generality, dead code, comments doing the architecture's job, missed dramatic simplifications.

Add a lens (and a reviewer) when the change calls for it; keep every lens distinct.

Read [assets/reviewer-prompt.md](../assets/reviewer-prompt.md) and fill in the same template for every reviewer with the stated intent, the diff or file contents, the checks in [interrogate/rubric.md](interrogate/rubric.md), naming the reviewer's lens as its primary emphasis.

## Step 4, Synthesize

As results come back, build a unified picture. Parse every reviewer's findings. Merge findings that describe the same issue differently, and note which reviewers raised each one. Findings two or more reviewers raised independently are the highest signal. Read a lone reviewer's finding, but weight it accordingly. Note disagreements. If one reviewer flags something and another explicitly says the opposite, that is context for the verdict.

## Step 5, Lead Judgment

You are the lead reviewer, a pragmatic senior engineer, not a neutral aggregator. Read [interrogate/lead-judgment.md](interrogate/lead-judgment.md) for the full framework. Put every finding in one of four buckets, with the reviewer(s) that raised it and a one-line rationale.

- **Act on**. Real issues affecting correctness, security, or maintainability given the actual goals. They would block a real PR.
- **Consider**. Legitimate, but you're not sure they outweigh the cost of addressing them now. Worth the user's attention.
- **Noted**. Technically valid but not actionable. Context-dependent, premature optimization, or low-impact at this stage.
- **Dismissed**. Wrong, nitpicky, or missing context, with a brief reason.

## Output Format

### Intent
> [The stated intent paragraph from Step 2]

### Reviewers
- Reviewer [lens]: [N findings] (one bullet per reviewer)

### Act On
[Each: description, which reviewers raised it, why it matters.]

### Consider
[Each: description, which reviewers raised it, the tradeoff.]

### Noted
[Brief list.]

### Dismissed
[Each with a brief rationale.]

### Agreement Map
[Where reviewers agreed and diverged, and what that pattern tells us.]
