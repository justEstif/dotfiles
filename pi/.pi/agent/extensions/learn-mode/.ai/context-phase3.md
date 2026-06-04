# Phase 3: TUI Dashboard — Context Primer

## Goal
Build interactive TUI components for the learning tutor: dashboard overlay, concept ladder widget, review scheduler widget, quick-check overlay, settings panel, and onboarding.

## Current Architecture

```
index.ts (46 lines, orchestrator)
├── commands/learn-command.ts     — /learn command dispatch
├── commands/command-helpers.ts   — shared template variable builders
├── tools/learning-goal.ts        — LLM-controlled learning purpose
├── hooks/injector.ts             — before_agent_start: inject learning prompt
├── hooks/hooks.ts                — session_start, shutdown, input, context, tool_call, agent_end, turn_end
├── src/engine/                   — spaced repetition, adaptive difficulty, concepts, metacognition
├── src/state-container.ts        — shared StateContainer class
├── src/state.ts                  — persist/restore/updateStatus/sendAsUser
├── src/persistence.ts            — cross-session JSONL index
├── src/summary.ts                — heuristic session summaries
├── src/prompts.ts                — YAML prompt loader/renderer (auto-discovers .yaml files)
├── src/definition.ts             — definition overlay (existing TUI component pattern to follow)
└── prompts/*.yaml                — prompt templates
```

## Data Available for TUI

From `LearningState`:
- `active`, `goal`, `workingGoal` — current learning context
- `concepts: Record<string, ConceptMastery>` — per-concept tracking
  - `id`, `label`, `mastery` (new/learning/review/mature), `easeFactor`, `repetitions`, `nextReview`, `lastReview`, `avgConfidence`, `prerequisites`, `tags`
- `difficulty: AdaptiveDifficulty` — tier (guided/scaffolded/independent), consecutiveCorrect/Struggle, totalExercises/Correct
- `metacognition: MetacognitionState` — turnsSinceLastPrompt, confidenceCheckPending, lowConfidenceConcepts
- `analytics: LearningAnalytics` — conceptsIntroduced, exerciseResults, metacognitionPromptsGiven
- `exercisesGiven: ExerciseRecord[]` — topic + createdAt
- `editMode: EditModeState` — phase (off/act)

From engine functions:
- `buildConceptLadder(concepts)` → `ConceptLadderNode[]` — ordered by prerequisite depth
- `getDueConcepts(concepts)` → `ConceptMastery[]` — concepts due for review now
- `getNextReviewLabel(concept)` → human-readable string
- `getDifficultyPromptHint(tier)` → prompt instruction text
- `listLearningContexts()` — all persisted learning contexts from JSONL index

## Existing TUI Pattern (from definition.ts)

The DefinitionOverlay is a good reference:
1. Class with `render(width)`, `handleInput(data)`, `invalidate()` methods
2. Opened via `ctx.ui.custom(component, { overlay: true, overlayOptions: {...} })`
3. Uses `done` callback to close
4. Uses theme from callback, not imported
5. Manual border drawing with `╭─╮│╰─╯` characters
6. Scrollable markdown body

## Pi TUI Component Patterns (from docs)

### Overlay
```ts
const result = await ctx.ui.custom<T>((tui, theme, keybindings, done) => {
  return { render, invalidate, handleInput };
}, { overlay: true, overlayOptions: { width: "70%", anchor: "center" } });
```

### Widget (persistent above/below editor)
```ts
ctx.ui.setWidget("id", ["Line 1", "Line 2"]);
ctx.ui.setWidget("id", undefined); // clear
```

### Status bar
```ts
ctx.ui.setStatus("id", theme.fg("accent", "text"));
ctx.ui.setStatus("id", undefined); // clear
```

### Settings panel
```ts
import { SettingsList, type SettingItem } from "@earendil-works/pi-tui";
import { getSettingsListTheme } from "@earendil-works/pi-coding-agent";
```

### Selection dialog
```ts
import { SelectList, type SelectItem } from "@earendil-works/pi-tui";
import { DynamicBorder } from "@earendil-works/pi-coding-agent";
```

### Key bindings
```ts
import { matchesKey, Key } from "@earendil-works/pi-tui";
```

### Width utilities
```ts
import { visibleWidth, truncateToWidth, wrapTextWithAnsi } from "@earendil-works/pi-tui";
```

## Phase 3 Tasks

### 1. Learning Dashboard Overlay
- Full-screen overlay with: goal, concept ladder, mastery levels, difficulty tier, next reviews, quick actions
- Accessible via `/learn` (when already active) or `/learn dashboard`
- Keyboard navigable (↑↓ to scroll, Enter for actions, Esc to close)
- Uses `overlayOptions: { width: "80%", maxHeight: "90%", anchor: "center" }`

### 2. Concept Ladder Widget
- Persistent widget above editor during learning mode
- Shows prerequisite chain for current topic with mastery indicators (○◐◑●)
- Updates as concepts are learned
- Replaces current status widget

### 3. Review Scheduler Widget
- Shows due reviews + next review times
- Updates when reviews complete
- Below editor placement

### 4. Quick-Check Overlay
- Interactive quiz: answer input, immediate feedback, confidence rating
- Triggered by tutor or `/learn check`
- Input field for answer, Enter to submit, then feedback display

### 5. Settings Panel
- SettingsList overlay for: difficulty preference, check frequency, scaffolding level
- Persisted via state
- Accessible via `/learn settings`

### 6. Onboarding
- Welcome overlay on first `/learn` with key commands
- Triggered by checking if `learning-tutor-onboarded` flag exists in state
- Brief, interactive, dismissable

## Design Constraints
- All components must render at 80+ columns
- Must follow theme from callback (no imported theme)
- Must call `tui.requestRender()` after state changes in `handleInput`
- Overlay components are disposed on close — create fresh instances each time
- Each line must not exceed the `width` parameter
