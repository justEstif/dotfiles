---
name: design-system
description: >
  Bootstrap for per-project design-system skills, following the Vercel design.md pattern.
  Use FIRST for any UI/frontend/design task (pages, components, prototypes, slides): the
  project's design system should live as a LOCAL skill in that repo (DESIGN.md judgment +
  brand.css vocabulary + named anti-patterns). If it exists, use it; if not, this skill's
  job is to create it — then get out of the way. Triggers: design, UI, frontend, brand,
  tokens, styling, mockup, landing page, component, screenshot-to-UI, redline.
---

# Design System (bootstrap → local skill)

Pi has no taste by default — taste lives in the **project's** design system, encoded as a
**local skill inside that repo**, not in any global default. This global skill is a
bootstrap: it ensures a local design-system skill exists and is followed. It is never the
source of truth itself.

## When to Use

Any task producing visible UI in a repository: pages, components, emails, slides,
prototypes, or screenshot-to-UI matching.

## Procedure

1. **Look for a local design-system skill in the repo** (loaded automatically by Pi):
   `.pi/skills/`, `.agents/skills/`, or `SKILL.md`-style design packages. Also accept a
   bare `DESIGN.md`/`design.md` (+ its stylesheet) at the repo root. OpenDesign projects:
   the curated design system lives under the project's `.od/` resources.
2. **If it exists → follow it as the only source of truth.** Build with its documented
   class/token names; extend its vocabulary deliberately; never override with global or
   personal defaults. The remaining steps do not apply.
3. **If none exists → bootstrap one** (this skill's core job). Create a local skill in
   the repo, versioned with the code:
   - `.pi/skills/design-system/SKILL.md` — frontmatter (name, description with UI
     triggers), then the project's judgment: scope, reader and task, **observable**
     decisions, composition rules, the class/token vocabulary documentation, and a
     named anti-patterns section.
   - `.pi/skills/design-system/references/brand.css` — copy
     `references/default-brand.css` and REPLACE placeholders with the project's real
     brand, derived from its references (existing site, logo, marketing assets, or
     screenshots the user supplies). Pages link this stylesheet; the agent never needs
     to read it — only the class names documented in SKILL.md.
   - `DESIGN.md` at the repo root pointing at the local skill (compat with other
     agents and tools that look for it).
   - Confirm brand direction with the user if there is no source to derive from.
   - Commit it as its own commit before any UI code.
4. **Write observable rules, never adjectives.** "Evidence tables use the full
   available width" — not "make the table less cramped." A rule that can't be checked
   can't be followed reliably.
5. **Structure around the reader's job.** Same tokens, different page structure per
   artifact: a planning page puts controls first; a proposal leads with the
   recommendation. One design system ≠ one template.
6. **Gather references before building** — desktop AND mobile, plus
   hover/empty/loading states where they exist. Map reference → tokens; call out gaps.
7. **Build mobile-first**, then 768px / 1024px / 1280px, using only the local skill's
   classes/tokens.
8. **Verify in a real browser** (agent-browser): screenshot at 390/768/1280 and compare
   against references. Iterate on the comparison, not on "it compiles".

## Anti-patterns (the local skill must name them)

Give recurring generated-design failures explicit names in the local skill; named
patterns are recognized and avoided far more reliably than vibes. Include at minimum:
generic-SaaS-dashboard drift, centered-everything, decorative gradients substituting
for hierarchy, truncated/width-starved tables, equal-weight card grids that bury the
primary action, emoji-as-icon.

## Corrections loop

When the user corrects a design output, encode it in the narrowest place that can
enforce it, then update the local skill — don't hand-tune the generated page:

- Judgment/composition → prose rule in the local skill.
- Repeatable mechanics → a named class in `brand.css`.
- Mechanical failure → deterministic check (agent-browser screenshot assertions).
- Keep a fixed baseline scenario to A/B new guidance against; keep the first output.

## Pitfalls

- Never apply `references/default-brand.css` placeholder values to a real project —
  it is a template to be replaced, not a brand.
- Do not start UI work before steps 1–3 resolve; that's how generic AI output happens.
- Do not describe style in adjectives when an observable rule is possible.
- Real reference images beat adjectives — "clean and modern" is not a spec.
- Check state coverage (hover, focus-visible, disabled, empty, error), not just the happy path.
- If the local skill defines a class or primitive, reuse it before creating a new one.

## Verification

- UI work in the repo references the local design-system skill (visible in loaded
  skills), not this bootstrap.
- The repo's local skill + `brand.css` are committed, and no hardcoded hex/px values
  or bespoke CSS appear outside `brand.css`.
- Local skill rules are observable, and its anti-patterns are named.
- Screenshots at 390/768/1280 match references within reasonable tolerance.
- Text contrast AA; focus-visible on all interactives.
