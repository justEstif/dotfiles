---
name: playground
description: "Create polished local-first HTML playgrounds and micro-apps for exploration, workshops, demos, and manager-ready artifacts. Use when the user asks for a playground, interactive HTML artifact, static GitHub Pages lab, self-guided exercise, visual explorer, copy/paste AI workflow, slide deck, diagram, data explorer, code review artifact, comparison matrix, timeline, throwaway editor, brainstorm grid, mind map, design token showcase, spec/planning doc, or HTML instead of markdown/slides. Keywords: playground, micro-app, static HTML, GitHub Pages, Alpine, Tailwind CDN, Popover API, View Transitions, local-first, copy prompt, export markdown, slide deck, kanban, ERD, mind map, data explorer, spec, implementation plan."
---

# Playground

Build self-contained browser artifacts that help users *try the idea*, not read about it. Optimize for a URL-sharable, local-first experience: static files, browser state, copy/paste workflows, and exportable artifacts.

Reference examples live at `examples/` in this skill directory — 20 self-contained HTML files. **Read the relevant example before producing any artifact of that type.** They are the ground truth for structure, aesthetic, and interactivity level.

## Core stance

A playground is not a mini-SaaS. It is a shipped interaction:
- browser as runtime
- synthetic/local data by default
- no auth/backend/API keys unless explicitly required
- one clear job per artifact
- polished enough to feel intentional

When the request is content-heavy, first ask: "Would interaction make the decision clearer?" If no, use Markdown. If yes, build HTML.

---

## Stack — always use these three

Every artifact uses this exact stack. No exceptions without explicit user override.

### 1. Tailwind CSS v4 (CDN)

```html
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
```

Configure custom tokens inline when needed:
```html
<style type="text/tailwindcss">
  @theme {
    --color-ivory: #FAF9F5;
    --color-slate: #141413;
    --color-clay: #D97757;
    --color-oat: #E3DACC;
    --color-olive: #788C5D;
  }
</style>
```

Use Tailwind classes for **all** layout, spacing, color, and typography. Never write a `<style>` block for things Tailwind covers. Only use `<style>` for things Tailwind cannot express: SVG strokes, scroll-snap, `@keyframes`, custom `view-transition-name`.

### 2. Alpine.js v3

```html
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>
```

Load order: Tailwind script → `<style type="text/tailwindcss">` → Alpine deferred. Always defer Alpine; it must load after the DOM.

Use Alpine for **all** reactive state. No manual `addEventListener` + `querySelector` DOM wiring when Alpine can do it with `x-model`, `x-show`, `x-on`, `x-bind`, `@click`, `$watch`.

```html
<div x-data="{ count: 0, open: false }">
  <button @click="count++" class="px-4 py-2 bg-slate-900 text-white rounded-full">
    Count: <span x-text="count"></span>
  </button>
</div>
```

For complex state, define a function and register it before Alpine boots:
```html
<script>
  function appState() {
    return {
      items: [],
      selected: null,
      init() { this.$watch('selected', v => console.log(v)); },
    };
  }
</script>
<div x-data="appState()">…</div>
```

### 3. Native browser APIs — reach for these before any library

| Feature | API | When |
|---|---|---|
| Overlays, menus, panels | Popover API (`popover` attr + `popovertarget`) | Non-blocking contextual content |
| Modal confirmation | `<dialog>` + `.showModal()` | Blocking decision |
| Animated state change | `document.startViewTransition()` | Panel swap, route-like nav, before/after reveal |
| Clipboard | `navigator.clipboard.writeText()` | Copy prompt, export |
| Persistence | `localStorage` | User saves state across sessions |
| URL state | `URLSearchParams` | Shareable filtered views |
| Disclosure | `<details><summary>` | Low-stakes collapse |
| Drag/drop | HTML5 drag API | Reorder lists, kanban |

> **Alpine plugins** extend the stack for specific patterns. Load plugins before Alpine core (all deferred). See `references/ui-polish.md` for Sort, Persist, Collapse, and Anchor patterns.

Always wrap `startViewTransition` and `showPopover` in feature checks:
```js
const update = () => { /* state change */ };
document.startViewTransition ? document.startViewTransition(update) : update();
```

---

## Artifact catalog — route to the right type

| Task | Type | thariqs example |
|---|---|---|
| Compare N approaches side-by-side | Comparison / exploration | `01-exploration-code-approaches.html` |
| Explore design directions visually | Design explorer | `02-exploration-visual-designs.html` |
| Implementation plan with milestones | Spec / planning doc | `16-implementation-plan.html` |
| Annotated PR / diff review | Code review | `03-code-review-pr.html` |
| PR writeup for reviewers | Code review writeup | `17-pr-writeup.html` |
| Module map / dependency graph | Architecture diagram | `04-code-understanding.html` |
| Design system tokens showcase | Design tokens | `05-design-system.html` |
| Component variants contact sheet | Component explorer | `06-component-variants.html` |
| Animation / easing tuner | Interactive playground | `07-prototype-animation.html` |
| Clickable flow / prototype | Clickable prototype | `08-prototype-interaction.html` |
| SVG figures / diagrams | SVG diagram | `10-svg-illustrations.html` |
| Flowchart / deploy pipeline | Annotated flowchart | `13-flowchart-diagram.html` |
| Slide deck / presentation | Slideshow deck | `09-slide-deck.html` |
| Feature explainer with collapsibles | Research explainer | `14-research-feature-explainer.html` |
| Concept explainer with live demo | Concept explainer | `15-research-concept-explainer.html` |
| Weekly status / what shipped | Status report | `11-status-report.html` |
| Incident timeline / post-mortem | Incident report | `12-incident-report.html` |
| Ticket triage / drag-to-bucket | Throwaway editor | `18-editor-triage-board.html` |
| Feature flag config editor | Throwaway editor | `19-editor-feature-flags.html` |
| Prompt tuner / template editor | Throwaway editor | `20-editor-prompt-tuner.html` |
| Filterable table / log viewer | Data explorer | agent-html-skills |
| Database schema / ERD | ERD explorer | agent-html-skills |
| Branching concept map | Mind map | agent-html-skills |
| Gantt / roadmap / timeline | Timeline roadmap | agent-html-skills |
| Brainstorm N-variant grid | Brainstorm grid | agent-html-skills |
| Local-first single-user app (SQLite, OPFS, no backend) | Local-first app | `templates/local-first-app/` |

---

## HTML output foundation

These rules apply to every artifact. Per-type rules above win on conflict; everything else here is non-negotiable.

**Write a real `.html` file — never inline-render in chat.** Every artifact is a file on disk (`<topic>-<kind>.html`), opened in a browser. Not a fenced ```` ```html ```` block, not a canvas widget. Inline rendering loses clipboard/network access, breaks dark-mode themes, and can't run the submit handler.

**Self-contained.** No build step, no npm, no external runtime. Tailwind CDN, Alpine CDN, and Google Fonts are the only external loads permitted. Everything else — JS logic, SVG, data — inline.

**Mobile-responsive.** Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`). Collapse to single column under `sm`. Artifacts get shared on phones during incidents and commutes.

**Semantic HTML.** Code in `<pre><code>`. Tables in `<table>`. Diagrams as inline `<svg>`. The reader must be able to copy any value or label out of the artifact.

**No `innerHTML` from variables.** Use `textContent` for text, Alpine's `x-text` for reactive text, and `document.createElement` + `appendChild` for dynamic structure. `innerHTML` from a variable is an XSS vector and trips security hooks in Claude Code and other harnesses. Static literal markup is fine.

**SVG text doesn't wrap — size the shape to the label.** For variable-length labels use `<foreignObject width="W" height="H">` with an HTML `<div>` inside. Plain `<text>` only for short fixed labels.

**Deliberate aesthetic — not the generic AI look.** No default purple gradient + Inter + three centered feature cards. Match visual direction to domain: utilitarian for ops artifacts, editorial for reports, engineering for diagrams. Pick a type pairing and commit. Tailwind's type scale and color system make this easy — use it intentionally.

**Accessible by default.** Body text meets WCAG AA contrast. Interactive controls keyboard-reachable with visible focus rings (`focus-visible:ring-2`). Status conveyed by shape/label, not color alone.

**Print-readable.** `Cmd+P` should produce something usable. Use Tailwind's `print:` variant to handle dark backgrounds and clipped content.

**Timestamp in footer** for any artifact someone might revisit — specs, diagrams, reports, roadmaps. One-shot editors and ephemeral playgrounds can omit.

**Filename is the artifact name.** `<topic>-<kind>.html`. Not `output.html`.

**Never start blank.** Pre-populate with sensible defaults, presets, or sample data. Empty playgrounds feel broken.

---

## Alpine patterns for common artifact needs

### Slide navigation (decks)
```html
<div x-data="{ slide: 0, slides: 10 }">
  <div x-show="slide === 0" x-transition>…slide 1…</div>
  <div x-show="slide === 1" x-transition>…slide 2…</div>
  <div class="fixed bottom-4 right-6 font-mono text-sm text-gray-400"
       x-text="`${slide + 1} / ${slides}`"></div>
  <div @keydown.arrow-right.window="if(slide < slides-1) slide++"
       @keydown.arrow-left.window="if(slide > 0) slide--" tabindex="-1"></div>
</div>
```

For snap-scroll decks, use View Transitions on slide change:
```js
next() {
  const go = () => this.slide = Math.min(this.slide + 1, this.slides - 1);
  document.startViewTransition ? document.startViewTransition(go) : go();
}
```

### Popover with Alpine
```html
<button popovertarget="info-panel" class="text-sm underline">Details</button>
<div id="info-panel" popover class="bg-white rounded-xl shadow-xl p-6 max-w-sm">
  <p x-text="selectedItem?.description"></p>
</div>
```

For dynamic content, set `selected` then show:
```js
openPanel(item) {
  const update = () => {
    this.selected = item;
    this.$nextTick(() => this.$refs.panel.showPopover?.());
  };
  document.startViewTransition ? document.startViewTransition(update) : update();
}
```

### Tabs / panel switching with View Transitions
```html
<div x-data="{ tab: 'overview' }">
  <nav class="flex gap-2 border-b border-gray-200 mb-6">
    <button @click="switchTab('overview')" :class="tab === 'overview' ? 'border-b-2 border-orange-500' : ''"
            class="px-4 py-2 text-sm font-mono">Overview</button>
    <button @click="switchTab('details')" :class="tab === 'details' ? 'border-b-2 border-orange-500' : ''"
            class="px-4 py-2 text-sm font-mono">Details</button>
  </nav>
  <div x-show="tab === 'overview'" x-transition>…</div>
  <div x-show="tab === 'details'" x-transition>…</div>
</div>
```
```js
switchTab(name) {
  const go = () => this.tab = name;
  document.startViewTransition ? document.startViewTransition(go) : go();
}
```

### Copy to clipboard
```html
<button @click="copy()" x-text="copied ? 'Copied!' : 'Copy'" class="…"></button>
```
```js
{ copied: false,
  async copy() {
    await navigator.clipboard.writeText(this.output);
    this.copied = true;
    setTimeout(() => this.copied = false, 1500);
  }
}
```

### Drag-and-drop (throwaway editors)
Use the HTML5 drag API with Alpine:
```html
<div x-data="kanban()">
  <template x-for="col in cols" :key="col.id">
    <div @dragover.prevent @drop="drop($event, col.id)"
         class="flex-1 bg-gray-50 rounded-xl p-4 min-h-48">
      <template x-for="card in col.cards" :key="card.id">
        <div :draggable="true" @dragstart="dragStart($event, card.id, col.id)"
             class="bg-white rounded-lg p-3 mb-2 shadow-sm cursor-grab active:cursor-grabbing">
          <span x-text="card.title"></span>
        </div>
      </template>
    </div>
  </template>
</div>
```

### Live filter / search
```html
<div x-data="{ q: '', items: [...] }">
  <input x-model="q" placeholder="Filter…" class="w-full border rounded-lg px-3 py-2">
  <template x-for="item in items.filter(i => i.name.toLowerCase().includes(q.toLowerCase()))" :key="item.id">
    <div x-text="item.name"></div>
  </template>
</div>
```

---

## Submit pipeline (server or clipboard)

For interactive artifacts whose value is what the user submits back.

| Mode | When |
|---|---|
| **Server** | Local Claude Code session with shell access. Run `html-skills-listen` skill first; it returns a URL. Inject `window.__CLAUDE_SUBMIT_URL__ = '<url>'` into the artifact. |
| **Clipboard** | Cloud / web / sandboxed, or whenever server mode isn't available. Always works; user pastes JSON back. |

### Submit handler pattern

Inline the submit handler and call `submitToClaude(payload)`:
```html
<button @click="submit()" class="px-6 py-3 bg-slate-900 text-white rounded-full font-mono text-sm">
  Submit to Claude
</button>
<script>
  // Paste contents of submit-handler.js here (from agent-html-skills)
  // window.__CLAUDE_SUBMIT_URL__ = '…'; // server mode only
  function submitToClaude(payload) {
    const json = JSON.stringify(payload, null, 2);
    if (window.__CLAUDE_SUBMIT_URL__) {
      fetch(window.__CLAUDE_SUBMIT_URL__, { method: 'POST', body: json }).catch(() => fallback(json));
    } else {
      fallback(json);
    }
    function fallback(text) { navigator.clipboard.writeText(text); }
  }
</script>
```

Standard payload envelope — use the same shape across all types:
```json
{
  "skill": "playground",
  "kind":  "kanban-reorder",
  "data":  { },
  "version": 1
}
```

One Submit button per artifact. Don't fork into "Copy as JSON" and "Copy as prompt" — the envelope IS the export.

---

## Per-type guidance

### Slide decks
Keyboard nav: `→`/`Space` next, `←` previous, `F` fullscreen, `Esc` exit. Hash-based deep links (`#3`). Progress counter in corner. Fixed 16:9 ratio, letterboxed. Slide types: title, one-idea, code, diagram, comparison (use sparingly), demo (live HTML in slide), section break, recap. Speaker notes toggled with `N` — written in `<aside>` inside each `<section>`. Use View Transitions on slide change. Pick one aesthetic (editorial / engineering / brutalist / documentary) and commit.

### Throwaway editors
Pre-populate with the user's actual data — never make them paste it again. Export is non-negotiable; always end with a Submit or Copy button. Patterns: drag-and-drop board (kanban triage), form-based config with dependency warnings, side-by-side prompt/template editor, dataset curator (approve/reject with keyboard shortcuts `j`/`k`/`y`/`n`), annotation tool. Keyboard shortcuts for anything involving more than ~10 items. Show counts ("37 to review, 12 approved").

For drag-and-drop reordering, use `x-sort` / `@alpinejs/sort` — it replaces the HTML5 drag API entirely and handles kanban boards and reorderable lists with far less code. See `references/ui-polish.md` § Alpine plugins.

### Interactive playgrounds
Real-time updating preview as the user manipulates controls. Sliders/dropdowns/toggles; always show current value as text next to the control with units ("220ms", "1.04×"). Submit sends tuned values back. Patterns: single-component tuner (preview + controls), algorithm parameter explorer (synthetic visualization of behavior), multi-parameter sweep (grid of combinations).

### Comparison / brainstorm grid
N variants side-by-side (2–4 columns). Each column: variant title, the rendered thing, pro/con/tradeoff callouts. Submit sends the selected variant + rationale. Don't use this for things that require sequential reading — use a spec doc instead.

### Spec / planning docs
Milestones on a visual timeline with package/surface tags. Data flow diagram (inline SVG). Inline mockups. Risk table. Open questions section. Timestamp in footer. Skimmable on a phone in a meeting.

### Code review artifacts
Annotated diff with margin notes, severity tags, jump links. PR writeup: motivation, before/after, file-by-file tour with the *why*, where to focus review. Module map: boxes-and-arrows with hot path highlighted, entry points listed.

### Diagrams / flowcharts
Inline SVG — real `<g>` and `<path>`, not PNGs. SVG text in `<foreignObject>` for variable-length labels. Annotated flowchart: click any node to see details in a Popover. Architecture map: zoom/pan with CSS `transform`. Sequence diagrams: time flows top-to-bottom, actors as columns.

### Research explainers / reports
TL;DR box at top. Collapsible sections: prefer `x-collapse` from `@alpinejs/collapse` over `x-show` + manual height CSS — it animates height from `0` to `auto` without fixed pixel values. Fall back to `<details>` for truly low-stakes disclosure. Tabbed code samples. Glossary with hover definitions (Popover). Status reports: chart for key metric (inline SVG or simple CSS bar), colored timeline. Incident reports: minute-by-minute timeline, log excerpts, follow-up checklist.

### Data explorer
Filterable table with faceted search. `x-model` bound search input + computed filter. Column sort. Row click opens detail in Popover or `<dialog>`. Export filtered view as CSV or JSON. Log viewers: monospace, line numbers, severity coloring.

### Design tokens showcase
Color swatches with hex/var displayed. Type scale specimens. Spacing scale with visual bars. Component contact sheet with all variants. Copy-on-click for any token value.

### Mind map
Branching SVG tree, centered root. Click node to expand/collapse. Submit sends the full tree as a nested JSON structure.

### Timeline / roadmap
Gantt-style: swim lanes per team/area, bars proportional to duration, dependency arrows. Click milestone to open detail in Popover. Export as markdown table.

### Local-first app
Use the template at `templates/local-first-app/` as the starting point — copy it, don't reconstruct from scratch. Architecture: all data in SQLite via PGlite + OPFS (persists in browser, no server). Worker thread handles all DB ops via `{ action, payload }` postMessage envelope; Alpine component in `index.html` wires UI to worker. Key features already scaffolded: timer, manual entry, period filter, project summary, entries list, edit dialog, CSV/JSON export, toast notifications. Add or remove features from there.

### ERD explorer
Table boxes with column names + types. Relationship lines with cardinality labels. Click table to highlight its relations. Pan/zoom with CSS transform.

---

## AI workflow pattern

For org-safe AI labs, default to copy/paste mode:
- app provides prompt
- participant uses approved AI tool
- participant pastes result back
- app helps compare, score, or export

Do not call model APIs from static pages unless the user explicitly accepts API-key, auth, CORS, and data-handling implications.

## Output contract

Every playground makes these obvious in 5 seconds:
- what it is
- what to do first
- what changes when users interact
- what output they leave with

## Mandatory reads

- Read `references/html-artifacts.md` for design system tokens, scannability rules, and GitHub Pages delivery.
- Read `references/local-first.md` before adding persistence, import/export, or AI/model integration.
- Read `references/ui-polish.md` for Popover, View Transitions, Alpine, and motion rules.

## NEVER

- **NEVER build a backend for a one-user or workshop artifact.**
  Use static files, browser storage, import/export, and copy/paste flows.

- **NEVER put API keys in browser code.**
  Use copy/paste with approved tools, or add a proper backend only after security review.

- **NEVER start with a blank control panel.**
  Provide sensible defaults, presets, or a sample scenario already loaded.

- **NEVER make interaction decorative.**
  Use interaction to compare, reveal, configure, copy, validate, or export.

- **NEVER hide the user's takeaway inside UI state.**
  Provide copy/export for prompts, decisions, summaries, or markdown.

- **NEVER write `<style>` blocks for things Tailwind covers.**
  Only `<style>` for SVG strokes, scroll-snap, `@keyframes`, `view-transition-name`.

- **NEVER use `innerHTML` from a variable.**
  Use `x-text`, `textContent`, or `createElement` + `appendChild`.

- **NEVER write manual DOM wiring when Alpine can do it.**
  If you're writing `document.querySelector` + `addEventListener` for something Alpine's `x-model` / `@click` / `x-show` handles, stop and use Alpine.

- **NEVER inline-render in chat.** Always write the file.
