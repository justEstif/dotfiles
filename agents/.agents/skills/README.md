# Agent Skills Catalog

Personal agent skills organized by activation intent. This file is a navigation layer only: skill directories stay flat so agent discovery and existing references keep working.

## Cluster Map

| Cluster | Use when | Skills |
| --- | --- | --- |
| Meta / System | Managing agent behavior, knowledge, plans, or the skill library itself | `skill-creator`, `find-skills`, `pk`, `plan` |
| Think / Decide | The user needs structured thinking, pushback, comparison, or decision support | `thought-partner`, `parallel-explore` |
| Communicate / Explain | The output must land with humans: clearer, shorter, more scannable, more persuasive | `message-clarity`, `dont-make-me-think`, `caveman` |
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
| `thought-partner` | Routes ambiguous thinking requests to the right framework. | User asks for pushback, stress testing, product validation, systems thinking, root-cause investigation, stakeholder alignment, or post-MVP prioritization. |
| `parallel-explore` | Fans out subagents across competing hypotheses or paths, then synthesizes findings. | Wide search is useful: multiple hypotheses, architecture options, tech choices, debugging theories, product paths, or strategy directions need parallel investigation. |

### Communicate / Explain

| Skill | What it does | Activate when |
| --- | --- | --- |
| `message-clarity` | Makes a message land with a specific audience. | Landing pages, pitches, sensitive messages, presentations, positioning, or explanations are not resonating. |
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
| “Explore in parallel,” “use subagents,” “fan out,” “compare these hypotheses/options” | `parallel-explore` | Wide search beats sequential dialogue; each path gets a distinct lens/investigation track. |
| “Help me say this,” “make this land,” “what should the landing page/email/pitch say?” | `message-clarity` | The deliverable is communication that must resonate with an audience. |

Precedence: communication artifact → `message-clarity`; subagent/wide hypothesis search → `parallel-explore`; otherwise ambiguous thinking/pushback → `thought-partner`.

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
