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

## x-transition vs startViewTransition

Pick the right tool — they solve different problems:

| Situation | Use |
|---|---|
| Element enters/exits the DOM via `x-show` or `x-if` | `x-transition` |
| Two elements swap (one out, one in), or hero morph between positions | `startViewTransition` |
| Alpine state change that also toggles `x-show` elements | Both together |

### `x-transition` — element enters/exits

Handles opacity and scale automatically. No JS needed.

```html
<!-- Fade-in when visible, fade-out when hidden -->
<div x-show="open" x-transition>
  Content
</div>

<!-- Custom timing -->
<div
  x-show="open"
  x-transition:enter="transition ease-out duration-200"
  x-transition:enter-start="opacity-0 scale-95"
  x-transition:enter-end="opacity-100 scale-100"
  x-transition:leave="transition ease-in duration-150"
  x-transition:leave-start="opacity-100 scale-100"
  x-transition:leave-end="opacity-0 scale-95"
>
  Content
</div>
```

### `startViewTransition` — two elements swapping

Captures a before/after snapshot of the page and cross-fades them. Best for panel swaps, tab content, and named hero morphs.

```js
// Tab switch — DOM snapshots before and after the state mutation
switchTab(name) {
  const go = () => this.tab = name;
  document.startViewTransition ? document.startViewTransition(go) : go();
}
```

```html
<!-- Named hero morph: same view-transition-name in both positions -->
<!-- List view -->
<img style="view-transition-name: hero-img" src="thumb.jpg" class="w-24 h-24 rounded" />

<!-- Detail view (different DOM location, same name) -->
<img style="view-transition-name: hero-img" src="thumb.jpg" class="w-full h-64 object-cover" />
```

```css
/* In <style> — Tailwind can't express view-transition-name */
::view-transition-old(hero-img) { animation: fade-out 200ms ease; }
::view-transition-new(hero-img) { animation: fade-in 200ms ease; }
```

### Using both together

Wrap `startViewTransition` around the Alpine state change. The transition captures the before/after page snapshot; `x-transition` on individual elements handles their own fade independently.

```js
openDetail(item) {
  // startViewTransition wraps the state mutation:
  //   - captures the current page (list visible, detail hidden)
  //   - runs the callback
  //   - captures new page (list hidden, detail visible)
  //   - cross-fades the snapshots
  // Meanwhile x-transition on each x-show element animates its own enter/leave.
  const go = () => {
    this.selected = item;
    this.view = 'detail'; // triggers x-show on list + detail panels
  };
  document.startViewTransition ? document.startViewTransition(go) : go();
}
```

```html
<div x-show="view === 'list'" x-transition>…list…</div>
<div x-show="view === 'detail'" x-transition>…detail…</div>
```

## Alpine plugins

For patterns that need more than core Alpine, load these official plugins. **All plugins must load before Alpine core (all deferred).**

### Sort — drag-to-reorder lists

```html
<script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/sort@3.x.x/dist/cdn.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>
```

Replaces hand-rolled HTML5 drag API. `x-sort` on the container, `x-sort:item` on children. Optional `x-sort:handle` restricts drag to a handle element. The handler receives `($item, $position)` for updating state.

```html
<ul x-data="{ items: ['Task A', 'Task B', 'Task C'] }"
    x-sort="reorder($item, $position)">
  <template x-for="(item, i) in items" :key="item">
    <li x-sort:item class="flex items-center gap-2 bg-white rounded-lg p-3 mb-2 shadow-sm">
      <span x-sort:handle class="cursor-grab text-gray-400">⠿</span>
      <span x-text="item"></span>
    </li>
  </template>
</ul>
```

```js
function appState() {
  return {
    items: ['Task A', 'Task B', 'Task C'],
    reorder(item, position) {
      // item = the moved element, position = new 0-based index
      this.items.splice(position, 0, this.items.splice(this.items.indexOf(item.dataset.key), 1)[0]);
    },
  };
}
```

Use for: kanban boards, reorderable lists, priority queues.

### Persist — localStorage without boilerplate

`$persist(value)` works inside `x-data` component scope and auto-syncs to localStorage. Load the plugin before Alpine:

```html
<script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/persist@3.x.x/dist/cdn.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>
```

```js
function appState() {
  return {
    tab: this.$persist('overview'),
    sidebarOpen: this.$persist(true),
  };
}
```

**Do not use `$persist` inside `Alpine.store()` or `alpine:init` listeners.** Both the Persist plugin and your store listener register via `alpine:init` internally; listener order is not guaranteed when loading from CDN, so `Alpine.$persist` may not exist yet when your callback runs. Use manual `localStorage` read/write instead (see Dark Mode below).

### Dark mode toggle (canonical pattern)

No plugin needed. Manual `localStorage` is simpler and has no CDN timing issues.

**`<head>` — store + single Alpine script:**
```html
<script>
  document.addEventListener('alpine:init', () => {
    Alpine.store('theme', {
      dark: JSON.parse(localStorage.getItem('theme-dark') ?? 'null') ??
            window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggle() {
        this.dark = !this.dark;
        localStorage.setItem('theme-dark', JSON.stringify(this.dark));
      }
    });
  });
</script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>
```

**`<html>` tag — `x-data` is required to open Alpine scope:**
```html
<html lang="en" x-data x-bind:class="{ dark: $store.theme.dark }">
```
`x-bind:class` is silently ignored without `x-data` on the same element — Alpine only processes directives inside an open scope.

**Tailwind v4 — class-based dark variant:**
```html
<style type="text/tailwindcss">
  @custom-variant dark (&:where(.dark, .dark *));
</style>
```
This makes `dark:` utilities respond to the `.dark` class on `<html>`, not `prefers-color-scheme`.

**Toggle button:**
```html
<button @click="$store.theme.toggle()"
        class="fixed top-3 right-3 z-50 w-8 h-8 flex items-center justify-center
               rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300
               hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
        :title="$store.theme.dark ? 'Light mode' : 'Dark mode'"
        x-text="$store.theme.dark ? '☀' : '☾'">
</button>
```

### Collapse — smooth height animation

```html
<script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/collapse@3.x.x/dist/cdn.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>
```

Better than `x-show` + manual CSS height transitions. Use `x-collapse` on the collapsible element — it animates height from `0` to `auto` smoothly without fixed pixel values.

```html
<div x-data="{ open: false }">
  <button @click="open = !open"
          class="flex w-full items-center justify-between px-4 py-3 font-medium">
    Section title
    <span :class="open ? 'rotate-180' : ''"
          class="transition-transform duration-200">▾</span>
  </button>

  <!-- x-collapse instead of x-show for height animation -->
  <div x-show="open" x-collapse class="px-4 pb-4 text-gray-600 text-sm">
    Collapsible content here. Height animates from 0 to auto.
  </div>
</div>
```

Use for: accordions, FAQ sections, expandable log entries, any section where the content height is unknown.

### Anchor — floating element positioning

```html
<script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/anchor@3.x.x/dist/cdn.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>
```

Positions a floating element relative to a trigger, powered by [Floating UI](https://floating-ui.com/). Replaces manual `getBoundingClientRect` + absolute positioning.

```html
<div x-data="{ open: false }">
  <button x-ref="btn" @click="open = !open"
          class="px-4 py-2 bg-slate-900 text-white rounded-full text-sm">
    Options
  </button>

  <!-- x-anchor positions this relative to $refs.btn -->
  <div x-show="open"
       x-anchor.bottom-start="$refs.btn"
       x-transition
       class="absolute z-50 bg-white shadow-xl rounded-lg p-2 min-w-40">
    <button class="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded">Edit</button>
    <button class="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded">Delete</button>
  </div>
</div>
```

Positioning modifiers: `.top`, `.bottom`, `.left`, `.right`, `.top-start`, `.bottom-start`, `.top-end`, `.bottom-end`.

Use for: dropdowns, context menus, tooltips, autocomplete suggestion panels.

### Other official plugins (one-liner each)

- **Focus** (`@alpinejs/focus`) — traps keyboard focus inside a modal or panel; `x-trap="open"` on the container.
- **Intersect** (`@alpinejs/intersect`) — fires `x-intersect` callbacks when an element enters/leaves the viewport. Use for lazy loading, scroll-triggered animations.
- **Mask** (`@alpinejs/mask`) — input masking with `x-mask` (phone numbers, credit cards, dates).
- **Morph** (`@alpinejs/morph`) — surgically patches the DOM to match a new HTML string without re-rendering everything. Useful for server-side partial updates.
- **Resize** (`@alpinejs/resize`) — fires `x-resize` when an element's dimensions change. Use instead of `ResizeObserver` boilerplate.

## CSS Scroll-Driven Animations

**Browser support:** Chrome/Edge/Opera (v115+) ✓ · Safari 18 ✓ · Firefox partial.

Runs on the compositor thread — zero jank, no JavaScript scroll listeners needed. Declare once in CSS; the browser handles everything.

### Timeline types

- `scroll()` — progress tied to a scrollable element (default: the nearest scroller; `scroll(root)` for the page).
- `view()` — progress tied to the element's position within the viewport (enters → exits).

### Cards fade+rise as they enter the viewport

```css
@keyframes fade-up {
  from { opacity: 0; translate: 0 24px; }
  to   { opacity: 1; translate: 0 0; }
}

.card {
  animation: fade-up linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 60%; /* only play during entry phase */
}
```

### Reading progress bar

```css
.progress-bar {
  position: fixed; top: 0; left: 0;
  height: 3px; background: var(--color-clay);
  width: 0%;
  animation: grow-x linear;
  animation-timeline: scroll(root);
}

@keyframes grow-x { to { width: 100%; } }
```

### Sticky header shrinks on scroll

```css
.header {
  animation: shrink linear;
  animation-timeline: scroll(root);
  animation-range: 0px 200px; /* only over first 200px of scroll */
}

@keyframes shrink {
  to { padding-block: 0.5rem; font-size: 0.875rem; }
}
```

### Where these go

Put scroll-driven animation CSS in the `<style type="text/tailwindcss">` block — Tailwind cannot express `animation-timeline` or `animation-range`.

```html
<style type="text/tailwindcss">
  @theme {
    --color-clay: #D97757;
  }

  .card {
    animation: fade-up linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 60%;
  }

  @keyframes fade-up {
    from { opacity: 0; translate: 0 24px; }
    to   { opacity: 1; translate: 0 0; }
  }
</style>
```

### Progressive enhancement

Content must remain readable if scroll-driven animations are absent (unsupported browser, `prefers-reduced-motion`, etc.). Never gate visibility on animation completion.

```css
/* Safe: animation adds polish, absence doesn't hide content */
.card {
  /* fully visible by default */
  animation: fade-up linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 60%;
}

/* Use @supports if you need to guard complex transforms */
@supports (animation-timeline: scroll()) {
  .card { opacity: 0; } /* only hide if scroll-driven animations are supported */
}
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
