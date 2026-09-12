---
name: init-design-system
description: "One-shot bootstrap that CREATES a project-local design-system skill (DESIGN.md judgment + brand.css vocabulary + named anti-patterns) in a repo that lacks one. Use when starting UI/design work in a repo with no design system, or when asked to set up brand/tokens/design-system for a project. For ongoing UI work the generated LOCAL skill is the source of truth."
---

# Init Design System (bootstrap)

Pi has no taste by default — taste lives in the **project's** design system, encoded as a
**local skill inside that repo**, not in any global default. This skill is a one-shot
bootstrap: run it once per repo to generate that local skill, then it gets out of the way.

The generated local skill follows the proven Vercel `design.md` pattern — three parts:

1. **Prose judgment** — reader and task, page framing, observable rules, named anti-patterns.
2. **A stylesheet with a documented class/token vocabulary** — repeatable mechanics as
   named classes the agent composes with; the agent never needs to read the CSS.
3. **Deterministic checks** — mechanical failures (width-starved tables, missing focus
   states) caught via browser screenshots, not prose.

## When to Use

- Starting UI work in a repo that has no design-system skill.
- Asked to "set up the design system", brand tokens, or `DESIGN.md` for a project.
- NOT for ongoing UI work in a repo that already has one — that skill governs.

## Procedure

1. **Confirm there is nothing to adopt first.** Look for an existing local
   design-system skill (`.pi/skills/`, `.agents/skills/`), `DESIGN.md`/`design.md` at the
   repo root, a theme config (Tailwind config, global CSS custom properties), or a
   component library (`src/components/ui/`, shadcn). OpenDesign projects: the curated
   design system lives under `.od/` resources. If found → stop; use it as the only
   source of truth and never override with global defaults.
2. **Gather the brand inputs**: existing site, logo, marketing assets, or reference
   screenshots (desktop AND mobile, plus hover/empty/loading states). If none exist,
   confirm direction with the user before inventing anything.
3. **Generate the local skill**, versioned with the code, under `.agents/skills/` —
   the agent-agnostic Agent Skills standard location, discoverable by Pi, Claude Code,
   Codex, and other compatible agents:
   - `.agents/skills/design-system/SKILL.md` — frontmatter (name: design-system, description
     with the repo's UI triggers: pages, components, prototypes, slides), then the
     project's judgment: scope, reader and task, **observable** decisions, composition
     rules, the class/token vocabulary documentation, and a named anti-patterns section.
   - `.agents/skills/design-system/references/` — `brand.css`: copy this skill's
     `references/default-brand.css` and REPLACE every placeholder with the project's
     real brand values from step 2. Pages link this stylesheet; the agent uses only the
     documented class names.
   - `DESIGN.md` at the repo root pointing at the local skill (compat with other agents
     and tools that look for it).
4. **Write observable rules, never adjectives.** "Evidence tables use the full
   available width" — not "make the table less cramped." A rule that can't be checked
   can't be followed reliably.
5. **Name the anti-patterns.** Named generated-design failures are recognized and
   avoided far more reliably than vibes. Include at minimum: generic-SaaS-dashboard
   drift, centered-everything, decorative gradients substituting for hierarchy,
   truncated/width-starved tables, equal-weight card grids that bury the primary
   action, emoji-as-icon.
6. **Note the reader's-job rule** in the local skill: same tokens, different page
   structure per artifact — a planning page puts controls first; a proposal leads with
   the recommendation. One design system ≠ one template.
7. **Commit as its own commit** before any UI code, and tell the user the local skill
   now governs UI work in this repo.

## After init (governance — lives in the local skill)

- Build mobile-first, then 768/1024/1280, using only local classes/tokens.
- Verify in a real browser (agent-browser): screenshot at 390/768/1280, compare against
  references; iterate on the comparison, not on "it compiles".
- Corrections land in the narrowest enforcing place — judgment → local skill prose;
  repeatable mechanics → named class in `brand.css`; mechanical failure →
  deterministic check. Never hand-tune the generated page.
- Keep a fixed baseline scenario to A/B new guidance against; keep the first output.

## Pitfalls

- Never ship `references/default-brand.css` placeholder values as a real brand — it is
  a template to be replaced.
- Do not init into a repo that already has a design system; adopt it instead.
- Real reference images beat adjectives — "clean and modern" is not a spec.
- Check state coverage (hover, focus-visible, disabled, empty, error), not just the
  happy path.

## Verification

- Repo contains `.agents/skills/design-system/` (SKILL.md + `brand.css` in references/) and a
  root `DESIGN.md`, all committed.
- No placeholder token values remain in the generated `brand.css`.
- The generated SKILL.md's rules are observable and its anti-patterns are named.
- A follow-up UI task in the repo loads the local skill (not this bootstrap).
