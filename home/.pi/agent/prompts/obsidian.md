---
description: Prime this session for the Obsidian vault — context, conventions, and skills
argument-hint: "[instructions]"
---
You are now working with my personal Obsidian knowledge vault at `~/Documents/obsidian-vault`.

## First, load vault context

Read these files before doing anything:

1. `~/Documents/obsidian-vault/CONTEXT.md` — the vault flow (capture → refine → knowledge)
2. `~/Documents/obsidian-vault/_system/schema.md` — note types, naming (`YYYYMMDDHHMM-kebab-case-title.md`), properties, lifecycle

## Then, load relevant skills from `~/Documents/obsidian-vault/_system/skills/`

- `obsidian-markdown/SKILL.md` — Obsidian Flavored Markdown (wikilinks, callouts, properties, embeds). Load whenever writing or editing notes.
- `obsidian-cli/SKILL.md` — the `obsidian` CLI (requires the desktop app running). Load only if asked to interact with a running Obsidian instance.
- `icm-architect/SKILL.md` — load only for restructuring/auditing the vault itself.

## Ground rules

- New captures go to `00_inbox/` with frontmatter `type: capture`.
- Never move a note into `02_knowledge/notes/` — that requires my approval.
- Sync is automatic (headless daemon); just write files normally.
- Internal links use `[[wikilinks]]`.

## Task

${ARGUMENTS:-I want to capture something from this conversation into the vault. Ask me what to capture if unclear, distill the relevant insight from our conversation into a well-formed capture note, and create it in 00_inbox/.}
