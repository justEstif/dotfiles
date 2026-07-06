# Prose typography — the pinned preamble

The preamble in SKILL.md is the **single source of consistent styling**. This file explains each value and the alternatives, so you can adapt a document without losing coherence.

## Why each value

| Setting | Value | Why |
|---|---|---|
| Page margins `x: 4cm` | A4 → ~13 cm text column | ~66–70 characters per line — the readable measure. Wider lines tire the eye; narrower wastes the page. |
| `leading: 0.8em` | ~1.3× font size | Typst's default `0.65em` is tight (tuned for dense academic output). 0.8em is comfortable for reports and reading. |
| `size: 11pt` | body | 11pt is the readable floor for print; 10pt strains on paper. |
| `spacing: 1.6em` | paragraph gap (report style) | Airier breaks between paragraphs without first-line indent — gives the page room to breathe. Use for status reports, specs, explainers. |
| `heading` block `above: 2.4em / below: 1.2em` | space around section titles | Sections get clear separation from preceding text and a beat before the next paragraph — composed, not cramped. |
| `figure` `2em` around, `gap: 0.8em`, caption `9.5pt` rule | figures as distinct blocks | Figures read as self-contained units, not crammed into prose; small grey captions stay subordinate to body text. |
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

## Optional title block

A centered title block opens a report or essay without a full cover page. Title in `ink` (not accent — the ochre stays the signal for section headings); descriptor and byline in small grey:

```typst
#align(center)[#text(size: 22pt, weight: "bold", fill: ink)[Composed documents with Typst]]
#v(0.2em)
#align(center)[#text(size: 11pt, fill: rule)[Style guide]]
#v(0.8em)
#align(center)[#text(size: 9.5pt, fill: rule)[typst-doc skill · 6 July 2026]]
#v(1.6em)   // gap before the ToC or first heading
```

Use it for reports, specs, and essays. Skip it for one-pagers, comparison matrices, and diagrams — those open straight into content.

## Fonts — what ships and what to choose

Verified available in the default `typst` install (always confirm with `typst fonts` in the target environment):

| Role | Default | Alternatives |
|---|---|---|
| Body serif | `New Computer Modern` | `Libertinus Serif`, `DejaVu Serif` |
| Body sans | `Noto Sans` | `DejaVu Sans` |
| Mono (raw blocks) | auto | `DejaVu Sans Mono` |

`New Computer Modern` is the preamble's default and ships with the Typst CLI, so it renders with no setup — keep it unless the user asks for a specific look. **Never reference a font you have not confirmed with `typst fonts`** in the target environment; a missing font silently falls back and breaks the design.

## The palette

Two neutrals + one accent is enough for any document:

- `ink` (`#1a1a1a`) — body text. Pure `#000` is harsh on paper.
- `rule` (`#d6d3cb`) — table rules, dividers, subtle borders.
- `accent` (`#b45309`, a warm ochre) — headings, links, callout strokes. Change this one value to re-skin the whole document.

The print equivalent of the "generic AI look" is *no accent at all* (a wall of black text) or *rainbow coloring*. One accent, used consistently — that is the entire aesthetic stance.
