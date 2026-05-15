# HTML Artifact Guidance

## Choose the artifact shape

Use the smallest shape that creates the intended behavior:

| Request | Shape |
|---|---|
| Compare N approaches / designs | Side-by-side comparison columns + Submit |
| Explore design directions | Live-rendered options user can point at |
| Plan / spec / RFC | Milestone timeline + data flow + risk table |
| Code review / PR | Annotated diff with margin notes + severity |
| Module map | Boxes-and-arrows SVG with hot-path highlight |
| Design tokens | Swatches + type specimens + copy-on-click |
| Component variants | Contact sheet: all sizes/states/intents |
| Parameter tuning | Sliders/knobs + live preview + Submit |
| Clickable prototype | Linked screens, real interaction |
| Slide deck | `<section>` slides + keyboard nav + View Transitions |
| Feature / concept explainer | TL;DR box + collapsible sections + tabbed code |
| Status report | Chart + colored timeline + what-shipped list |
| Incident timeline | Minute-by-minute log + follow-up checklist |
| Ticket triage | Drag-and-drop kanban + Submit ordering |
| Config / flag editor | Grouped fields + dependency warnings + diff export |
| Prompt tuner | Editable template left + live preview right |
| Workshop lab | Step cards + copy prompts + paste-back + export |
| Manager summary | Recommendation first + 3 cards + one CTA |
| Data explorer | Filterable table + Popover row detail + CSV export |
| Mind map | Branching SVG tree + collapse/expand + Submit |
| Timeline / roadmap | Gantt bars + milestone Popover + export |

## Reference examples

All 20 are in `$SKILL_DIR/examples/`. Read the matching file before producing that artifact type.

**Exploration & Planning**
- `01-exploration-code-approaches.html` — three approaches side-by-side, tradeoffs inline
- `02-exploration-visual-designs.html` — rendered layout/palette options
- `16-implementation-plan.html` — milestones, data flow, mockups, risk table

**Code Review**
- `03-code-review-pr.html` — annotated diff with margin notes, severity tags, jump links
- `17-pr-writeup.html` — author's view: motivation, file-by-file tour, where to focus
- `04-code-understanding.html` — package as boxes-and-arrows, hot path highlighted

**Design**
- `05-design-system.html` — tokens rendered as swatches, copy-on-click
- `06-component-variants.html` — all sizes, states, and intents on one sheet

**Prototyping**
- `07-prototype-animation.html` — animation in isolation with duration/easing sliders
- `08-prototype-interaction.html` — four linked screens, real click-through

**Diagrams**
- `10-svg-illustrations.html` — SVG figures for a post, tweak and copy individually
- `13-flowchart-diagram.html` — deploy pipeline, click step for details

**Decks**
- `09-slide-deck.html` — arrow-key navigation, no build step

**Research**
- `14-research-feature-explainer.html` — TL;DR, collapsible steps, tabbed snippets, FAQ
- `15-research-concept-explainer.html` — live interactive ring, comparison table, glossary

**Reports**
- `11-status-report.html` — what shipped/slipped, small chart, Monday-morning skim
- `12-incident-report.html` — minute-by-minute timeline, log excerpts, follow-up checklist

**Custom Editors**
- `18-editor-triage-board.html` — drag tickets to Now/Next/Later/Cut, copy ordering
- `19-editor-feature-flags.html` — toggles with dependency warnings, copy diff
- `20-editor-prompt-tuner.html` — editable template left, three sample inputs right

## Design system preference

For one-off documents and manager-facing artifacts, use the "HTML effectiveness" visual language. Implemented with Tailwind custom tokens:

```html
<style type="text/tailwindcss">
  @theme {
    --color-ivory: #FAF9F5;
    --color-slate-dark: #141413;
    --color-clay: #D97757;
    --color-oat: #E3DACC;
    --color-olive: #788C5D;
    --color-gray-150: #F0EEE6;
    --color-gray-300: #D1CFC5;
    --color-gray-500: #87867F;
    --color-gray-700: #3D3D3A;
  }
</style>
```

Type: Tailwind's `font-serif` for main headlines and card titles; `font-sans` for body; `font-mono` for labels, status, and actions.

## Scannability rules

- Put recommendation before options when the recipient wants a decision.
- Max 3 primary choices per view.
- Cards: title, one-line value prop, 3 bullets, one action.
- Use Popover or `<details>` for progressive disclosure.
- One primary CTA at end.
- If asked to "strip it down" — cut background context before cutting decisions.

## GitHub Pages delivery

For a shareable static lab:
- `index.html` in repo root (or `/docs` folder)
- Avoid private/internal data in public repos
- Include README with "open locally" and deploy steps
- All state local unless collaboration is explicitly required
- Tailwind CDN + Alpine CDN = no build step needed
