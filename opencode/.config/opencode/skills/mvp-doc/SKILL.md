---
name: mvp-doc
description: Create an MVP (Minimum Viable Product) document for a new project idea. Covers What, Why, How, and Competition through a collaborative conversation. Use when the user wants to define, scope, or brainstorm an MVP, or says things like "I have a project idea", "let's define an MVP", "help me scope a project".
---

# MVP Document Creator

## Purpose

Guide the user through defining an MVP document for a new project idea via collaborative conversation. The output is an `MVP.md` file in the project root.

## Process

### 1. Gather Context

Start by understanding the user's idea. Ask about:

- **The core idea** — What does it do? What problem does it solve?
- **Motivation** — Why does this need to exist? What's the pain point?
- **Existing work** — Any prior projects, prototypes, or inspiration?
- **Target user** — Who is this for? (Can be "just me" for personal tools)

Don't ask all at once — have a natural conversation. Let the user explain in their own words and extract structure from that.

### 2. Research (if applicable)

If the user references existing projects or repos, read their READMEs or docs to understand prior work and how it connects to the new idea.

### 3. Draft the MVP Document

Write `MVP.md` in the project root with these sections:

#### What
- Core features for MVP (keep it tight — what's the smallest useful version?)
- What it is NOT (set boundaries early)

#### Why
- The problem and pain points
- Who it's for
- Why existing solutions fall short

#### How
- Technical approach and architecture
- Data sources / integrations and their accessibility/difficulty
- Schema or data model (if relevant)
- Suggested tech stack (based on user's experience and project needs)
- Architecture diagram (ASCII)

#### Competition
- Table of existing tools/products in the space
- How this project differs from each
- The gap in the market

#### MVP Milestones
- Ordered list of incremental milestones
- Each milestone should be independently shippable/testable

#### Open Questions
- Unresolved decisions as a checklist
- Mark answered questions as `[x]` during the conversation

### 4. Iterate

After the initial draft, continue the conversation:

- Let the user add, remove, or reshape sections
- Update the doc in place as decisions are made
- Check off open questions as they're resolved
- Keep the doc as the single source of truth

## Guidelines

- **Be opinionated but flexible** — Suggest structure and recommendations, but defer to the user's vision
- **Keep MVP scope small** — Push back on feature creep. The goal is the smallest useful version.
- **Surface hard problems early** — Data access, API limitations, auth complexity — flag these upfront
- **Use the user's language** — Mirror their terminology, don't over-formalize
- **Architecture should match the idea's maturity** — Don't over-engineer the doc for a nascent idea
- **Prefer plugin/extensible designs** — When the project involves multiple integrations or data sources, suggest a plugin architecture so they can be added incrementally
