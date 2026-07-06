# Prose typography — the pinned preamble

The preamble in SKILL.md is the **single source of consistent styling**. This file explains each value and the alternatives, so you can adapt a document without losing coherence.

## Why each value

| Setting | Value | Why |
|---|---|---|
| Page margins `x: 4cm` | A4 → ~13 cm text column | ~66–70 characters per line — the readable measure. Wider lines tire the eye; narrower wastes the page. |
| `leading: 0.8em` | ~1.3× font size | Typst's default `0.65em` is tight (tuned for dense academic output). 0.8em is comfortable for reports and reading. |
| `size: 11pt` | body | 11pt is the readable floor for print; 10pt strains on paper. |
| `spacing: 1.1em` | paragraph gap (report style) | Clear paragraph breaks without first-line indent. Use for status reports, specs, explainers. |
| `justify: true` | flush both edges | An even right margin reads as a composed document, not a chat transcript. |
| One `accent` color | headings + links | Visual coherence — the document looks designed, not assembled. |
| `numbering: "1."` headings | numbered sections | Lets reviewers cite "see §2.3". Drop for one-pagers and letters. |

## Report style vs book style

- **Report style (preamble default):** no first-line indent, paragraph spacing, numbered headings, title block. Use for status reports, specs, incident post-mortems, PR writeups, explainers.
- **Book / prose style:** first-line indent, no paragraph gap, justification:
  ```typst
  #set par(first-line-indent: 1.4em, spacing: 0pt, justify: true)
  ```
  Use for essays, narratives, long-form reading.

Pick one per document; don't mix.

## Fonts — what ships and what to choose

Verified available in the default `typst` install (always confirm with `typst fonts` in the target environment):

| Role | Default | Alternatives |
|---|---|---|
| Body serif | `New Computer Modern` | `Libertinus Serif`, `DejaVu Serif` |
| Body sans | `Noto Sans` | `DejaVu Sans` |
| Mono (raw blocks) | auto | `DejaVu Sans Mono` |

`New Computer Modern` is Typst's default and renders cleanly with no setup — keep it unless the user asks for a specific look. **Never reference a font you have not confirmed with `typst fonts`** in the target environment; a missing font silently falls back and breaks the design.

## The palette

Two neutrals + one accent is enough for any document:

- `ink` (`#1a1a1a`) — body text. Pure `#000` is harsh on paper.
- `rule` (`#d6d3cb`) — table rules, dividers, subtle borders.
- `accent` (`#b45309`, a warm ochre) — headings, links, callout strokes. Change this one value to re-skin the whole document.

The print equivalent of the "generic AI look" is *no accent at all* (a wall of black text) or *rainbow coloring*. One accent, used consistently — that is the entire aesthetic stance.
