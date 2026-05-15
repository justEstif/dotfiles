# Playground Skill — TODO

## 1. Responsive test across all examples
Full cross-device check of all converted examples.
- Open each on mobile viewport (375px) and confirm single-column collapse
- Check tablet (768px) breakpoints
- Fix any overflow, truncation, or layout breaks found

## 2. `_index.html` — browsable template gallery
A hidden index page listing all examples so they can be browsed locally.
- Lives at `examples/_index.html`
- Grid of cards: example number, title, category, screenshot or live iframe preview
- Links open the example in a new tab
- Uses the same Tailwind + Alpine stack
- Not linked from anywhere public — local browsing only

## 3. Dark mode
Add dark mode support across all examples and the skill itself.
- Add `dark:` Tailwind variants to all converted examples
- Add a dark mode toggle pattern to `references/ui-polish.md`
- Default: `prefers-color-scheme` via Tailwind's `dark` variant + optional manual toggle via Alpine

## 2. Local-first app template
Create a template based on [localtrack](https://github.com/arthurcornil/localtrack) — a local-first personal finance tracker — but using Bun + TypeScript instead of Go.

Reference: https://github.com/arthurcornil/localtrack

Stack:
- Bun (runtime + bundler)
- TypeScript
- Local-first storage (SQLite via Bun's built-in, or `@electric-sql/pglite` for browser)
- Alpine.js for UI reactivity
- Tailwind v4 for styling

Key patterns to adapt:
- Offline-first data model
- Import/export (CSV or JSON)
- No auth, no backend, single-user
- Should work as both a desktop Bun app and a static browser artifact
