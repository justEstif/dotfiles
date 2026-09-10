---
name: design-system
description: >
  Per-project design-system discipline for UI work. Use FIRST for any UI/frontend/design
  task (pages, components, prototypes, slides): locate and follow the project's own design
  system (DESIGN.md, tokens file, component library) before writing any UI; if none exists,
  scaffold one first. Triggers: design, UI, frontend, brand, tokens, styling, mockup,
  landing page, component, screenshot-to-UI, redline.
---

# Design System (per-project discipline)

Pi has no taste by default — taste lives in the **project's** design system, not in a
global default. This skill's job is to make sure UI work always runs against a real,
explicit system: never invent tokens ad hoc.

## When to Use

Any task producing visible UI in a repository: pages, components, emails, slides,
prototypes, or screenshot-to-UI matching.

## Procedure

1. **Discover the project's design system before writing UI.** Look for, in order:
   `DESIGN.md`, `design/tokens.*`, `src/styles/tokens.*`, a theme config
   (Tailwind config, CSS custom properties in a global stylesheet), or a component
   library (`src/components/ui/`, shadcn, internal primitives). OpenDesign projects:
   the curated design system lives under the project's `.od/` resources.
2. **If a system exists → it is the only source of truth.** Reuse its tokens and
   primitives; extend the token table deliberately rather than hardcoding values.
   Never override project tokens with personal preferences or "the usual" values.
3. **If no system exists → scaffold one first**, as a small committed artifact:
   create `DESIGN.md` at the repo root from
   `references/default-tokens.md` (neutral placeholder scaffold), then replace
   placeholders with values derived from the project's actual references/brand
   (existing site, logo, marketing assets, or screenshots the user supplies).
   Confirm the direction with the user if there is no source to derive from.
4. **Gather references before building** — desktop AND mobile, plus
   hover/empty/loading states where they exist. Map reference → tokens; call out gaps.
5. **Build mobile-first**, then 768px / 1024px / 1280px breakpoints, using only
   project tokens.
6. **Verify in a real browser** (agent-browser): screenshot at 390/768/1280 and
   compare against references. Iterate on the comparison, not on "it compiles".

## Pitfalls

- Do not apply the default scaffold's placeholder values to a real project — they are
  a template to be replaced, not a brand.
- Do not start UI work before step 1–3 resolve; that's how generic AI output happens
  (defaults, centered everything, purple gradients, no hierarchy).
- Real reference images beat adjectives — "clean and modern" is not a spec.
- Check state coverage (hover, focus-visible, disabled, empty, error), not just the happy path.
- If the project uses a component primitive, reuse it before creating a new one.

## Verification

- No hardcoded hex/px values outside the project's token definitions.
- The repo contains an explicit design system (`DESIGN.md` or equivalent) that the
  UI work references.
- Screenshots at 390/768/1280 match references within reasonable tolerance.
- Text contrast AA; focus-visible on all interactives.
