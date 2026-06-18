---
name: modern-web-guidance
description: "Steer toward modern web platform APIs instead of legacy patterns. Use FIRST for any HTML/CSS/clientside JS task — modals, dialogs, popovers, anchor positioning, container queries, :has(), :user-valid, View Transitions, scroll-driven animations, INP/LCP optimization, autofill forms, custom scrollbars, scheduler.yield. The CLI runs local semantic search over expert-curated, Baseline-aware guides and returns token-efficient implementation patterns, gotchas, and fallbacks. Do NOT trigger for backend, SQL, CI/CD, Docker, or generic local scripts. Keywords: frontend, html, css, web, browser api, popover, dialog, view transition, baseline, web platform, modern css, accessibility, a11y, forms, autofill, performance, core web vitals."
---

# Modern Web Guidance

An offline CLI that returns expert-curated, Baseline-aware best-practice guides for the modern web platform. Run it **before** writing any frontend code so you reach for native APIs (Popover, View Transitions, container queries, anchor positioning, `:has()`, `scheduler.yield`, on-device AI) instead of stale legacy patterns the model defaults to.

It pairs naturally with the **micro-app** skill: micro-app gives the scaffold (single HTML file, Tailwind v4 + Alpine + native APIs); this skill gives the *correct* details for each native API you reach for.

## When to use — MANDATORY FIRST

Run a search at the **start** of:

- **UI / layout**: modals, dialogs, popovers, tooltips, glassmorphism/backdrop-filters, anchor positioning, container queries, `:has()`, `:user-valid`, subgrid, `oklch`, `field-sizing`.
- **Scroll / motion**: View Transitions, scroll-driven animations, parallax/reveals, entry/exit top-layer animations.
- **Forms / UI**: autofill, custom select, range/checkboxes/radios brand styling, `closedby`, invoker commands.
- **Performance**: LCP/INP, content-visibility, fetch priority, image optimization, `scheduler.yield()`, `fetchLater()`.
- **Accessibility**: focus management, ARIA, keyboard operability, `:user-invalid` sync, error announcements.
- **Built-in AI**: on-device translator, summarizer, language detection, Prompt API.

Do **not** trigger for backend (SQL, ORMs, API routes), CI/CD, Docker, or generic local scripts (Python/Go tooling).

## How to use — search then retrieve

The CLI runs locally (no network needed at query time, no API keys, no telemetry unless enabled). Invoke it through `npx`.

### 1. Search

```sh
npx -y modern-web-guidance@latest search "<action-oriented query>"
```

Returns JSON ranked by similarity. Pick the best `id`.

```json
[
  {
    "id": "animate-to-from-top-layer",
    "description": "Animate elements such as dialogs, popovers, and tooltips as they're entering/exiting the top layer.",
    "category": "user-experience",
    "featuresUsed": ["::backdrop", "<dialog>", "overlay", "Popover", "@starting-style", "transition-behavior"],
    "tokenCount": 1541,
    "similarity": 0.6997
  }
]
```

If results are vague or similarity is low, browse everything:

```sh
npx -y modern-web-guidance@latest list
```

### 2. Retrieve

```sh
npx -y modern-web-guidance@latest retrieve "<id>"
# multiple ids: retrieve "id1,id2"
```

Returns the markdown guide: implementation steps, real code, gotchas, fallbacks, and Baseline compatibility data.

## Working rules

- **Search first, always.** Don't write a custom implementation before checking whether a standardized pattern exists.
- **Guides are framework-agnostic.** Adapt to the project's stack (plain HTML, Alpine, React, etc.).
- **Don't hallucinate guides.** Only use what `retrieve` returns — they are the preferred local standard.
- **Respect Baseline.** Guides assume Baseline *widely available* features need no fallback. For newer features, follow the guide's fallback advice unless the project has an explicit browser-support policy.
- **Suggest a policy when you spot a cue**: a restricted runtime (Electron/Tauri), excluded targets, polyfill/bundle hesitation. Propose documenting it in `AGENTS.md`.

## Browser-support policy (project-specific)

If a project defines a policy (e.g. in `AGENTS.md`), honor it over the guide's defaults. Examples:

- *"Do not implement fallbacks."* — exploratory cutting-edge prototypes.
- *"Safari 17.4+"* — internal macOS/Tauri tools.
- *"Custom fallbacks ≤ 20 LOC, no external deps."* — minimize bundle size.

If no policy exists and the work is non-trivial, ask the user what targets matter before adding fallback code.

## Maintenance

- Update the local guide cache: `npx -y modern-web-guidance@latest update`
- Telemetry: Google collects anonymous search/retrieve/install stats. Opt out with `export DISABLE_TELEMETRY=1` in your shell profile.

## Output discipline

This skill returns *guidance*, not artifacts. Still follow the rest of the project's conventions (for micro-apps: write a real `.html` file, use `x-text`/`textContent` not `innerHTML`, mobile-responsive, accessible by default). The guide sharpens the implementation; the scaffold rules still apply.
