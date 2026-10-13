---
name: writer
description: Holds agent-written prose to a standard — cuts AI tells, structures docs, PR bodies, and commit messages, and restates jargon plainly
---

# writer

The standard for prose the agent writes: replies, docs, RFCs, readmes, PR descriptions, commit messages. Pick the mode, read its reference, apply it while drafting.

## When to use

- Drafting any prose surface, including the reply to the user.
- Writing or reviewing docs, RFCs, readmes, PR descriptions, or commit messages.
- The user asks for the last message again in plain words.

## Modes

| mode | reference | trigger |
| --- | --- | --- |
| unslop | [references/unslop.md](references/unslop.md) | Cut AI tells: AI vocabulary, filler, hedging, vague attribution, chatbot phrases, sycophancy, em dashes, "not just X but Y". |
| technical | [references/technical-writing.md](references/technical-writing.md) | Docs, RFCs, readmes, PR bodies, commit messages: Diátaxis structure, Google developer style, Global English. |
| plain | [references/bro.md](references/bro.md) | Restate the last message in plain human language, no jargon. |

## Rules

- **Unslop rule ids are stable.** Other skills cite rules by number. Never renumber; a removed rule leaves a gap.
- **Agent prose only.** Text the user wrote stays as written, including inside a diff or a doc under review. It goes to `proof-reader`, which flags and asks.
- **`documenter` writes, this skill judges.** documenter generates project docs; technical mode is the standard they are held to.

## Must NOT

- Rewrite the user's prose.
- Run as a cleanup pass after drafting instead of while drafting. A late pass misses the patterns.
