# Pi Learning Tutor v2

A learning extension for [pi](https://github.com/earendil-works/pi) that **augments how engineers actually learn** — reading and exploring — rather than replacing it with forced exercises.

## Why this is different

Most AI learning tools test recall: "what is X?", "define Y", "write code that does Z". These target Bloom's taxonomy levels 1–2 (remember, understand) — the very skills AI has commoditized.

**This tutor focuses on Bloom's top 3: analyze, evaluate, create.**

- ❌ "What is the borrow checker?" → recall (AI does this better)
- ✅ "How is Rust's borrow checker different from C++'s RAII?" → analysis
- ✅ "Which approach is better for this use case and why?" → evaluation  
- ✅ "Design an ownership strategy for this data structure" → creation

The tutor transforms passive reading into active encoding by injecting prompts *into your reading flow*, not by forcing you into coding exercises.

### The learning science behind it

| Principle | Source | How the tutor uses it |
|-----------|--------|----------------------|
| **Encoding over comprehension** | Justin Sung | Reading = comprehension (Bloom's 2). The tutor prompts you to *encode*: relate, compare, group, simplify — where actual learning happens |
| **Priming** | Sung's 4-layer process | Before you read new content, the tutor activates prior knowledge: "what do you already know about this?" |
| **Relational learning** | Sung + cognitive science | Concepts understood in isolation are fragile. The tutor tracks connections between concepts and optimizes for connection density |
| **Desirable difficulties** | Bjork & Bjork | Spaced repetition and interleaving make retrieval harder but more effective. The tutor schedules encoding checks at increasing intervals |
| **Zone of Proximal Development** | Vygotsky | Adaptive difficulty: guided → scaffolded → independent. The tutor adjusts how much it leads vs. follows |
| **Bloom's 4–6 focus** | Bloom's taxonomy (revised) | In the AI era, the value is in analyze/evaluate/create. The tutor deliberately practices these levels |

### Your workflow, augmented

| Passive (before) | Active (with tutor) |
|---|---|
| Read article | **Prime first**: scan headings, predict what it'll cover |
| Highlight important parts | **Encode while reading**: "how is this different from what I already know?" |
| Clip to Obsidian | **Retrieve after**: close the tab, explain it in your own words |
| Never revisit | **Interleave later**: "how does this connect to that other article?" |

## Install

```bash
pi install npm:@majorgilles/pi-learning-tutor
```

## Commands

| Command | Description |
|---------|-------------|
| `/learn <topic>` | Start learning mode. First run shows onboarding. |
| `/learn read <url>` | Reading companion mode — primes, tracks encoding, synthesizes |
| `/learn exercise [topic]` | Encoding challenge at your tier (compare/critique/design) |
| `/learn review [scope]` | Cross-topic connection check with elaborative interrogation |
| `/learn define [text]` | Definition overlay (uses clipboard if no text given) |
| `/learn act <request>` | Allow AI edits for a scoped task |
| `/learn settings` | Open preferences panel |
| `/learn status` | Show learning dashboard overlay |
| `/learn off` | Exit learning mode |

### Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `ctrl+shift+l` | Learning dashboard overlay |
| `ctrl+shift+d` | Define selected/editor text |

## What it does while active

### Concept tracking

The tutor tracks concepts as you encounter them, measuring **encoding depth** (not recall strength):

- **○ surface** — you've seen the term, basic familiarity
- **◐ relational** — you can compare/contrast with related concepts
- **◑ deep** — you can explain *why* it works, predict behavior in new contexts
- **● transferable** — you can apply to novel problems, teach it to others

### Connection density

The most important metric isn't how many concepts you know, but **how many connections exist between them**. 10 concepts with 15 connections is more robust than 20 isolated concepts.

The tutor actively suggests connections: "you learned X last week and Y today — how are they related?"

### Adaptive difficulty

Three tiers controlling how much the tutor guides your relational thinking:

| Tier | Behavior |
|------|----------|
| **Guided** | Tutor suggests connections: "have you noticed how X resembles Y?" |
| **Scaffolded** | Tutor asks for connections: "how is X related to Y?" |
| **Independent** | Tutor expects you to volunteer connections spontaneously |

Transitions happen automatically based on your encoding check performance.

### Reading companion mode

When you enter `/learn read <url>`, the tutor becomes a reading companion:

1. **Priming** — activates prior knowledge before you start reading
2. **Section checks** — asks one encoding question after every 2–3 sections (not recall — "what's the key insight? how does it relate to X?")
3. **Synthesis** — at the end: summarize in your own words, connect to prior learning, evaluate limitations

### Spaced encoding checks

The tutor uses SM-2-lite scheduling (1 day → 1 week → 1 month) to check *encoding depth*, not fact recall. When a concept is due, it prompts you with a relational question.

### Dashboard overlay

Press `ctrl+shift+l` for a live dashboard showing:
- Current goal and difficulty tier
- Concept graph with encoding depth indicators (○◐◑●)
- Connection density and average encoding depth
- Suggested connections to explore
- Due encoding checks
- Interleaving opportunities
- Quick actions (exercise, review, define, off)

### Settings

`/learn settings` opens a preferences panel:
- Learning style (reading-first, exercise-first, mixed)
- Encoding check frequency (3–15 turns)
- Scaffolding level (guided, scaffolded, independent)
- Pre-reading priming toggle
- Concept graph widget visibility

### First-run onboarding

The first time you run `/learn <topic>`, a 4-step onboarding overlay explains the philosophy, keyboard shortcuts, and how to get started.

## Architecture

```
index.ts (46 lines — orchestrator)
├── commands/
│   ├── learn-command.ts      /learn command + subcommand dispatch
│   └── command-helpers.ts    Shared template/resource builders
├── tools/
│   └── learning-goal.ts      learning_goal tool registration
├── hooks/
│   ├── injector.ts           before_agent_start system prompt injection
│   └── hooks.ts              All event hooks (session, input, tool_call, etc.)
├── src/
│   ├── engine/               Learning science engine (Bloom's 4–6)
│   │   ├── types.ts          EncodingDepth, ConceptConnection, AdaptiveDifficulty
│   │   ├── spaced-repetition.ts  SM-2-lite for encoding check scheduling
│   │   ├── adaptive-difficulty.ts 3-tier relational depth control
│   │   ├── concepts.ts       Connection tracking, graph building, density
│   │   ├── metacognition.ts  Connection-focused prompt scheduling
│   │   └── priming.ts        Pre-reading schema activation
│   ├── prompts.ts            YAML loader + mustache renderer
│   ├── state-container.ts    State wrapper with persist/restore
│   ├── state.ts              LearningState, clone, restore, status widget
│   ├── persistence.ts        Cross-session JSONL index
│   ├── preferences.ts        Global user preferences
│   ├── summary.ts            Heuristic session summaries (zero LLM calls)
│   ├── definition.ts         Definition overlay with selection support
│   ├── resource-detection.ts URL/file/keyword detection
│   ├── tool-gates.ts         AI edit gating, readiness signals
│   └── conversation.ts       Text extraction, conversation snippets
├── prompts/                  YAML prompt templates (auto-discovered)
│   ├── learning-instructions.yaml
│   ├── start-learning-thread.yaml
│   ├── exercise-request.yaml
│   ├── broad-review.yaml
│   ├── review-signal.yaml
│   ├── reading-companion.yaml
│   ├── metacognition-prompt.yaml
│   └── definition.yaml
└── tui/                      Terminal UI components
    ├── dashboard/            Learning dashboard overlay
    │   ├── session.ts        Orchestrator
    │   ├── props-adapter.ts  State → components fan-out
    │   ├── state-reducer.ts  Pure reducer + effects
    │   ├── key-router.ts     Keystroke → action mapping
    │   ├── stateful-view.ts  StatefulView<P> interface
    │   ├── types.ts          Canonical state + action types
    │   └── components/       Header, metrics, concept-list, etc.
    ├── reading-companion/    Reading companion overlay
    ├── settings/             Preferences panel
    ├── onboarding/           First-run welcome
    └── interleaving/         Cross-topic opportunity detection
```

## Design decisions

1. **Reading is primary** — the tutor augments your reading flow, doesn't compete with it
2. **Bloom's 4–6 focus** — analyze/evaluate/create, not memorize/understand/apply
3. **Encoding depth > mastery** — track understanding quality, not recall strength
4. **Connections > facts** — connection density is the key learning quality metric
5. **Priming before reading** — activate prior knowledge for better encoding
6. **Learner owns the keyboard** — AI never types code in learning mode
7. **YAML + mustache prompts** — text in YAML files, composition in TypeScript
8. **Modular registration** — 46-line index.ts, each module registers independently
9. **StatefulView + reducer** — TUI components receive props, not raw state

## Development

```bash
npm install
npm run typecheck
npm pack --dry-run
```

## Credits

Learning science foundations:
- **Justin Sung** — encoding-first learning, Bloom's taxonomy for AI era, 4-layer process (prime → encode → retrieve → interleave)
- **Robert Bjork** — desirable difficulties, spaced repetition, retrieval practice
- **Lev Vygotsky** — Zone of Proximal Development, scaffolding
- **Benjamin Bloom** — taxonomy of educational objectives (revised: remember → understand → apply → analyze → evaluate → create)

TUI architecture inspired by:
- [rpiv-ask-user-question](https://github.com/juicesharp/rpiv-mono) — StatefulView, reducer, effects, props adapter pattern
- [thoughts extension](https://github.com/earendil-works/pi) — modular registration, JSONL persistence, heuristic summaries

## License

MIT
