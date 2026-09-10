# Default token scaffold

Copy into the project's `DESIGN.md` and replace with the project's brand values.
These are neutral placeholders, NOT a brand — every value here should be replaced.

## Color

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

- Contrast: text/background pairs meet WCAG AA (4.5:1 body, 3:1 large text).
- No pure black on white; accent is for actions/focus only — never body text.

## Typography

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

- One display font max, hero sizes only. Body at base/sm, never below xs.

## Spacing & layout

- Scale (rem): `0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8` — no off-scale values.
- Component padding ≥ 1rem; page gutters ≥ 1.5rem.
- Container max-width: 72rem marketing / 64rem app content.
- Section spacing 4–6rem desktop, 3–4rem mobile.

## Radius, shadow, motion

- `--radius-sm` 6px (inputs, chips) · `--radius-md` 10px (buttons) · `--radius-lg` 16px (cards, modals)
- `--shadow-sm` card lift · `--shadow-md` popovers · no heavy drop shadows
- Transitions 150–200ms ease-out; respect `prefers-reduced-motion`.

## Component primitives

- **Button**: radius-md, 0.5rem 1rem padding, accent bg/white text (primary); surface/border (secondary). Disabled = 40% opacity.
- **Input**: radius-sm, 1px border, 2px accent focus ring.
- **Card**: surface bg, radius-lg, shadow-sm, 1.5rem padding.
- **Link**: accent, underline on hover only.
