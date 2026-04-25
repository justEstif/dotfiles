# Software Design Guardrails

Use these principles from _A Philosophy of Software Design_ to choose feedback-loop checks. The goal is not dogma; encode the highest-value complexity reducers.

## Principles to reinforce

- **Deep modules**: prefer simple interfaces that hide substantial complexity.
- **Information hiding**: keep format/protocol/storage/design-system decisions owned by one module.
- **Low cognitive load**: reduce what a developer or agent must remember to make a safe change.
- **Low change amplification**: a simple behavior change should not require scattered edits.
- **Obviousness**: make behavior understandable without tracing many files.
- **Consistency**: use the same patterns for similar things.
- **Pull complexity downward**: use defaults and internal handling instead of pushing decisions to callers.
- **Define errors out of existence**: prefer idempotent or impossible-to-misuse APIs where practical.
- **Strategic programming**: reserve time in each change to improve design, not only pass tests.

## Red flags to turn into checks

| Red flag                  | Deterministic guardrail ideas                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shallow modules           | max public exports per file/module; detect wrapper-only files; require tests/comments for new public APIs                                                     |
| Pass-through methods      | lint for one-line delegating methods with matching names/signatures; review generated report before enforcing                                                 |
| Pass-through variables    | static analysis for parameters passed through 3+ call layers; prefer context/dependency ownership                                                             |
| Information leakage       | import-boundary rules; ban direct use of internal schemas/formats outside owning module; forbid legacy design-system imports in migrated areas                |
| Temporal decomposition    | flag modules named by pipeline order (`reader`, `processor`, `writer`) when they share the same data format knowledge; prefer ownership by concept/format     |
| Overexposed configuration | max parameter counts; require defaults/options objects; flag constructors with many primitive parameters                                                      |
| Conjoined methods         | complexity/coupling metrics; detect shared mutable state used by method pairs; add interface comments for stateful protocols                                  |
| Special-general mixture   | ban feature-specific imports from shared/core modules; enforce dependency direction from specific → general                                                   |
| Repetition                | duplicate-code detection; codemods or shared helper extraction after stable 3+ repetitions                                                                    |
| Non-obvious code          | ban vague names where tooling supports it; require named types instead of generic tuples/records in public APIs; require comments for non-obvious constraints |

## Review-to-rule loop

When an agent or reviewer finds a design issue:

1. Name the violated principle: depth, information hiding, cognitive load, change amplification, obviousness, consistency, or strategic investment.
2. Identify the mechanical signal: import pattern, parameter count, export count, complexity metric, duplicate shape, naming pattern, missing interface comment, etc.
3. Prefer existing tools first: linter rules, type-system constraints, import boundaries, architecture tests, duplicate-code tools.
4. Add a custom rule only when built-in tools cannot express the convention.
5. Keep prose guidance short and link to the failing check; the check is the source of truth.
6. Validate with one bad fixture and one good fixture.

## Pragmatic thresholds

Start strict enough to change behavior, then loosen only when the rule blocks good design:

- Function complexity: cyclomatic ≤ 10, cognitive ≤ 12.
- Nesting depth: ≤ 3.
- Parameters: ≤ 4; use an options object or deeper abstraction beyond that.
- Function length: 40-80 lines depending on stack and test style.
- Public API additions: require an interface comment describing caller-visible behavior and hidden decisions.
- Shared/core modules: must not import app/feature-specific modules.

Do not enforce a rule just because it is measurable. Enforce it when it prevents cognitive load, change amplification, or unknown unknowns.
