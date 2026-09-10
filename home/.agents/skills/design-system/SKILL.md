---
name: design-system
description: >
  Per-project design-system discipline for UI work, following the Vercel design.md pattern.
  Use FIRST for any UI/frontend/design task (pages, components, prototypes, slides):
  locate and follow the project's own design system (DESIGN.md + stylesheet + primitives)
  before writing any UI; if none exists, scaffold one first. Triggers: design, UI,
  frontend, brand, tokens, styling, mockup, landing page, component, screenshot-to-UI, redline.
---

# Design System (per-project discipline, design.md pattern)

Pi has no taste by default — taste lives in the **project's** design system, not in a
global default. The proven shape (Vercel's approach) is a three-part system:

1. **`DESIGN.md`** — prose judgment: reader and task, page framing, copy rules,
   composition, and named anti-patterns.
2. **A stylesheet with a documented class/token vocabulary** — repeatable mechanics
   (typography, spacing, tables, stat strips, headers) as named classes the agent
   composes with. The agent uses the names; it never invents CSS and never needs to
   read the stylesheet itself.
3. **Deterministic checks** — mechanical failures (table ignoring available width,
   missing focus states) checked in code, not prose.

## When to Use

Any task producing visible UI in a repository: pages, components, emails, slides,
prototypes, or screenshot-to-UI matching.

## Procedure

1. **Discover the project's design system before writing UI.** Look for, in order:
   `DESIGN.md`/`design.md` (+ its stylesheet URL or `tokens.css`), `design/tokens.*`,
   a theme config (Tailwind config, global CSS custom properties), or a component
   library (`src/components/ui/`, shadcn, internal primitives). OpenDesign projects:
   the curated design system lives under the project's `.od/` resources.
2. **If a system exists → it is the only source of truth.** Build with its documented
   class/token names instead of inventing CSS. Extend the vocabulary deliberately;
   never override project tokens with personal preferences.
3. **If no system exists → scaffold one first**, as small committed artifacts:
   - `DESIGN.md` at repo root: scope, reader and task, **observable** decisions, and
     an anti-patterns section. Start from `references/default-tokens.md` and replace
     placeholders with values derived from the project's actual references/brand.
   - A stylesheet (`design/brand.css` or equivalent) packaging the tokens and
     primitives as named classes, documented in `DESIGN.md`.
   - Confirm direction with the user if there is no source to derive from.
4. **Write observable rules, never adjectives.** "Evidence tables use the full
   available width" — not "make the table less cramped." "Lead with the
   recommendation" — not "make it punchy." A rule that can't be checked can't be
   followed reliably.
5. **Structure around the reader's job.** Same tokens, different page structure per
   artifact: a planning page puts controls first; a proposal leads with the
   recommendation. One design system ≠ one template.
6. **Gather references before building** — desktop AND mobile, plus
   hover/empty/loading states where they exist. Map reference → tokens; call out gaps.
7. **Build mobile-first**, then 768px / 1024px / 1280px, using only project classes/tokens.
8. **Verify in a real browser** (agent-browser): screenshot at 390/768/1280 and
   compare against references. Iterate on the comparison, not on "it compiles".

## Anti-patterns (name them in every DESIGN.md)

Give recurring generated-design failures explicit names in the project's `DESIGN.md`;
named patterns are recognized and avoided far more reliably than vibes. Include at
minimum: generic-SaaS-dashboard drift, centered-everything, decorative gradients
substituting for hierarchy, truncated/width-starved tables, equal-weight card grids
that bury the primary action, emoji-as-icon.

## Corrections loop

When the user corrects a design output, encode it in the narrowest place that can
enforce it, then update guidance — don't hand-tune the generated page:

- Judgment/composition → prose rule in `DESIGN.md`.
- Repeatable mechanics → a named class in the stylesheet.
- Mechanical failure → deterministic check (agent-browser screenshot assertions).
- Keep a fixed baseline scenario to A/B new guidance against; keep the first output.

## Pitfalls

- Do not apply the default scaffold's placeholder values to a real project — they are
  a template to be replaced, not a brand.
- Do not start UI work before steps 1–3 resolve; that's how generic AI output happens.
- Do not describe style in adjectives when an observable rule is possible.
- Real reference images beat adjectives — "clean and modern" is not a spec.
- Check state coverage (hover, focus-visible, disabled, empty, error), not just the happy path.
- If the project has a component primitive or documented class, reuse it before creating a new one.

## Verification

- No hardcoded hex/px values or bespoke CSS outside the project's stylesheet/tokens.
- The repo contains an explicit design system (`DESIGN.md` + stylesheet) that the
  UI work references by name.
- `DESIGN.md` rules are observable, and its anti-patterns are named.
- Screenshots at 390/768/1280 match references within reasonable tolerance.
- Text contrast AA; focus-visible on all interactives.
