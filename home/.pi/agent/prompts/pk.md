---
description: "Use project knowledge intentionally: search, capture, update, or synthesize with pk"
argument-hint: "<info|session|search|note|decision|question|source>"
argument-completions:
  $1:
    - value: info
      description: Show current directory, pk config, and available modes
    - value: session
      description: Load session-start project knowledge context
    - value: search
      description: Search existing project knowledge
    - value: note
      description: Capture stable synthesized knowledge
    - value: decision
      description: Capture a chosen direction and rationale
    - value: question
      description: Capture unresolved ambiguity
    - value: source
      description: Capture raw source material
---

Use the `pk` CLI intentionally for this request.

Requested mode/topic:

```text
$ARGUMENTS
```

If no mode is clear, ask me what I want to do before writing anything.

Modes:

- `info` — report the current working directory, pk knowledge directory/config, available pk projects if useful, and what `/pk` modes are available. Do not create or update knowledge.
- `session` — run `pk synthesize --session-start` and summarize relevant project context.
- `search <query>` — search existing knowledge before answering or changing anything.
- `note <title/topic>` — capture a stable synthesized fact. Search first.
- `decision <title/topic>` — capture a chosen direction and rationale. Search first.
- `question <title/topic>` — capture unresolved ambiguity. Search first.
- `source <title/topic>` — capture raw input/source material. Search first.

Rules:

1. Use the `pk` CLI for all knowledge operations.
2. If `pk` fails with "No pk project found", retry with:

   ```bash
   PK_KNOWLEDGE_DIR=/Users/ebeyene/.pk pk <command>
   ```

3. Never read or write knowledge files directly.
4. Before creating anything, run `pk search` for likely duplicates.
5. After writing, run `pk lint`.
6. Prefer asking me before creating or superseding knowledge unless I explicitly requested capture.
7. For raw meeting notes, transcripts, copied docs, or external material, create a `source`, not a `note`.
8. For stable synthesized facts, create a `note`.
9. For choices we made, create a `decision`.
10. For unresolved ambiguity, create a `question`.

When creating or updating pk entries, first read:

`/Users/ebeyene/dotfiles/pi/.pi/agent/prompts/pk/knowledge-model.md`
`/Users/ebeyene/dotfiles/pi/.pi/agent/prompts/pk/source-principles.md`

Use it as the source of truth for note types, statuses, required sections, frontmatter, intake triage, update policy, and lint policy.

For `info`, run lightweight read-only commands such as:

```bash
pwd
pk config
pk projects --pretty
```

If useful, also state the expected knowledge directory: `/Users/ebeyene/.pk`.

Proceed with the requested pk mode.
