# Agent Skills Catalog

Personal agent skills organized by activation intent. This file is a navigation layer only: skill directories stay flat so agent discovery and existing references keep working.

## Cluster Map

| Cluster | Use when | Skills |
| --- | --- | --- |
| Meta / System | Managing agent behavior, knowledge, plans, or the skill library itself | `skill-creator`, `find-skills`, `pk`, `plan` |
| Think / Decide | The user needs structured thinking, pushback, goals, strategy, systems analysis, comparison, or decision support | `thought-partner`, `goal-setting`, `product-strategy`, `systems-thinking`, `parallel-explore` |
| Communicate / Explain | The output must land with humans: clearer, shorter, more scannable, more persuasive, or better pre-aligned | `message-clarity`, `dont-make-me-think`, `caveman` |
| Build / Design | Changing software systems, artifacts, architecture, tests, or agent guardrails | `tdd`, `software-design`, `feedback-loop`, `playground` |
| Tools / Integrations | Operating a specific external tool, platform, or CLI | `github`, `npm-publish`, `fallow` |
| Incubating / Cleanup | Invalid or experimental skill folders that need promotion, archiving, or deletion | none currently |

## Skills by Cluster

### Meta / System

| Skill | What it does | Activate when |
| --- | --- | --- |
| `skill-creator` | Builds, reviews, validates, and improves agent skills. | Creating/reviewing skills, auditing prompts, checking description drift, applying skill-quality rubric. |
| `find-skills` | Finds and installs skills from the open ecosystem. | User asks whether a skill exists, how to add capability, or wants skill discovery/installation. |
| `pk` | Maintains durable project knowledge. | Capturing decisions, questions, research, sources, project memory, or when investigation produces durable context. |
| `plan` | Creates lightweight ignored Markdown plans. | Complex, ambiguous, risky, or multi-session work needs preserved context/rationale. |

### Think / Decide

| Skill | What it does | Activate when |
| --- | --- | --- |
| `thought-partner` | Routes conversational thinking requests to core pushback, root-ask, or plan-grilling modes. | User asks for a sparring partner, pushback, stress testing, root-cause/request investigation, devil's advocate, or help thinking through an ambiguous ask. |
| `goal-setting` | Turns vague intent into honest, stable, detailed, falsifiable, incremental goals. | Defining success, choosing direction, prioritizing open-ended work, avoiding scope drift, recovering motivation, or clarifying what the user is actually trying to accomplish. |
| `product-strategy` | Evaluates product/app direction before and after MVP. | Build-or-not decisions, MVP success criteria, product north stars, core-tech leverage, defining constraints, roadmap prioritization, post-MVP pivots, RICE, or opportunity trees. |
| `systems-thinking` | Analyzes organizational, technical, and strategic problems as interacting systems. | Feedback loops, hidden dependencies, legacy constraints, unknown unknowns, repeated failures, causal loops, debt cascades, or change resistance. |
| `parallel-explore` | Fans out subagents across competing hypotheses or paths, then synthesizes findings. | Wide search is useful: multiple hypotheses, architecture options, tech choices, debugging theories, product paths, or strategy directions need parallel investigation. |

### Communicate / Explain

| Skill | What it does | Activate when |
| --- | --- | --- |
| `message-clarity` | Makes a message land with a specific audience. | Landing pages, pitches, sensitive messages, presentations, positioning, explanations, stakeholder buy-in, proposal framing, or pre-meeting alignment are not resonating. |
| `dont-make-me-think` | Applies usability/scannability principles to writing. | Docs, emails, proposals, or technical writing need to be clearer, shorter, easier to skim, or less cognitively demanding. |
| `caveman` | Switches to ultra-compressed communication. | User asks for caveman mode, fewer tokens, extreme brevity, or `/caveman`. |

### Build / Design

| Skill | What it does | Activate when |
| --- | --- | --- |
| `tdd` | Guides red-green-refactor test-first development. | Building behavior, fixing bugs, or writing integration tests using TDD. |
| `software-design` | Finds deepening opportunities and designs better modules/APIs. | Architecture, refactoring, module boundaries, testability, deep modules, shallow modules, or codebase design quality. |
| `feedback-loop` | Adds deterministic guardrails for AI-assisted coding. | Setting up repo checks, CI gates, lint rules, custom rules, git safety, observability-to-tasks, or anti-drift workflows. |
| `playground` | Creates polished local-first HTML micro-apps and artifacts. | Interactive demos, visual explorers, slide decks, diagrams, planning docs, prompt tools, or static playgrounds. |

### Tools / Integrations

| Skill | What it does | Activate when |
| --- | --- | --- |
| `github` | Uses GitHub through the `gh` CLI. | Issues, PRs, reviews, workflow runs, CI status, or GitHub API queries. |
| `npm-publish` | Handles npm publishing and release workflows. | OIDC/trusted publishing, npm release CI, version/tag sync, package publish failures, scoped or monorepo packages. |
| `fallow` | Analyzes TS/JS codebase health with `fallow`. | Dead code, unused exports/dependencies, complexity, hotspots, CRAP score, or refactoring targets. |

### Incubating / Cleanup

No invalid or incubating skill folders are currently present.

## Naming Standards

- Use lowercase hyphenated names: `message-clarity`, not `Message Clarity` or `message_clarity`.
- Prefer domain/action names over clever names when the skill is broad: `software-design`, `message-clarity`.
- Keep short tool names when the tool itself is the activation keyword: `github`, `fallow`, `pk`.
- Avoid renames unless they materially improve activation. Renames break user muscle memory and may break references.
- Do not encode clusters into folder names unless the agent platform supports nested skill discovery.

## Description Standards

Every skill description should include:

1. **WHAT** the skill does.
2. **WHEN** to use it.
3. **KEYWORDS** users or agents are likely to say.

Description quality matters more than body polish because agents see descriptions before loading skill bodies.

Avoid moving trigger guidance into a body-only “When to use” section. If it affects activation, it belongs in frontmatter `description`.

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

| If the user asks… | Prefer | Why |
| --- | --- | --- |
| “Help me think,” “push back,” “stress test this,” “what am I missing?” | `thought-partner` | One conversational framework should guide the exchange. |
| “What am I trying to accomplish?”, “define success,” “I’m drifting,” “make this falsifiable” | `goal-setting` | The deliverable is an explicit goal system that guides progress, tradeoffs, and drift control. |
| “Should I build this product?”, “what after MVP?”, “prioritize the roadmap,” “pivot or continue?” | `product-strategy` | The decision is product/app direction, success criteria, or post-MVP prioritization. |
| “This is a systemic mess,” “map the feedback loops,” “hidden dependencies,” “unknown unknowns” | `systems-thinking` | The problem is interaction effects, change resistance, or constraints across a system. |
| “Explore in parallel,” “use subagents,” “fan out,” “compare these hypotheses/options” | `parallel-explore` | Wide search beats sequential dialogue; each path gets a distinct lens/investigation track. |
| “Help me say this,” “make this land,” “get stakeholder buy-in,” “pre-align this proposal” | `message-clarity` | The deliverable is communication that must resonate with an audience. |

Precedence: communication artifact or stakeholder buy-in → `message-clarity`; explicit goals/success criteria → `goal-setting`; product/app strategy → `product-strategy`; systems/feedback-loop diagnosis → `systems-thinking`; subagent/wide hypothesis search → `parallel-explore`; otherwise ambiguous thinking/pushback → `thought-partner`.

### Build / design skills

| If the user asks… | Prefer | Why |
| --- | --- | --- |
| “Use TDD,” “red-green-refactor,” “write the failing test first” | `tdd` | The work is implementing behavior through tests. |
| “Review this architecture,” “find refactors,” “design this module/API,” “make this more testable” | `software-design` | The work is diagnosis and module/interface design. |
| “Harden this repo,” “add CI/linters/hooks,” “turn rules into checks,” “reduce AI drift” | `feedback-loop` | The work is making feedback deterministic and enforceable. |

Precedence: explicit test-first implementation → `tdd`; deterministic repo guardrails → `feedback-loop`; architectural diagnosis/design → `software-design`.

## Quality Pass Queue

1. Add short examples only where they improve activation or prevent misuse.
2. Re-run overlap audit when adding any broad thinking, design, or writing skill.

## Validation Commands

Run validation for one skill:

```bash
/Users/ebeyene/.agents/skills/skill-creator/scripts/validate-skill /Users/ebeyene/.agents/skills/<skill-name>
```

Run validation for all skill directories:

```bash
for d in /Users/ebeyene/.agents/skills/*; do
  [ -d "$d" ] && /Users/ebeyene/.agents/skills/skill-creator/scripts/validate-skill "$d"
done
```

List valid skill entry points:

```bash
find /Users/ebeyene/.agents/skills -maxdepth 2 -name SKILL.md -print | sort
```
