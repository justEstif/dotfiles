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

## 3. Alpine `x-transition` audit
Review all 20 examples and the skill itself — replace `document.startViewTransition` wrapping with `x-transition` where it's a better fit.

`x-transition` handles show/hide fade+scale natively on `x-show`. `startViewTransition` is better for cross-element / page-level morphs (slide deck transitions, panel swaps where the outgoing element matters). They're not equivalent — this audit should decide which pattern to codify in `references/ui-polish.md` for each use case:
- `x-transition` → element enters/exits the DOM via `x-show`
- `startViewTransition` → two elements swapping, or named `view-transition-name` hero animations
- Both together → `x-show` with `x-transition` *and* `startViewTransition` wrapping the state change

## 4. Alpine plugins audit
The 9 official plugins. Assess each for relevance to playground artifacts and update the skill + `references/ui-polish.md`.

| Plugin | What it replaces | Relevant artifacts |
|---|---|---|
| **Sort** (`x-sort`, `x-sort:item`) | HTML5 drag API hand-roll in 18-editor-triage-board | Kanban, any drag-to-reorder |
| **Persist** (`$persist`) | Manual `localStorage.getItem/setItem` | Any artifact that saves state across sessions |
| **Collapse** (`x-collapse`) | CSS height transitions for accordions | Research explainers (14), any collapsible section |
| **Mask** (`x-mask`) | Manual input formatting JS | Forms with phone/date/money inputs (local-first template) |
| **Intersect** (`x-intersect`) | Manual `IntersectionObserver` setup | Scroll-triggered animations, lazy load, infinite scroll |
| **Focus** (`x-trap`) | Manual focus management in modals | `<dialog>` wrappers, any modal/drawer |
| **Anchor** (`x-anchor`) | Manual Floating UI or positioning JS | Dropdowns, tooltips, autocomplete popovers |
| **Morph** (`Alpine.morph`) | DOM diffing / server HTML updates | Dynamic content refresh without full re-render |
| **Resize** (`x-resize`) | Manual `ResizeObserver` setup | Responsive chart/diagram sizing |

**High priority:** Sort (replaces hand-rolled drag in 18), Persist (replaces localStorage boilerplate), Collapse (cleaner than `x-show` + manual height), Anchor (replaces Popover positioning hacks).

## 5. CSS Scroll-Driven Animations
Replace JS scroll listeners with pure CSS `animation-timeline`. Runs on the compositor thread — zero jank.

Browser support (2026): Chrome/Edge/Opera ✓, Safari 18 ✓, Firefox partial (flag).

Two timeline types to use in playground artifacts:
- `animation-timeline: scroll()` — ties animation to scroll progress of a container. Use for: reading progress bars, parallax, sticky header shrink.
- `animation-timeline: view()` — ties animation to element's viewport visibility. Use for: fade-in on scroll, slide-in cards, reveal effects.

```css
/* Fade in as element enters viewport */
@keyframes fade-up {
  from { opacity: 0; translate: 0 20px; }
  to   { opacity: 1; translate: 0 0; }
}
.card {
  animation: fade-up linear;
  animation-timeline: view();
  animation-range: entry 0% entry 60%;
}

/* Reading progress bar */
.progress {
  animation: grow-width linear;
  animation-timeline: scroll(root);
}
@keyframes grow-width { to { width: 100%; } }
```

Relevant for: research explainers (14, 15), status reports (11), implementation plans (16), slide decks (09). Add patterns to `references/ui-polish.md` once validated.

## 6. Dark mode
Add dark mode support across all examples and the skill itself.
- Add `dark:` Tailwind variants to all converted examples
- Add a dark mode toggle pattern to `references/ui-polish.md`
- Default: `prefers-color-scheme` via Tailwind's `dark` variant + optional manual toggle via Alpine

## 7. Local-first app template
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
