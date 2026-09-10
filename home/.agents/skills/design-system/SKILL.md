---
name: design-system
description: >
  Encodes the brand design system — tokens, typography, spacing, color, components, and
  review checklist — so Pi produces on-brand UI instead of generic AI output. Use FIRST for
  any UI/frontend/design task: landing pages, prototypes, components, dashboards, slides.
  Triggers: design, UI, frontend, brand, tokens, styling, mockup, landing page, component,
  screenshot-to-UI, redline.
---

# Design System

Pi has no taste by default. This skill supplies it: real tokens, real components, real
references. Never invent spacing, colors, or fonts — pull from the values below.

## When to Use

Any task that produces visible UI: pages, components, emails, slides, prototypes, or
screenshots matched to references.

## Design Tokens

### Color

| Role | Value | Usage |
| --- | --- | --- |
| `--color-bg` | #FFFFFF | Page background |
| `--color-surface` | #F6F7F9 | Cards, panels, alt sections |
| `--color-text` | #111418 | Primary text |
| `--color-text-muted` | #5C6670 | Secondary text |
| `--color-accent` | #2F6FED | Primary actions, links, focus |
| `--color-accent-hover` | #2456C4 | Hover state for accent |
| `--color-border` | #E3E6EA | Hairlines, dividers |
| `--color-danger` | #D93A3A | Destructive actions, errors |

- Contrast: text-on-background pairs must meet WCAG AA (4.5:1 body, 3:1 large text).
- Never use pure black (#000) on white; use `--color-text`.
- Accent color is for actions and focus only — never body text or large fills.

### Typography

| Token | Value |
| --- | --- |
| `--font-sans` | Inter, system-ui, sans-serif |
| `--font-mono` | JetBrains Mono, ui-monospace, monospace |
| `--text-xs` | 0.75rem / 1.4 |
| `--text-sm` | 0.875rem / 1.5 |
| `--text-base` | 1rem / 1.6 |
| `--text-lg` | 1.125rem / 1.6 |
| `--text-xl` | 1.25rem / 1.4 |
| `--text-2xl` | 1.5rem / 1.3 |
| `--text-3xl` | 1.875rem / 1.2 |
| `--text-4xl` | 2.25rem / 1.1 |

- One accent/serif/display font max, used only for hero display sizes.
- Body copy at `--text-base` or `--text-sm`; never below `--text-xs`.

### Spacing & layout

- Scale (rem): `0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8` — no off-scale values.
- Base unit 0.25rem (4px). Component padding ≥ 1rem; page gutters ≥ 1.5rem.
- Container max-width: 72rem (1152px) for marketing; 64rem for app content.
- Vertical rhythm: section spacing 4–6rem desktop, 3–4rem mobile.

### Radius, shadow, motion

- `--radius-sm` 6px (inputs, chips) · `--radius-md` 10px (buttons) · `--radius-lg` 16px (cards, modals)
- `--shadow-sm` subtle lift for cards · `--shadow-md` for popovers · never heavy drop shadows
- Transitions 150–200ms ease-out; respect `prefers-reduced-motion`.

## Components (canonical primitives)

- **Button**: radius-md, padding 0.5rem 1rem, accent bg / white text (primary); surface bg / border (secondary). Disabled = 40% opacity, not grey-on-grey.
- **Input**: radius-sm, 1px border `--color-border`, 2px accent focus ring.
- **Card**: surface bg, radius-lg, shadow-sm, 1.5rem padding.
- **Link**: accent, underline on hover only.

Reuse existing primitives before creating new ones. If a needed component doesn't exist,
build it from these tokens — never hardcode hex or pixel values inline.

## Procedure (screenshot-to-UI and UI tasks)

1. Gather references first — desktop AND mobile, plus hover/empty/loading states where possible.
2. Identify the actual design system in play: if the project has its own `DESIGN.md`, tokens file, or component library, **it overrides the defaults in this skill**. Read it first.
3. Map reference → tokens above (or project tokens); call out any gaps explicitly.
4. Build responsively: mobile-first, then 768px / 1024px / 1280px breakpoints.
5. Verify in a real browser (agent-browser): screenshot at 390px, 768px, 1280px and compare against the references.
6. Iterate on the comparison, not on "it compiles".

## Pitfalls

- Generic AI look = defaults, no hierarchy, centered everything, purple gradients. Resist all three.
- Don't add fonts/colors "to make it pop" — extend the token table deliberately instead.
- Real reference images beat adjectives: "clean and modern" is not a spec.
- Confirm state coverage (hover, focus-visible, disabled, empty, error) — not just the happy path.

## Verification

- No hardcoded hex/px values outside the token definitions.
- Lighthouse/a11y: text contrast AA, focus-visible on all interactives.
- Screenshots at 390/768/1280 match the reference within reasonable tolerance.
