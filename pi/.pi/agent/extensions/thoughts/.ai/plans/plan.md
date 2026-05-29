# Plan: `thoughts` pi extension

## Purpose

Build a pi extension that lets a user track "threads of thought" — long, sometimes-branching trains of thinking that span sessions and working directories — by layering naming, cross-pwd discovery, verbatim anchoring, and thought-shaped branch summaries over pi's native session tree.

Success looks like:

1. The user runs `/thought start "Lead with 1G or 500?"` and never has to think about file paths, session IDs, or which `cwd` they were in.
2. Days later, anywhere on disk, `/thoughts` lists the thread and `/thought resume "lead-1g-or-500"` drops them back in with a thought-shaped summary of the live edge.
3. Going back to an earlier branch via `/tree` doesn't pollute context with what happened downstream — pi's tree already enforces this; the extension just makes the navigation findable and named.
4. Compaction never erases an anchor's original wording, because anchors are stored as `custom` entries outside LLM context and recoverable via a `thought_recall` tool.

## Context

### Why this exists

Captured in detail in pk decision `decision-2026-05-29-thought-thread-tracking-pi-session-tree-pk-promotion-via-a-thin-extension-and-skill`. Summary of the design arc, in order:

1. **Markdown + git folder** — rejected: too friction-heavy, no resume mechanics.
2. **New pk type `thought`** — rejected: pk is for stable synthesized knowledge; thoughts are speculative/contradictory/evolving by design and fight pk's lifecycle. pk is the destination, not the container.
3. **Custom node-file system with addressable checkpoints and context-isolation rules** — rejected once pi's `/tree` was found to already provide exactly this (branch navigation, structural context isolation, optional branch summaries, labels).
4. **Skill + pi extension** — partially accepted, then sharpened.
5. **Extension only, no skill** — accepted. Slash-command invocation removes the agent's decision-making role; the "don't load siblings" rule is structurally enforced by pi's tree, not behaviorally; by skill-creator's "Would Agent do this without being told?" test, the skill would be ~0% expert knowledge.
6. **Borrow from `pi-observational-memory`** — accepted: ID + recall tool pattern, background prep at `turn_end`, separate worker model, passive mode, debug NDJSON. Reject their continuous observer pipeline, dropper, and two-tier observation/reflection model — thoughts are explicit and sparse.
7. **Defer pk integration** — `/thought promote` removed from v1. Build a self-contained extension first; revisit promotion after real usage.

### What pi already gives us (do not reinvent)

From `docs/sessions.md`, `docs/session-format.md`, `docs/compaction.md`, `docs/extensions.md`:

- Session tree with `id`/`parentId` branching, in-place navigation via `/tree`.
- `appendLabelChange(targetId, label)` — labels on any entry.
- `appendSessionInfo(name)` — display name shown in `/resume` pickers.
- `appendCustomEntry(customType, data)` — extension state that **does not enter LLM context** (survives compaction untouched).
- `appendCustomMessageEntry(...)` — extension messages that **do** enter LLM context (not used by v1).
- `SessionManager.listAll()` — walks every session across every `cwd` (this is the cross-pwd index; no separate index file needed).
- `pi --session <path>` — launch into a specific session file regardless of `cwd`.
- `session_before_tree` event — fires before `/tree` navigation; can return a custom summary used as the `BranchSummaryEntry`.
- `turn_end` event — fires after each turn; safe place for background work.
- `pi.registerTool` — register tools the LLM can call (`thought_recall`).
- `pi.registerCommand` — register slash commands.
- `ctx.ui.input` / `ctx.ui.confirm` / `ctx.ui.select` / `ctx.ui.notify` — user prompts.

### Real gaps in pi that justify building anything

1. Sessions are `cwd`-scoped under `~/.pi/agent/sessions/--<path>--/<ts>_<uuid>.jsonl`; user forgets which directory a thread lives in.
2. Branches and labels are unnamed by default; threads are unfindable later.
3. Auto-compaction may erase the original wording at a labeled fork point if relying on summary-only retention.
4. pi has no concept of "this branch is part of a named, multi-session thought thread."

## Approach

Build one TypeScript extension at `~/.pi/agent/extensions/thoughts/index.ts`. It is **glue over native primitives**, not a parallel system.

Three load-bearing design moves, each with a clear reason:

1. **Label convention as the only marker.** Every thought anchor is a pi `LabelEntry` with `label = "thought:<name>"`. All discovery (cross-pwd via `listAll()`) filters on this prefix. No separate index file. The session JSONLs are the source of truth.

2. **Custom entries as canonical snapshots.** Alongside each label, append a `CustomEntry` with `customType: "thoughts"` carrying `{ anchorId, name, snapshot: <verbatim text>, kind: "start" | "label", createdAt }`. Because `CustomEntry` is not in LLM context, compaction cannot rewrite or erase it. The `thought_recall(anchorId)` tool reads this entry on demand. **This is what makes the anchor truly durable.**

3. **Background pre-generation of thought-shaped summaries.** On `turn_end`, if the current branch contains a `thought:`-labeled ancestor and has new turns since the last summary, generate a thought-shaped summary (Live edge / What was tried / What was decided / Open questions / Resume here) using the configured worker model and store it in another `CustomEntry` (`kind: "summary"`). When `session_before_tree` fires leaving this branch, return the most recent stored summary — no sync LLM call at navigation time.

### Naming prompt (load-bearing)

`/thought start` without an argument prompts via `ctx.ui.input`. The prompt text is the product. Bias the user toward *the live question*, not the topic:

```
Name this thought thread.

A good name is the live question or tension, not the topic.

  ✓ "Lead with 1 Gig or 500 on Frontier offer page?"
  ✓ "Does a thought tracker belong inside pk?"

  ✗ "Frontier review"        (topic, not question)
  ✗ "thoughts about pricing" (vague)
  ✗ "meeting notes"          (container, not thought)
```

Validation rules:

- Reject empty or `< 8` chars.
- Reject reserved stems: `notes`, `thoughts`, `misc`, `todo`, `temp`, `untitled`.
- If no `?` and no verb, soft-reject once with: *"That looks like a topic. What's the actual question or tension?"* Accept on second try regardless.
- Shortcut `/thought start "<name>"` skips the prompt entirely.
- Slugify for use as the label: `"Lead with 1G or 500?"` → `lead-with-1g-or-500`. Store the original (`displayName`) and the slug (`name`) both in the custom entry.

### Thought-shaped branch summary prompt

Generated at `turn_end` (background) and returned at `session_before_tree`:

```
You are summarizing an abandoned branch of a thought thread so the user can re-enter it later without replaying the conversation.

Thread name: <displayName>

Produce a summary in EXACTLY this format. Be terse. No prose preambles.

## Live edge
The single most recent open question or unresolved tension on this branch. One sentence. If multiple, pick the one being actively worked on.

## What was tried
Bullet list of distinct moves explored on this branch. Past tense, one line each.

## What was decided
Bullet list of conclusions reached on this branch, if any. If none, write "Nothing committed."

## Open questions
Questions raised that were not answered. If none, write "None."

## Resume here
The single next move the user should take. Imperative, one sentence. If the branch felt complete, write "Branch felt resolved."

## Rules
- Summarize the *thinking*, not the *topic*.
- Preserve the user's own phrasing for key claims/questions.
- Never invent decisions that weren't explicit.
- Keep total length under 200 words.
```

## Decisions

- 2026-05-29: **Native session tree, not custom storage.** pi's `/tree` already provides structural context isolation on rewind. Building parallel node files would duplicate it.
- 2026-05-29: **No companion skill.** Slash-command invocation + structural context isolation leaves no expert-knowledge gap a skill could fill. If framing text is later needed, use a pi prompt template.
- 2026-05-29: **Opt-in marking only (no auto-detect).** Predictable, no false positives, builds the habit deliberately.
- 2026-05-29: **ID + `thought_recall` tool > verbatim-preserving compaction prompts.** Snapshots live in `CustomEntry` which is outside LLM context; recall is one tool call away. Robust to lossy summaries.
- 2026-05-29: **Background summary generation at `turn_end`.** Navigation via `/tree` should never wait on a model.
- 2026-05-29: **Defer pk integration.** `/thought promote` was the only cross-system piece; cutting it makes v1 self-contained and avoids guessing at the right pk shape before real usage.
- 2026-05-29: **Flat-first, no tree UI sugar in v1.** Observed real usage (Frontier creative-review thread) was almost entirely linear with one quick fork. Parking/ancestry views deferred until observed pain.

## Implementation Breakdown

### Phase 1 — Skeleton and core commands

- [ ] **Scaffold extension package**
  - Acceptance: `~/.pi/agent/extensions/thoughts/index.ts` exists; loads cleanly under `pi -e` and via auto-discovery; `package.json` declares no external deps beyond pi's provided imports.
  - Verify: `pi -e ~/.pi/agent/extensions/thoughts/index.ts` starts without errors; `/reload` succeeds.
  - Depends on: none.

- [ ] **Define internal types and label/customType conventions**
  - Acceptance: Single `types.ts` (or inline) defines `ThoughtAnchor`, `ThoughtSummary`, `ThoughtsCustomData` discriminated union with `kind: "start" | "label" | "summary"`. Label prefix constant `THOUGHT_LABEL_PREFIX = "thought:"`. Slug function with reserved-stem rejection.
  - Verify: Unit-level: slug edge cases (`""`, `"notes"`, `"Lead 1G?"`, very long names) behave as specified.
  - Depends on: scaffold.

- [ ] **Implement `/thought start <name?>`**
  - Acceptance: With arg → validates, slugifies, calls `appendSessionInfo(displayName)`, `appendLabelChange(currentLeafId, "thought:<slug>")`, appends `CustomEntry({kind:"start", anchorId, name, displayName, snapshot})`. Without arg → prompts via `ctx.ui.input` with the naming prompt text above; soft-rejects topic-shaped names once.
  - Verify: Run command in a session; inspect session JSONL — expect `session_info`, `label`, `custom` entries with correct shapes. `/resume` picker shows the display name.
  - Depends on: types.

- [ ] **Implement `/thought label <sub-name?>`**
  - Acceptance: Requires an active `thought:` ancestor on the current branch; otherwise notifies "no active thought thread — run `/thought start` first." Appends a label `thought:<parent-slug>/<sub-slug>` and a snapshot custom entry of kind `"label"`.
  - Verify: Manual session test; inspect entries.
  - Depends on: `/thought start`.

- [ ] **Snapshot capture helper**
  - Acceptance: Given a leaf entry id, collect the user message at the leaf + previous assistant message + previous user message (if any). Render as plain text. Truncate each block to 4 KB. This is the `snapshot` field on `ThoughtAnchor`.
  - Verify: Snapshots are stable across runs; never include tool-result blobs raw.
  - Depends on: types.

### Phase 2 — Cross-pwd discovery and resume

- [ ] **Implement `/thoughts` (global index)**
  - Acceptance: Calls `SessionManager.listAll()`, opens each session lazily, collects entries with `type === "label"` matching `thought:` prefix. Groups by `name` (slug), shows: display name, `cwd`, session file path, label count, last-touched timestamp. Renders as a TUI table (or simple list if `ctx.ui` table not available).
  - Verify: Create threads in two different working directories; run `/thoughts` from a third — expect both listed.
  - Depends on: `/thought start`.

- [ ] **Implement `/thought resume <name>`**
  - Acceptance: Resolves slug → session path via the same scan as `/thoughts`. If multiple sessions contain the name (forks), prompt `ctx.ui.select`. Prints the command `pi --session <path>` for the user to run; optionally `ctx.ui.confirm` to launch via `ctx.spawn` if available. Falls back to printing the command if direct launch isn't possible.
  - Verify: Resume a thread created in a different `cwd`; confirm the loaded session shows the right session info and labels.
  - Depends on: `/thoughts`.

- [ ] **Implement `/thought status`**
  - Acceptance: In a session with an active thought ancestor: prints display name, slug, current anchor id, count of `label`-kind anchors on this branch, age of most recent `summary` custom entry (or "no summary yet"), and the `passive` setting state. In a session with no thought ancestor: prints "no active thought thread on this branch."
  - Verify: Manual.
  - Depends on: `/thought start`.

- [ ] **Implement `/thought view <name?> [full]`**
  - Acceptance: Without `<name>`, uses current branch's thread. Renders: display name → anchors (each with `kind`, timestamp, first 200 chars of snapshot) → latest summary if present. With `full`, includes complete snapshots. Attempts clipboard copy of the rendered text via `ctx.ui.copyToClipboard` if available; falls back to printing.
  - Verify: Manual.
  - Depends on: `/thoughts`.

### Phase 3 — `thought_recall` tool

- [ ] **Register `thought_recall` LLM tool**
  - Acceptance: Tool parameters: `anchorId: string` (12-char hex). Walks the current session's entries (via `SessionManager` instance from `ctx`), finds the `CustomEntry` whose `data.anchorId === anchorId`, returns the verbatim snapshot as the tool result. Errors with a clear message if not found. Tool description explains: "Use to recover the original verbatim text at a labeled thought anchor. Useful after compaction has summarized the surrounding context."
  - Verify: In a session with a known anchor id, the agent can call `thought_recall(anchorId)` and receive the snapshot text.
  - Depends on: snapshot capture helper.

### Phase 4 — Background summary generation

- [ ] **Settings schema**
  - Acceptance: Read settings from `ctx.getSettings("thoughts")` (or via pi's settings API): `{ model?: { provider: string; id: string; thinking?: ThinkingLevel }; passive?: boolean; debugLog?: boolean }`. Defaults: model unset (use session model), passive false, debugLog false.
  - Verify: Manual.
  - Depends on: scaffold.

- [ ] **`turn_end` hook: detect thought-labeled branch and schedule summary**
  - Acceptance: On `turn_end`, if `passive === false`, walk from current leaf upward; if any ancestor has a `thought:` label, find the most recent `kind:"summary"` custom entry on this branch and compare its `parentId`'s position to the current leaf. If there are new turns since the last summary (or no summary yet), enqueue a single background generation. Re-entry while one is in-flight is a no-op. Errors caught and logged to debug NDJSON when enabled; never thrown into the user session.
  - Verify: Manual: enable debug log, run a few turns inside a thought thread, confirm a single summary task per turn-end batch and a single resulting custom entry.
  - Depends on: settings, snapshot helper.

- [ ] **Background summary generator using the prompt above**
  - Acceptance: Serializes branch entries from the thought-start ancestor to current leaf via `serializeConversation(convertToLlm(entries))`, builds the prompt with the configured display name, calls the configured worker model (or session model if unset) with a tight max-tokens. Appends a `CustomEntry({kind:"summary", anchorRootId, summary, generatedAt, modelId})`.
  - Verify: Inspect generated summaries on a real thread; verify the format matches the prompt's required sections.
  - Depends on: `turn_end` hook.

- [ ] **`session_before_tree` hook: return pre-generated summary**
  - Acceptance: When leaving a branch that has a thought-start ancestor and `userWantsSummary === true`, return `{ summary: { summary: <latest summary text>, details: { thoughtThread: <displayName>, anchorRootId } } }`. If no pre-generated summary exists, return undefined (let pi's default summarization handle it).
  - Verify: Navigate away from a thought-labeled branch via `/tree`; the resulting `BranchSummaryEntry` carries the thought-shaped summary.
  - Depends on: background summary generator.

### Phase 5 — Debug NDJSON

- [ ] **Debug logger**
  - Acceptance: When `debugLog: true`, write per-session NDJSON to `~/.pi/agent/thoughts/debug/<session-id>.ndjson`. Events: `start`, `label`, `summary-scheduled`, `summary-generated`, `summary-error`, `recall-hit`, `recall-miss`. Each event a single JSON line with `ts`, `event`, and event-specific fields.
  - Verify: Enable in settings; perform a sequence; tail the file and confirm event shape.
  - Depends on: scaffold, settings.

### Phase 6 — Documentation

- [ ] **README in extension dir**
  - Acceptance: `~/.pi/agent/extensions/thoughts/README.md` covers: what it does, install/load, command reference, settings, the thought-shaped summary format, and the deferred-pk note.
  - Verify: A fresh reader can install and use without further questions.
  - Depends on: all features working.

## Validation

End-to-end acceptance ("would you actually use it?") test:

1. In `~/code/project-a`, run `/thought start` — get prompted, enter `"Lead with 1G or 500 on Frontier offer page?"`. Run a few turns of discussion.
2. `/thought label` mid-discussion to mark a sub-checkpoint.
3. `/tree` back to the start, take a different angle. Confirm the abandoned branch's `BranchSummaryEntry` uses the thought-shaped format.
4. Switch to `~/code/project-b`. Run `/thoughts` — expect the thread listed with `project-a` as its `cwd`.
5. Run `/thought resume "lead-1g-or-500"`. Confirm the session reopens correctly.
6. Force a compaction (`/compact`). After it completes, ask the agent something that references the original anchor wording. Confirm the agent can call `thought_recall(<anchorId>)` and receive verbatim source.
7. Set `passive: true`, run more turns, confirm no background generation occurs.

Each phase also has its per-task `Verify` line; those are the inner loops.

## Outcome

(empty until v1 lands; record completion, gaps, and any v2 candidates here — likely the deferred pk-promotion command, parking/ancestry sugar, or auto-detect of thought moments)

## Related

- pk decision: `decision-2026-05-29-thought-thread-tracking-pi-session-tree-pk-promotion-via-a-thin-extension-and-skill`
- pi docs: `docs/sessions.md`, `docs/session-format.md`, `docs/compaction.md`, `docs/extensions.md`
- Inspiration (borrowed patterns, not code): https://github.com/elpapi42/pi-observational-memory
