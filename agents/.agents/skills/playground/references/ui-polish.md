# UI Polish

## Native browser features

Reach for these before any library:

| Feature | API | When |
|---|---|---|
| Non-blocking overlay | Popover API | menus, detail panels, contextual info |
| Blocking modal | `<dialog>` + `.showModal()` | confirmation, decision required |
| Animated state change | `document.startViewTransition()` | panel swap, slide nav, before/after reveal |
| Clipboard | `navigator.clipboard.writeText()` | copy prompt, export, share |
| Disclosure | `<details><summary>` | low-stakes collapse |

Always wrap modern APIs in feature checks:
```js
const update = () => { /* state change */ };
document.startViewTransition ? document.startViewTransition(update) : update();
el.showPopover?.();
```

## Popover API patterns

### Basic
```html
<button popovertarget="panel" class="text-sm underline cursor-pointer">View details</button>
<div id="panel" popover class="bg-white rounded-xl shadow-xl p-6 max-w-sm">
  Content here
</div>
```

### With Alpine — dynamic content
```html
<button @click="openPanel(item)" class="…">Details</button>
<div x-ref="panel" popover
     @toggle="if ($event.newState === 'closed') selected = null"
     class="bg-white rounded-xl shadow-xl p-6 max-w-sm">
  <h3 x-text="selected?.title" class="font-serif text-lg mb-2"></h3>
  <p x-text="selected?.body" class="text-gray-600 text-sm"></p>
</div>
```
```js
openPanel(item) {
  const update = () => {
    this.selected = item;
    this.$nextTick(() => this.$refs.panel.showPopover?.());
  };
  document.startViewTransition ? document.startViewTransition(update) : update();
}
```

## View Transitions patterns

### Slide navigation
```js
next() {
  const go = () => this.slide = Math.min(this.slide + 1, this.total - 1);
  document.startViewTransition ? document.startViewTransition(go) : go();
}
```

### Tab / panel switching
```js
switchTab(name) {
  const go = () => this.tab = name;
  document.startViewTransition ? document.startViewTransition(go) : go();
}
```

### Named transition pairs (hero-style)
```html
<div style="view-transition-name: card-42" class="…">…</div>
```
```css
/* In <style> block — Tailwind can't express this */
::view-transition-old(card-42) { animation: slide-out 200ms ease; }
::view-transition-new(card-42) { animation: slide-in 200ms ease; }
```

## Motion rules

- Animate state changes that would otherwise feel abrupt.
- Keep transitions under ~200ms for utility UI; ~300ms for narrative (deck slides).
- `x-transition` on Alpine `x-show` adds a default fade — use it freely.
- Respect `prefers-reduced-motion`: Tailwind's `motion-safe:` and `motion-reduce:` variants.
- Never make content wait for animation. Transitions are feedback, not gates.

## Tailwind CDN v4

```html
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
```

Custom tokens via `@theme` in a `<style type="text/tailwindcss">` block:
```html
<style type="text/tailwindcss">
  @theme {
    --color-ivory: #FAF9F5;
    --color-slate-dark: #141413;
    --color-clay: #D97757;
    --color-oat: #E3DACC;
    --color-olive: #788C5D;
  }
</style>
```

Use Tailwind classes for everything. Only write `<style>` for: SVG stroke/fill attributes, scroll-snap, `@keyframes`, `view-transition-name`.

## Alpine.js v3

```html
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>
```

Must be deferred; loads after DOM. Load order: Tailwind script → style block → Alpine deferred.

Key directives:
- `x-data` — declares reactive scope
- `x-model` — two-way bind input → state
- `x-show` / `x-if` — conditional rendering (`x-show` keeps DOM, `x-if` removes it)
- `x-text` / `x-html` — bind text/html (prefer `x-text` to avoid XSS)
- `x-transition` — auto-animate `x-show` changes
- `x-for` — list rendering (always use `:key`)
- `@click`, `@keydown`, `@input` — event handlers
- `x-ref` — template ref for direct DOM access
- `$watch` — side-effect on state change
- `$nextTick` — run after Alpine re-renders

Never use `innerHTML` from a variable. Use `x-text` for reactive text, `x-html` only for trusted static markup.
