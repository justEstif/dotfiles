---
source: https://github.com/cursor/plugins/tree/main/pstack/skills/why
license: MIT (pstack, by poteto)
---

# Why

Investigate the motivation and intent behind code. The companion [how](how.md) skill answers what the code does and how it works. `why` answers what forces led to its shape.

Investigators and the synthesizer are pi subagents when dispatch is available, otherwise sequential inline passes, one per role, each in a fresh context. Investigators never write anything. The synthesizer may read the repo to spot-check citations but changes nothing.

## Operating Posture

Operate as a **careful, cautious, and precise investigator**. Be honest about what you know vs what you're inferring. Read [why/epistemics.md](why/epistemics.md) for the full confidence framework and phrasing guide. The synthesizer must follow it.

## Step 1. Understand the Target and the Question

The **target** is usually a chunk of code, a pattern, a feature, or a named design decision. The **question** is usually a design rationale, a tradeoff, a motivating edge case, an external constraint, dead code, or a broad history sweep.

If the target is vague ("why do we do it this way?" with no clear referent), make your best guess from conversation context (open files, recent edits, what was just discussed). State your interpretation briefly so the user can redirect if you're off, then proceed.

## Step 2. Establish the Code Anchor

Before spawning investigators, build the seed context inline: file paths and line ranges, key symbols (functions, classes, constants), the last few commits touching the target, PR numbers from merge commits (pattern `(#1234)` in the subject line), and any linked ticket IDs. Run `git blame -L <start>,<end> <file>` for last-touch commits, `git log --follow -p -- <file>` for full history with patches through renames, `git log --oneline -20 -- <file>` for recent commits with PR numbers visible, and `git log -1 --format=%B <commit>` to extract PR numbers. Then pull the PR bodies and discussion for any substantive commit: `gh pr view <number> --json title,body,author,createdAt,mergedAt,labels,closingIssuesReferences,comments,reviews`. This anchor goes to every investigator and to the synthesizer.

## Step 3. Spawn Parallel Investigators

**Default to the full parallel investigation.** The goal is a complete coverage map, not a minimal one. Document the null, don't skip the search.

### Discovery

Before spawning investigators, enumerate the evidence actually available in this environment:

1. **Source control history** — `git` and `gh`: commits, PRs, reviews, GitHub Issues and Discussions on GitHub-hosted repos. Always available.
2. **Session transcripts** — pi session storage (`~/.pi/agent/sessions/`) and the `session_search` tool: this agent's own prior deliberation on the code — earlier hypotheses, decisions, and reversals.
3. **The web** — the local `web` CLI skill: public evidence such as incident postmortems, upstream issues and changelogs, published design docs and RFCs.
4. **In-repo long-form docs** — ADRs, design docs, RFC files, READMEs.

Map each available source to one evidence category from the roster below. Categories with no local source are gaps, not choices: record them in the coverage map.

Spawn one investigator per available source, all in a single message so they run concurrently (or one sequential inline pass per source when subagents aren't available), each owning exactly one source. Don't ask one investigator to cover two sources.

Each investigator's brief carries the code anchor, the user's original question, and this discipline:

- Go deep on your assigned source only. Follow links within your source (the PR a commit references, the parent ticket, the linked doc). Do not chase cross-source references; record them as leads.
- **Quote verbatim**, with the exact location (PR number, ticket ID, URL, commit hash, file:line). One verbatim quote with a precise citation is worth more than a paragraph of summary.
- **Record what you searched, not just what you found.** Write queries verbatim. An empty search is a finding.
- **Mechanics are not motivation.** A commit changing `limit = 50` to `limit = 100` shows the change, not why. No intent from code behavior or style; claim intent only where an author stated it.
- **Gather, don't conclude.** Don't answer the question, form a final opinion on "the why", or pick sides in contradictions. If two items disagree, record both. The synthesizer does the reasoning.
- **Never invent.** Label partial findings partial.
- Return: **Source** / **What I Searched** / **Direct Evidence Found** (verbatim quote or accurate paraphrase, location, author and date, one-sentence relevance) / **Indirect / Circumstantial Evidence** (what it is, where it's from, what it suggests, alternative readings) / **Contradictions** / **Gaps** / **Additional Leads**.

If the target code looks defensive (null checks, retry logic, timeout handling, rate limiting, feature flags, egress guards, OOM handlers), each investigator also runs incident-flavored queries inside its own source.

### Investigator roster, one per available evidence category

Each category below is uniquely positioned to surface one shape of "why", shown after "Best at". Use it to know what to expect back, to name a gap when a category returns empty, and, only in the rare provably-irrelevant case, to justify a skip.

1. **Source control** (git history, `gh` for PRs and issues, code comments, tests). Always spawn, the only guaranteed source. Best at *implementation-time rationale captured during review*.
2. **Issue / ticket tracker** (GitHub Issues or Projects via `gh` when the repo is hosted there). Best at *the product or business forcing function*. Strongest when the why is external to engineering. Otherwise a gap.
3. **Long-form documents** (in-repo ADRs, design docs, RFCs; published docs via the `web` skill). Best at *long-form design rationale*, written out before it becomes code.
4. **Real-time team chat**. Best at *real-time deliberation that never reached a doc*. Locally, pi session transcripts cover the agent's own deliberation; human team chat is usually not searchable. State it as a gap.
5. **Infrastructure observability**. Best at *infrastructure and runtime reality that motivated the code*. Strongest when the target reacts to an infra signal (timeouts, retries, rate limits, circuit breakers). Sometimes reachable through published incident postmortems via the `web` skill; otherwise a gap.
6. **Error / exception tracking**. Best at *the specific exceptions and error trajectories that motivated defensive or corrective code*. Strongest for catch blocks, null guards, type checks, retries, and other defenses. Public postmortems via `web` when they exist; otherwise a gap.
7. **Product analytics warehouse**. Best at *product and data reality that shaped the code*. Strongest for flag-gated code, experiment-driven ships, data migrations, and "where did this number come from" questions. Almost always a gap locally; say so.

### When to skip an investigator

Only with an **explicit, written justification** that goes in the final Sources Consulted. Two valid reasons:

- **No local source is available** for that category in this environment. Flag it as a gap, not a choice: "Real-time team chat skipped. No searchable conversational record, so team deliberation was not searchable."
- **The source is provably irrelevant**, not just "probably irrelevant." A high bar: "Error / exception tracking skipped. Target is a build-time script with no runtime code path."

If your scope assessment suggests a single-commit trivial target where the PR description already contains the complete answer, you may answer inline **only after** confirming every other available category search would be redundant. Say so explicitly. This should be rare.

## Step 4. Synthesize

Spawn one synthesizer (or run one final fresh inline pass). It gets:
1. The investigator findings, including any null results and any categories skipped with justification
2. The code anchor
3. The user's original question
4. The epistemics framework from [why/epistemics.md](why/epistemics.md)

The synthesizer weighs the evidence itself (investigators gathered raw evidence, not conclusions), merges overlapping citations into one authoritative reference, surfaces every contradiction instead of picking one, calibrates each claim to its confidence tier, and spot-checks any citation it doubts by reading the repo. It does not write files, commit, or modify anything.

## Step 5. Present

Present the synthesizer's output to the user. You may lightly edit for clarity or add context from the conversation, but **do not rewrite the confidence language**.

## Output Format

The structure: **The Question**, **The Code in Question**, **What We Found** (each claim tagged `[Direct]` or `[Supported]`, with a citation: PR #, ticket ID, URL, commit hash, or file:line), **What We Can Reasonably Infer** (each with its inference chain visible and hedged language: "appears to", "likely", "suggests", "is consistent with"), **Competing Hypotheses** (evidence for and evidence against or missing, per hypothesis), **What We Don't Know** (specific gaps: the question, the sources searched, what was searched for in each, what was found), **Sources Consulted**, **Confidence Summary**. Adapt as needed, but keep the confidence separation intact, and keep Sources Consulted as one line per investigator, including the ones that returned nothing or were skipped, with the reason.

Never cite code as evidence for its own intent. A hypothesis embedded in the user's question ("I assume it's for performance?") is a candidate, not a conclusion; check it against the evidence independently.

After Sources Consulted, if the user's `why` question is a precursor to changing this code, convert the lineage findings into a Preserve / Change / Avoid / Risk constraint set for planning the change.

## Common Failure Modes to Avoid

- **Recency bias**. Assuming the most recent commit is authoritative. The current shape is often the accretion of many earlier decisions. Trace back.
