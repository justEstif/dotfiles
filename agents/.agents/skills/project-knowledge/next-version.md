# project-knowledge: next version

## Why

Two real problems with v1:
- **Hard to share** — the only shareable unit is the whole repo; no way to produce a portable context dump
- **Weak search** — substring match, no ranking; agents can't tell which results matter

## What changes

### Replace Python scripts with a single Go CLI

`scripts/knowledge <subcommand>` — one binary, zero runtime dependency after build.

```
knowledge new <type> <title> [--tags tag1,tag2]
knowledge search <query>  [--type] [--status] [--tag] [--context] [--limit]
knowledge synthesize <query>  [--all] [--type] [--tag]
knowledge index
knowledge lint
knowledge config
```

**Why Go:** cross-compiles to a static binary, `modernc.org/sqlite` (pure Go, no CGo) gives
FTS5 BM25 search today with a clear upgrade path to hybrid later.

### Directory layout

```
project-knowledge/
  SKILL.md
  config.json               ← first-run preferences (auto_commit, etc.) — not in LLM context
  scripts/
    knowledge               ← platform-detection wrapper (bash)
    bin/
      knowledge-darwin-arm64
      knowledge-darwin-amd64
      knowledge-linux-amd64
      knowledge-linux-arm64
    src/                    ← Go source
      main.go
      cmd/
      internal/notes/
      internal/fts/
      internal/lint/
    Makefile
  references/               ← unchanged
  assets/templates/         ← templates embedded in binary; source kept here
```

Pre-built binaries checked in — no build step for consumers.

### New: `knowledge synthesize`

Produces a ranked, context-ready markdown block from matching notes.
This is the share primitive — paste into a chat, email, or another agent's context.

```markdown
# Knowledge: search indexing strategy (2 notes · 2026-05-06)

---
### [FTS5 over BM25-in-memory] · decision · accepted
`knowledge/decisions/2026-05-06-fts5-search-strategy.md`
**tags:** search, architecture

Chose SQLite FTS5 via modernc.org/sqlite over an in-memory BM25 implementation...

---
```

### New: FTS5 search index

`knowledge index` rebuilds both the markdown index files and `knowledge/.index.db`
(SQLite FTS5, gitignored). `knowledge search` hits the FTS5 index — BM25 ranked,
porter-stemmed, no more substring equality.

### New: `config.json`

Per the Perplexity skill pattern — first-run setup, read by the binary, never injected
into LLM context. Stores preferences like `auto_commit`.

### Fix: `knowledge-index` bug

`open-questions.md` currently lists open questions twice (Key Links and Open Questions
sections are identical). Fixed in new implementation.

### Fix: index excerpts

Current indexes are pure link lists. New indexes include a one-line excerpt from each
note's primary section so an agent loading the index understands what's there without
reading every file.

## What stays the same

- Note taxonomy (source, note, decision, question, index)
- Frontmatter schema
- Folder structure under `knowledge/`
- Required sections per type
- Git as audit layer
- SKILL.md behavioral instructions (updated for new CLI surface)

## Build

```bash
cd scripts/src && make build   # produces scripts/bin/knowledge-{os}-{arch}
```

Requires Go 1.21+. Consumers need nothing beyond the checked-in binary.

---

## Future: hybrid semantic search (v3)

FTS5 BM25 is the default and covers most cases well. When keyword recall
becomes the bottleneck, the upgrade path is:

- `sqlite-vec` — vector search extension, same `.index.db` file
- Ollama + `nomic-embed-text` (~274MB) as the local embedding source
- `knowledge index` detects Ollama at `localhost:11434` and generates embeddings if present; falls back to BM25-only if not
- `config.json` stores `"embedding": "ollama/nomic-embed-text"` when opted in during `knowledge config`

No dependency forced on users. BM25 always works. Hybrid kicks in only when Ollama is already installed.
