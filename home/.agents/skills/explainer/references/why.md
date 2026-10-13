# Why

Find the forces that shaped the code: rationale, tradeoffs, the edge case or external constraint behind it. [how](how.md) covers what it does. Read [why/epistemics.md](why/epistemics.md) before writing the answer.

## 1. Anchor

State your reading of the target and the question; the user can redirect. Then gather the seed context inline:

- `git blame -L <start>,<end> <file>` for last-touch commits.
- `git log --follow -p -- <file>` for history through renames; `git log --oneline -20 -- <file>` shows PR numbers like `(#1234)`.
- `gh pr view <number> --json title,body,comments,reviews,closingIssuesReferences` for the discussion behind substantive commits.

## 2. Investigate

Size the search to the question. A single commit whose PR states the reason needs nothing more. Otherwise send one read-only pi subagent per source that exists here (or one fresh inline pass each), all carrying the anchor:

- Source control: commits, PRs, reviews, issues via `gh`.
- In-repo docs: ADRs, design docs, READMEs.
- pi session transcripts under `~/.pi/agent/sessions/<slug>/`, searched with `rg`: the agent's own earlier reasoning.
- The web via the `web` skill: upstream issues, changelogs, postmortems.

Investigators quote verbatim with exact locations, record what they searched (an empty search is a finding), and gather without concluding.

## 3. Rules

- **Mechanics are not motivation.** A commit changing `limit = 50` to `100` shows the change, not why. Claim intent only where an author stated it.
- **Never cite code as evidence for its own intent.**
- **The user's guess is a candidate, not a conclusion.** Check "I assume it's for performance?" against the evidence like any other hypothesis.
- **Recency is not authority.** The current shape is often an accretion of older decisions. Trace back.

## 4. Answer

Sections: The Question; What We Found (each claim tagged `[Direct]` or `[Supported]` with a citation); What We Can Reasonably Infer (hedged, with the chain visible); Competing Hypotheses; What We Don't Know (what was searched, where); Sources Consulted. If the question precedes a change, end with a Preserve / Change / Avoid / Risk list for planning it.
