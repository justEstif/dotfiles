---
name: writing
description: "The 5 pstack writing skills (poteto, MIT) as reference files. Load when a trigger matches: cutting AI tells from agent-written text — AI vocabulary, filler, hedging, vague attribution, chatbot phrases, sycophancy, em dashes, 'not just X but Y' (unslop); writing docs, RFCs, readmes, PR descriptions, or commit messages, or reviewing agent-written ones — Diátaxis structure, Google developer style, STE rules, Global English (technical-writing); restating the last message in plain human language with no jargon (bro); auditing comments, commented-out code, and lint or TypeScript suppressions in a diff — delete dead comments, fix root causes, encode claimed constraints (no-comments, running Comment Sicko); reading or editing any .ts or .tsx file — discriminated unions, branded types, boundary validation, no `as` casts (typescript-best-practices)."
source: https://github.com/cursor/plugins/tree/main/pstack
license: MIT (pstack, by poteto)
---

# Writing

The pstack writing skills by poteto (MIT), ported from the Cursor pstack plugin into `references/`. Bodies are the source skills' text; only Cursor machinery was adapted. Read the matched reference, not all of them.

| member | reference | trigger |
| --- | --- | --- |
| unslop | references/unslop.md | Cut AI tells from agent-written text. Rule numbers are stable ids; other skills cite them. |
| technical-writing | references/technical-writing.md | Write docs, RFCs, readmes, PR descriptions, commit messages; review agent-written ones. |
| bro | references/bro.md | Restate the last message in plain human language, no jargon. |
| no-comments | references/no-comments.md | Audit comments and suppressions in a scope; runs references/comment-sicko.md. |
| typescript-best-practices | references/typescript-best-practices.md | Read or edit any .ts or .tsx file; examples in references/typescript-best-practices/patterns.md. |

## Bundle rules

- **unslop rule ids are stable.** Other skills cite rules by number. Never renumber; a removed rule leaves a gap.
- **unslop vs `proof-reader`:** the local `proof-reader` skill reviews human-authored prose; unslop edits agent output. Different jobs; don't merge.
- **The user's prose is theirs.** No member rewrites text the user wrote, including inside a diff or a doc under review. It goes to `proof-reader`, which flags and asks.
- **technical-writing vs `documenter`:** the local `documenter` skill generates project docs; technical-writing is the standard they are held to. Apply both.
- **no-comments runs Comment Sicko** as a read-only subagent if one is available, else as a fresh self-pass in a clean context. Comment Sicko reports only; the no-comments driver accepts or rejects findings and implements fixes.
- **typescript-best-practices defers to the [type-system-discipline](../principles/references/type-system-discipline.md) principle first.**
