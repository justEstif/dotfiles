---
name: typst-doc
description: "Build token-efficient, consistently-styled PDF documents with Typst — reports, specs, status updates, incident post-mortems, slide decks, diagrams, flowcharts, Gantt charts, comparison matrices, one-pagers, and CVs — and answer Typst syntax questions (markup, math, code mode, set/show rules, page and table layout). Use for composed, paginated, or printable documents needing real layout, a table of contents with page numbers, headers/footers, tables, figures, or math that Markdown can't do — cheaper to share than an HTML micro-app, compiles to PDF. Routes Markdown vs Typst vs HTML, pins a prose typography preamble for consistent styling, and maps each document type to the right typst.app/universe package. Keywords: typst, PDF, document, report, spec, slide deck, diagram, flowchart, gantt, status report, incident report, comparison matrix, one-pager, CV, resume, print, typography, typst syntax, markup, math, set rules, show rules, layout, cetz, fletcher, touying."
compatibility: "Requires the `typst` CLI (`typst compile`) and network access on first compile to fetch @preview packages (cached locally afterward). Verified on typst 0.14.2. Typst syntax lives in references/."
---

# Composed documents with Typst

Build **token-efficient, consistently-styled PDF documents** — reports, specs, status updates, incident post-mortems, slide decks, diagrams, comparison matrices, one-pagers, CVs. Typst gives real pagination, tables of contents, headers/footers, figures, and math that Markdown cannot — at roughly a third the tokens of an equivalent HTML artifact — and compiles to a shareable PDF.

This is the **print/document** sibling of `micro-app` (which owns *interactive browser* artifacts). Same role: ship a polished, opinionated artifact the user can carry into a meeting or forward.

This skill covers **both** the workflow (what to build, what values to set, which package to reach for) **and** Typst syntax. The body below focuses on workflow decisions; syntax detail lives in `references/` — see the **Typst syntax** section.

## Decision gate — before building, ask

| Question | If YES → |
|---|---|
| Does it need **runtime interaction** (tune, filter, drag, click-through, persist a choice)? | `micro-app` (HTML + Alpine). Typst is compile-time only — a PDF cannot react. |
| Is it **pure prose** with no pagination, ToC, figures, or composed layout? | Markdown. Don't typeset a chat reply. |
| Does it need **pagination, a ToC with page numbers, headers/footers, real tables, figures, or print/PDF output**? | **Typst.** This is the gap Markdown leaves open. |

Only one answer wins. Pick the dominant need.

## What Typst can't do — route away

If the request contains any of these, stop and use `micro-app` instead: live demo, clickable prototype, drag-and-drop board, filterable/sortable table, config/flag/prompt editor, anything with a form whose output matters, local-first app, animation/easing tuner. A static PDF of an interactive artifact is a dead artifact.

## The pinned prose preamble — apply to every prose document

This is the **consistent-styling benefit**: one typography system across every artifact (the print analog of `micro-app`'s token palette). Start every prose document from this:

```typst
#let ink    = rgb("#1a1a1a")
#let accent = rgb("#b45309")   // one accent — headings + links
#let rule   = rgb("#d6d3cb")

#set page(paper: "a4", margin: (x: 4cm, top: 2.5cm, bottom: 2.5cm), numbering: "1")
#set text(font: "New Computer Modern", size: 11pt, lang: "en", fill: ink)
#set par(leading: 0.8em, justify: true, spacing: 1.1em)   // report style
#set heading(numbering: "1.")
#show link: it => { set text(fill: accent); it }
```

Why these values (the decisions, not the syntax): `x: 4cm` → ~66–70 char measure (readable range); `leading: 0.8em` ≈ 1.3× line height (Typst's 0.65em default is too tight for body); report-style paragraph spacing over book-style indent for scannability; one accent color for visual coherence. **For the reasoning behind every value, font alternatives, and report-vs-book style, MANDATORY READ `references/prose.md`.**

This preamble is for **prose documents**. Slides, CVs, and diagrams have their own engines — see the routing table; do not force body-prose settings onto them.

## Route document type → package

Pick one package per artifact. **MANDATORY READ `references/packages.md`** for the exact `#import` line, the current version, the verify-before-import rule, and worked examples.

| Document type | Reach for |
|---|---|
| Flowchart / pipeline / nodes-and-arrows | `fletcher` (built on `cetz`) |
| Architecture / module / custom figure | `cetz` |
| Gantt / roadmap / timeline | `timeliney` |
| Slides (shareable deck) | `touying` |
| Annotated code / PR review | `codly` |
| Callouts / admonitions / TL;DR boxes | `gentle-clues` |
| Icons (status, cues) | `iconify` |
| Running headers on long docs | `hydra` |
| Tables | built-in `#table` (style snippet in `references/packages.md`) |
| Math | **built-in** — no package (see `references/math.md` for syntax) |
| Report / paper / CV / thesis with an external format | a **universe template** — see `references/delivery.md` |

`cetz` is the foundation most diagrams build on. Everything else is optional and per-artifact.

## Output contract

- **Write a real `.typ` file to disk** — never inline-render source in chat. Filename: `<topic>-<kind>.typ`.
- **Compile to PDF before handing off** — the artifact *is* the PDF:
  ```sh
  typst compile report-status.typ          # → report-status.pdf
  typst watch  report-status.typ           # recompile on save while iterating
  ```
- **Pre-populate with real content.** No Lorem Ipsum, no empty sections — an artifact that reads "TODO" is unfinished.
- **Hand over the PDF** (and the `.typ` if the user may revise). The PDF is the shareable artifact; the source is for revision.

**MANDATORY READ `references/delivery.md`** for compile/watch/query commands, output formats (PNG/SVG), the network-and-package-cache behavior, common compile errors, and when to start from a universe template instead of the preamble.

## Typst syntax

Three modes: **markup** (default), **math** (`$ … $`), **code** (`#`). For anything beyond a one-liner, read the relevant reference rather than writing from memory:

- `references/syntax.md` — markup, headings, lists, emphasis, raw blocks (includes a LaTeX→Typst mapping)
- `references/styling.md` — `#set` and `#show` rules
- `references/scripting.md` — variables, functions, control flow, `query()`
- `references/math.md` — notation and symbols
- `references/layout.md` — `page()`, `table()`, grids, alignment

Inline only the minimal snippet the user needs; keep tutorials out of the workflow sections above.

## NEVER

- **NEVER invent `@preview` package names, versions, or import items from memory.**
  **Why:** hallucinated imports fail only at `typst compile` — after the whole document is written. Even the obvious-looking form is usually wrong: `#import "@preview/fletcher:0.5.8": *` does *not* bind a `fletcher` namespace; `fletcher` exports `diagram`/`node`/`edge` directly, and `cetz` exports `canvas`/`draw`. The `pkg.func()` style silently breaks per-package.
  **Instead:** verify the package name, current version, and exact exported symbols on typst.app/universe before importing. `references/packages.md` carries two fully verified worked examples (`cetz`, `fletcher`).

- **NEVER reach for Typst when the artifact needs runtime interaction.**
  **Why:** Typst evaluates at compile time; the PDF is static. You will hand over a dead artifact.
  **Instead:** use `micro-app` (HTML + Alpine) for tune/filter/drag/click/persist; Typst only for composed/print documents.

- **NEVER ship a `.typ` without compiling it to PDF.**
  **Why:** the entire point is a shareable artifact, and import/font/syntax errors surface only at build time.
  **Instead:** run `typst compile <file>.typ`, fix every error, then hand off the PDF.

- **NEVER use plain Markdown for a document that needs pagination, a ToC with page numbers, headers/footers, multi-column layout, or composed figures.**
  **Why:** Markdown has no typesetting engine; it collapses to unstructured prose and loses exactly the features that made Typst worth reaching for.
  **Instead:** use Typst with the pinned preamble.

- **NEVER bloat the document body or the workflow sections with Typst syntax tutorials.**
  **Why:** drowns the routing and styling decisions the user actually came for; syntax is a reference concern.
  **Instead:** inline only the minimal snippet needed; point to `references/syntax.md` (and `math.md` / `layout.md`) for anything more.

- **NEVER force the prose preamble onto slides, CVs, or diagrams.**
  **Why:** those have their own layout engines (`touying`, CV templates, `cetz`) that override body-prose settings; the preamble will fight them.
  **Instead:** apply the preamble to prose documents; for slides/CVs/diagrams, follow that package's own setup.
