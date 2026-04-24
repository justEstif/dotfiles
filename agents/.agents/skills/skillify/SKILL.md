---
name: skillify
version: 1.0.0
description: |
  The meta skill. Turn any raw feature, script, workflow, or hard-won fix into
  a properly documented, tested, resolvable unit of agent-visible capability.
  Use when the user says "skillify this", "is this a skill?", "make this
  proper", or after a new feature is built without durable skill infrastructure.
triggers:
  - "skillify this"
  - "skillify"
  - "is this a skill?"
  - "make this proper"
  - "add tests and evals for this"
  - "check skill completeness"
mutating: false
---

# Skillify — The Meta Skill

## Contract

A feature is "properly skilled" when these checklist items are present or
explicitly marked not applicable:

1. `SKILL.md` — skill file with frontmatter, triggers, contract, phases, and
   output format.
2. Deterministic code — script/tool/library code if the task includes work a
   program can do more reliably than an LLM.
3. Unit tests — cover every branch of deterministic logic.
4. Integration tests — exercise real boundaries/endpoints when applicable, not
   just in-memory fixtures.
5. LLM evals — quality/correctness/process cases if the feature includes LLM
   judgment or routing.
6. Resolver trigger — the skill discovery surface contains the trigger patterns
   the user actually types. In pi/native Agent Skills, this primarily means a
   precise `description` in `SKILL.md`; if the host project has an explicit
   resolver/index/AGENTS file, update that too.
7. Resolver trigger eval — test that feeds trigger phrases to the resolver and
   asserts they route to this skill, not an old or overlapping path.
8. Reachability + DRY audit — verify the skill is discoverable, non-duplicative,
   and MECE against nearby skills.
9. E2E smoke test — exercise the full pipeline from user turn to side effect or
   final answer.
10. Filing rules — if the feature writes durable notes/data/files, document
    where they belong so outputs are not orphaned.

## Trigger

- "skillify this" / "skillify" / "is this a skill?" / "make this proper"
- "add tests and evals for this"
- After building any new feature that touches user-facing behavior
- After an agent failure that should never recur
- When you find a useful script/workflow with no reachable skill around it

## Phases

### Phase 1: Audit what exists

For the feature being skillified, answer:

- **Feature name**: what does it do in one line?
- **Failure or workflow captured**: what lesson should become permanent?
- **Code path**: where does the implementation live, if any?
- **Current entrypoint**: how would an agent discover or invoke it today?
- **Scope**: ask the user whether this should be a **global skill** or a
  **project skill** before creating or moving files.
  - Global skill: useful across many repos/sessions; should live in the user's
    global agent skills directory and avoid project-specific paths unless
    parameterized.
  - Project skill: specific to this repository, product, stack, or workflow;
    should live with the project's agent/skills configuration and may reference
    project-local files, commands, and conventions.
  - If the answer is unclear, recommend the narrower project scope by default;
    promote to global later after the workflow proves reusable.
- **Checklist status**: inspect the repo and mark each of the 10 items as
  present, missing, or not applicable. If a project has a local conformance or
  reachability checker, run it and include the result.

### Phase 2: Create missing pieces in order

Work the list top-down. Each earlier item constrains later items: the skill
contract determines what tests assert; tests determine what evals gate; the
resolver entry determines what trigger-eval checks.

1. Choose the skill location from the confirmed scope: global skills directory
   for global skills, project-local skills directory for project skills. Do not
   assume scope silently.
2. Write `SKILL.md` first. Frontmatter should include `name`, `version`,
   `description`, and `triggers`. Include `tools` and `mutating` when the host
   agent supports them. Body should include at minimum Contract, Trigger/When to
   Use, Phases/Procedure, Quality Gates, Anti-Patterns, and Output Format.
3. Extract deterministic code into a script/tool/library if applicable. Use the
   host project's normal runtime and conventions.
4. Write unit tests for every branch of deterministic logic. Mock external calls
   (LLM, DB, network) so tests run fast and deterministically.
5. Add integration tests that cross real boundaries when applicable. These catch
   bugs that mocks and clean fixtures hide.
6. Add LLM evals if the feature includes LLM calls, judgment, summarization, or
   routing. Even a three-case eval (happy / edge / adversarial) is cheap
   insurance against prompt regressions.
7. Add the resolver/index trigger in the matching scope. For pi/native Agent
   Skills, the resolver is built-in skill discovery and the main routing surface
   is the `description` field in `SKILL.md`, so make the description explicit
   about when to use the skill. If the host project has an explicit resolver
   file such as `skills/RESOLVER.md`, `AGENTS.md`, or another index, update that
   too. Use the trigger patterns the user ACTUALLY types, not internal jargon.
8. Add a resolver trigger eval that feeds those patterns in and asserts they
   route to the new skill.
9. Run or perform a reachability + DRY audit:
   - Every `SKILL.md` should be reachable from the relevant global or project
     skill index, resolver, or agent instructions.
   - Referenced scripts/tools should exist and be callable.
   - Trigger descriptions should not overlap ambiguously with sibling skills in
     the same scope.
   - If a near-duplicate skill exists, extend or merge instead of creating a
     competing path.
10. Add an E2E smoke test that starts from realistic user phrasing and verifies
    the skill/tool path is used end-to-end.
11. Add filing rules if the skill writes durable artifacts. State the expected
    directory, naming convention, metadata, and any resolver/index updates.

### Phase 3: Verify

Run the project's relevant checks and confirm green. Examples:

```bash
# Unit tests
npm test
bun test
pytest

# Integration / E2E tests, when applicable
npm run test:e2e
bun run test:e2e
pytest tests/integration

# Project-specific skill conformance, resolver, or reachability checks
# Use whatever this repository provides.
```

If the project has no automated reachability or resolver checker, manually audit
all skill entries and note that automation is a follow-up opportunity.

## Quality gates

A feature is NOT properly skilled until:

- The skill contract exists and is specific enough to guide future agents.
- Deterministic work has been moved out of LLM space where practical.
- Relevant tests pass (unit + integration + evals as applicable).
- It appears in the relevant discovery surface with accurate trigger patterns:
  `SKILL.md` description for pi/native Agent Skills, plus resolver/index/agent
  instructions when the host project uses them.
- Resolver trigger evals or a manual routing check confirm the intended phrases
  reach this skill.
- Reachability + DRY audit finds no orphaned skills, duplicate lanes, or obvious
  trigger ambiguity.
- If it writes durable artifacts, filing rules say where those artifacts go.

## Anti-Patterns

- ❌ Code with no `SKILL.md` — invisible to the resolver; the agent may never run
  it.
- ❌ `SKILL.md` with no tests — untested contract; one prompt change can regress
  silently.
- ❌ Tests that reimplement production code — the reimplementation's bugs don't
  catch production's bugs.
- ❌ Skill description or resolver entry that uses internal jargon the user
  never types — trigger patterns must mirror real user language.
- ❌ Feature that writes durable artifacts without filing rules — orphaned output
  the agent will not reliably find later.
- ❌ Deterministic logic in LLM space — should be a script/tool.
- ❌ LLM judgment in deterministic space — should be an eval or rubric-guided
  review.
- ❌ Creating a new skill when an existing skill should be extended — duplicates
  create ambiguous routing.

## Why skillify matters

A one-off fix helps the current conversation. A skillified fix helps every
future conversation.

Use skillify to convert failures and successful prototypes into durable agent
capability: documented procedure, deterministic code where appropriate, tests,
evals, resolver reachability, duplicate checks, smoke tests, and filing rules.
The human keeps judgment about what should become permanent; the checklist keeps
that permanence honest.

## Output Format

A skillify run produces, in order:

1. The confirmed scope: global skill or project skill, plus the target skill
   directory/resolver location.
2. An audit printout listing which of the 10 items exist, which are missing, and
   which are not applicable.
3. The files or edits created to close each gap (`SKILL.md`, scripts/tools,
   tests, evals, resolver/index entries, filing rules).
4. The verification commands run and their results.
5. Any follow-up items that should become separate tasks.
6. A one-line summary of the resulting skill completeness score (N/10, excluding
   not-applicable items if appropriate).
