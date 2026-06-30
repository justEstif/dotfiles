# Agent Skills Catalog

Personal agent skills organized by activation intent. This file is a navigation layer only: skill directories stay flat so agent discovery and existing references keep working.

## Cluster Map

| Cluster              | Use when                                                                                                         | Skills                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Meta / System        | Managing agent behavior, plans, loops, or the skill library itself                                               | `skill-creator`, `find-skills`, `plan`, `loop-engineering`                                                         |
| Think / Decide       | The user needs structured thinking, pushback, goals, strategy, systems analysis, comparison, or decision support | `goal-setting`, `product-strategy`, `systems-thinking`, `parallel-explore`                                         |
| Communicate          | Crafting content that lands with audiences — messages, pitches, landing pages, stakeholder alignment             | `craft-message`                                                                                                    |
| Agent Style          | Governing how the agent itself writes, formats, and frames its output                                            | `output-style`, `caveman`, `argue-position`, `karpathy-guidelines`                                                 |
| Build / Design       | Changing software systems, artifacts, architecture, tests, web UIs, or repo/agent guardrails                     | `tdd`, `software-design`, `repo-guardrails`, `modern-web-guidance`, `micro-app`                                    |
| Tools / Integrations | Operating a specific external tool, platform, or CLI                                                             | `github`, `npm-publish`, `fallow`                                                                                  |
| Archived             | Older, superseded, or invalid skill folders moved out of discovery                                               | `_skills-archive/pk`, `_skills-archive/thought-partner`, `_skills-archive/playground`                              |

## Skills by Cluster

### Meta / System

| Skill              | What it does                                                      | Activate when                                                                                                                |
| ------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `skill-creator`    | Builds, reviews, validates, and improves agent skills.            | Creating/reviewing skills, auditing prompts, checking description drift, applying skill-quality rubric.                      |
| `find-skills`      | Finds and installs skills from the open ecosystem.                | User asks whether a skill exists, how to add capability, or wants skill discovery/installation.                              |
| `plan`             | Creates lightweight ignored Markdown plans.                       | Complex, ambiguous, risky, or multi-session work needs preserved context/rationale.                                          |
| `loop-engineering` | Designs recurring agent loops with state, isolation, and checks.  | Replacing repeated prompting with scheduled/goal-driven automation, worktrees, durable state, connectors, and maker/checker. |

### Think / Decide

| Skill              | What it does                                                                        | Activate when                                                                                                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `goal-setting`     | Turns vague intent into honest, stable, detailed, falsifiable, incremental goals.   | Defining success, choosing direction, prioritizing open-ended work, avoiding scope drift, recovering motivation, or clarifying what the user is actually trying to accomplish.    |
| `product-strategy` | Evaluates product/app direction before and after MVP.                               | Build-or-not decisions, MVP success criteria, product north stars, core-tech leverage, defining constraints, roadmap prioritization, post-MVP pivots, RICE, or opportunity trees. |
| `systems-thinking` | Analyzes organizational, technical, and strategic problems as interacting systems.  | Feedback loops, hidden dependencies, legacy constraints, unknown unknowns, repeated failures, causal loops, debt cascades, or change resistance.                                  |
| `parallel-explore` | Fans out subagents across competing hypotheses or paths, then synthesizes findings. | Wide search is useful: multiple hypotheses, architecture options, tech choices, debugging theories, product paths, or strategy directions need parallel investigation.            |

### Communicate

| Skill           | What it does                                                               | Activate when                                                                                                                                                                                                                         |
| --------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `craft-message` | Makes messages land with audiences and drafts interpersonal communication. | Landing pages, pitches, stakeholder buy-in, proposal framing, or any email/Slack/text where audience shaping or situational strategy matters — disagreements, negotiations, bad news, feedback, apologies, cold outreach, delegation. |

### Agent Style

| Skill                 | What it does                                                                                               | Activate when                                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `output-style`        | Controls how the agent formats output — scannable when needed, prose when not, tone, anti-over-formatting. | Making agent writing clearer/scannable, OR stopping over-formatting, sounding more natural, less corporate.                                                   |
| `caveman`             | Ultra-compressed communication mode. Drops filler while keeping technical accuracy.                        | User asks for caveman mode, fewer tokens, extreme brevity, or `/caveman`.                                                                                     |
| `argue-position`      | Applies neutral, balanced framing when presenting arguments on contested topics.                           | User asks to argue for/against a position, defend a controversial view, discuss politics, ethics, policy, or when the agent handles debated empirical claims. |
| `karpathy-guidelines` | Reduces common LLM coding mistakes with surgical, simple, verifiable coding behavior.                      | Writing, reviewing, or refactoring code where overcomplication, broad edits, or hidden assumptions are risks.                                                 |

### Build / Design

| Skill                 | What it does                                                                                                                | Activate when                                                                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tdd`                 | Guides red-green-refactor test-first development.                                                                           | Building behavior, fixing bugs, or writing integration tests using TDD.                                                                                          |
| `software-design`     | Finds deepening opportunities and designs better modules/APIs.                                                              | Architecture, refactoring, module boundaries, testability, deep modules, shallow modules, or codebase design quality.                                            |
| `repo-guardrails`     | Designs deterministic repo feedback loops — CI, linters, hooks, custom rules, branch protection, logging, and agent safety. | Hardening a repo for agents, reducing AI code drift, encoding design rules as checks, or setting up guardrail loops.                                             |
| `modern-web-guidance` | Steers frontend work toward modern baseline web platform APIs and accessibility/performance patterns.                        | HTML/CSS/client-side JS tasks involving dialogs, popovers, forms, CSS, View Transitions, browser APIs, a11y, or Core Web Vitals.                                 |
| `micro-app`           | Creates polished local-first HTML micro-apps and artifacts.                                                                 | Interactive demos, visual explorers, slide decks, diagrams, planning docs, prompt tools, or static artifacts.                                                    |

### Tools / Integrations

| Skill         | What it does                                  | Activate when                                                                                                     |
| ------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `github`      | Uses GitHub through the `gh` CLI.             | Issues, PRs, reviews, workflow runs, CI status, or GitHub API queries.                                            |
| `npm-publish` | Handles npm publishing and release workflows. | OIDC/trusted publishing, npm release CI, version/tag sync, package publish failures, scoped or monorepo packages. |
| `fallow`      | Analyzes TS/JS codebase health with `fallow`. | Dead code, unused exports/dependencies, complexity, hotspots, CRAP score, or refactoring targets.                 |

### Archived

These are intentionally outside active skill discovery in `/Users/ebeyene/dotfiles/agents/.agents/_skills-archive`:

| Archived skill/folder | Reason |
| --------------------- | ------ |
| `pk` | Replaced by Pi prompt `/pk` and external `pk` CLI workflow. |
| `thought-partner` | Superseded by more specific thinking skills such as `goal-setting`, `systems-thinking`, and `parallel-explore`. |
| `playground` | Invalid/empty experimental folder; archived to keep active skills clean. |

## Naming Standards

- Use lowercase hyphenated names: `output-style`, not `Output Style` or `output_style`.
- Prefer domain/action names over clever names when the skill is broad: `software-design`, `craft-message`.
- Keep short tool names when the tool itself is the activation keyword: `github`, `fallow`.
- Avoid renames unless they materially improve activation. Renames break user muscle memory and may break references.
- Do not encode clusters into folder names unless the agent platform supports nested skill discovery.

## Description Standards

Every skill description should include:

1. **WHAT** the skill does.
2. **WHEN** to use it.
3. **KEYWORDS** users or agents are likely to say.

Description quality matters more than body polish because agents see descriptions before loading skill bodies.

Avoid moving trigger guidance into a body-only "When to use" section. If it affects activation, it belongs in frontmatter `description`.

## Body Standards

- Keep `SKILL.md` focused on the knowledge delta: expert guidance the agent would not already know.
- Put heavy examples, checklists, and detailed frameworks in `references/` with clear MANDATORY READ triggers.
- Prefer guardrails and decision criteria over rigid workflows unless the task has one correct sequence.
- Every `NEVER` should include:
  - the prohibited pattern,
  - what to do instead,
  - why the mistake matters.

## Overlap Boundaries

### Thinking / decision skills

| If the user asks…                                                                                 | Prefer             | Why                                                                                            |
| ------------------------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------- |
| "What am I trying to accomplish?", "define success," "I'm drifting," "make this falsifiable"      | `goal-setting`     | The deliverable is an explicit goal system that guides progress, tradeoffs, and drift control. |
| "Should I build this product?", "what after MVP?", "prioritize the roadmap," "pivot or continue?" | `product-strategy` | The decision is product/app direction, success criteria, or post-MVP prioritization.           |
| "This is a systemic mess," "map the feedback loops," "hidden dependencies," "unknown unknowns"    | `systems-thinking` | The problem is interaction effects, change resistance, or constraints across a system.         |
| "Explore in parallel," "use subagents," "fan out," "compare these hypotheses/options"             | `parallel-explore` | Wide search beats sequential dialogue; each path gets a distinct lens/investigation track.     |

Precedence: explicit goals/success criteria → `goal-setting`; product/app strategy → `product-strategy`; systems/feedback-loop diagnosis → `systems-thinking`; subagent/wide hypothesis search → `parallel-explore`; otherwise ambiguous thinking/pushback.

### Communication vs. agent style

| If the user asks…                                                               | Prefer           | Why                                                                                                                         |
| ------------------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| "Make this message land," "get stakeholder buy-in," "pre-align this proposal"   | `craft-message`  | The deliverable is content crafted for a specific audience.                                                                 |
| "Help me write this email/Slack/text," "how should I phrase this to my manager" | `craft-message`  | Audience shaping + situational strategy are both part of crafting communication. See `references/situational-composing.md`. |
| "Make this scannable," "simplify this," "cut the fluff"                         | `output-style`   | The issue is how the agent writes and formats its output.                                                                   |
| "Stop over-formatting," "sound natural," "less corporate," "write like a human" | `output-style`   | The problem is formatting excess and robotic tone in agent output.                                                          |
| "Argue for/against X," "defend this position," "make the case for X"            | `argue-position` | The task involves contested topics requiring balanced framing.                                                              |
| "Caveman mode," "less tokens," "be brief"                                       | `caveman`        | Compression mode toggle.                                                                                                    |

Precedence: audience-crafted content → `craft-message`; agent output formatting/tone → `output-style`; contested topic framing → `argue-position`; compression toggle → `caveman`.

### Build / design / loop skills

| If the user asks…                                                                                         | Prefer                | Why                                                                 |
| --------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------- |
| "Use TDD," "red-green-refactor," "write the failing test first"                                           | `tdd`                 | The work is implementing behavior through tests.                    |
| "Review this architecture," "find refactors," "design this module/API," "make this more testable"         | `software-design`     | The work is diagnosis and module/interface design.                  |
| "Harden this repo," "add CI/linters/hooks," "turn rules into checks," "reduce AI drift"                   | `repo-guardrails`     | The work is making repo feedback deterministic and enforceable.     |
| "Set up a recurring agent workflow," "design a loop," "scheduled triage," "automate this agent process" | `loop-engineering`    | The work is the control system around agents over time.             |
| "Modern frontend," "popover/dialog/forms/CSS/browser API/a11y/performance"                                | `modern-web-guidance` | The work should use modern platform APIs and web-specific guidance. |
| "Build a playground/demo/static HTML artifact"                                                            | `micro-app`           | The deliverable is a polished local-first artifact.                 |

Precedence: explicit test-first implementation → `tdd`; deterministic repo guardrails → `repo-guardrails`; agent loop/control-system design → `loop-engineering`; architectural diagnosis/design → `software-design`; frontend platform task → `modern-web-guidance`; standalone HTML artifact → `micro-app`.

## Quality Pass Queue

1. Add short examples only where they improve activation or prevent misuse.
2. Re-run overlap audit when adding any broad thinking, design, loop, or writing skill.
3. Keep archived skills out of active cluster tables unless restored to `/skills`.

## Validation Commands

Run validation for one skill:

```bash
/Users/ebeyene/.agents/skills/skill-creator/scripts/validate-skill /Users/ebeyene/.agents/skills/<skill-name>
```

Run validation for all active skill directories:

```bash
for d in /Users/ebeyene/.agents/skills/*; do
  [ -d "$d" ] && [ -f "$d/SKILL.md" ] && /Users/ebeyene/.agents/skills/skill-creator/scripts/validate-skill "$d"
done
```

List valid active skill entry points:

```bash
find /Users/ebeyene/.agents/skills -maxdepth 2 -name SKILL.md -print | sort
```
