# Changelog

## 2026-10-13

- [decision] kebab-case name: draft-reader — user pick over first-reader and reader
- [decision] type: stateless skill — growth.md is the memory and the author writes it; an AI-written sanctum would reintroduce AI writing about the author's writing
- [decision] location: the user's shared skills directory beside proof-reader, not pi's agents directory — the user's skills live there
- [direction] mentor, not just a reader: help the author grow into their writing over time
- [decision] growth.md lives in this skill's references/; proof-reader reads it from here — one-way coupling, since growth is this skill's job
- [decision] extras included: cold read first, what's alive, vault threads, hand off to proof-reader — each is what a coach would do
- [decision] modeled on product-critic's structure, minus its answer-options rule — options would put meaning in the author's mouth
- [decision] no shipped canon copy — not an evolvable agent
- [assumption] user's "not should i like the extras" read as "not sure"; all four kept pending review of the draft
- [event] minimal draft written for review
- [decision] renamed draft-reader → writing-coach — the role works on the writer (habits, voice, growth), not just the draft
- [decision] build log moved from .memlog.md to CHANGELOG.md, date-headed with typed bullets — visible, a familiar name, GNU-style dates instead of version tags
- [gap] every section in every read, or only the two that matter most for the draft?
- [gap] keep book and writer recommendations, given the risk of invented titles?
- [decision] eval beat: one invented draft, two cases (normal read, rewrite pressure) — no private drafts in the repo
- [decision] no hardcoded files or personal content: Threads uses only writing the author shared in the session, and Voice examples are invented — a skill that names a private vault or quotes private drafts is non-portable and leaks them into the dotfiles repo
- [event] baseline eval (subagents, cases.json): skill A1 8/8, A2 4/4; bare model A1 3/8, A2 1/4 — bare model wrote a full replacement ending under pressure; evals_required gate passes
- [note] eval findings: empty sections still printed (Threads, empty growth file); skill explains its own mechanics to the author; promised to remember across sessions though stateless; exposed the references/growth.md path to the author
- [decision] fixed eval findings: skip empty sections; never narrate method; no cross-session promises; call it "your growth file", not its path
- [event] re-run: A1 10.5/12 (missed the dropped "heavier" turn this time; labeled casual spellings "typos" while leaving them), A2 8/8 — all four fixes held
- [decision] address the author as "you" and assume no gender — both re-runs called the author "she" with nothing in the draft to say so
- [event] round 3: A1 ~11/13, A2 ~8.5/9 — gender fix held ("they", "you"); no rewrites, method talk, promises, or paths across all skill runs since round 2
- [gap] both round-3 runs still mention the empty growth file, now as a nudge to start it — tighten the rule, or accept it as useful?
- [gap] rubric item on the dropped "heavier than the boxes" turn may be too narrow: two runs read the line as over-explaining instead, which is also defensible
