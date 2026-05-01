---
name: project-knowledge
description: "Maintain a project-specific markdown knowledge base with structured intake, search, indexing, linting, and git-backed audit history. Use when feeding messy project information into durable knowledge, asking what the project knows about a topic, capturing decisions/questions/source material, organizing project context, or maintaining knowledge/ notes. Keywords: project knowledge, knowledge intake, decision log, question log, source note, markdown knowledge base, MOC, index, git audit."
compatibility: "Requires git and Python 3. No Python package dependencies; scripts use a constrained frontmatter format instead of PyYAML."
---

# Project Knowledge

Turn messy project information into a small, queryable, git-audited markdown knowledge base. Optimize for future answers, not document volume.

## Core Contract

The agent owns the knowledge work. Scripts only enforce bookkeeping: templates, search, indexes, and structural checks.

Default repository shape:

```txt
knowledge/
  sources/
  notes/
  decisions/
  questions/
  indexes/
```

V1 note types: `source`, `note`, `decision`, `question`, `index`.

Use small frontmatter only:

```yaml
---
id: note-YYYY-MM-DD-short-slug
type: note
title: Short title
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: active
tags: [tag-one, tag-two]
---
```

Links, sources, evidence, and relationships belong in body sections, not YAML.

## Mandatory Reads

- MANDATORY READ `references/knowledge-model.md` before creating, updating, linting, or indexing knowledge notes.
- MANDATORY READ `references/git-workflow.md` before modifying knowledge files or committing knowledge-system changes.
- MANDATORY READ `references/source-principles.md` when designing the knowledge base structure, evaluating documentation quality, or deciding what should survive from project work.

## Intake Behavior

Use active distillation with a clutter guardrail:

- Create one `source` note for substantial messy input that needs provenance.
- Extract durable `note`, `decision`, and `question` notes only when the content is likely to matter beyond the current exchange.
- Search existing notes before creating durable notes.
- Update only when the match is obvious; otherwise create a new note and link related material in the body.
- Report what was created, updated, ignored, and what still needs a human answer.

## Asking Behavior

The agent is the ask layer. Do not build or invoke a separate LLM-backed ask script.

When asked what the project knows:

1. Use `scripts/knowledge-search` to find candidate notes.
2. Read the most relevant files directly.
3. Answer with citations to note paths/IDs.
4. If the knowledge base is silent or ambiguous, say so and offer to create a `question` note.

## Script Use

Run scripts from the repository root containing `knowledge/`:

```bash
scripts/knowledge-new note "Checkout launch constraint" --tags checkout,launch
scripts/knowledge-search --type decision checkout
scripts/knowledge-index
scripts/knowledge-lint
```

Scripts are stdlib-only Python. They intentionally support constrained YAML frontmatter; do not use nested YAML, multiline YAML, or complex scalar syntax.

## Git Is the Audit Layer

For completed knowledge operations, auto-commit coherent changes unless a safety stop applies.

Normal intake commit boundary:

```txt
knowledge/**
```

Knowledge-system implementation commit boundary:

```txt
knowledge/**
scripts/knowledge-*
assets/templates/**
hk.pkl
```

Safety stops: unrelated user changes, lint failure, destructive/ambiguous edits, or user says not to commit.

## NEVER

- **NEVER dump all raw input into durable notes.**
  **Instead:** Preserve substantial messy input as `source`; extract only reusable decisions, questions, and notes.
  **Why:** A knowledge base that stores everything answers nothing.

- **NEVER silently merge related-but-different claims.**
  **Instead:** Create a separate note and link it, or mark a merge question.
  **Why:** Incorrect merges erase provenance and make future answers look more certain than they are.

- **NEVER put rich relationships in YAML.**
  **Instead:** Use body sections like `## Evidence`, `## Related`, and `## Extracted Items`.
  **Why:** Frontmatter is for filtering; body links are readable, reviewable, and easier for agents to maintain.

- **NEVER rely on scripts for semantic judgment.**
  **Instead:** Use scripts for mechanical consistency, then read and reason over the notes.
  **Why:** Importance, duplication, supersession, and answer quality are contextual decisions.

- **NEVER auto-commit unrelated project files.**
  **Instead:** Stage only the allowed knowledge-system paths and stop when other changes are present.
  **Why:** Git history is the safety/audit layer; mixed commits destroy that value.

- **NEVER add PyYAML or other dependencies casually.**
  **Instead:** Keep v1 stdlib-only; if richer YAML becomes necessary, use pinned `uv`/PEP 723 metadata with a documented fallback.
  **Why:** Skill scripts must remain portable across agent environments.
