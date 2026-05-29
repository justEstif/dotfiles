# thoughts — pi extension

Track named thought threads across sessions and working directories. Built on top of pi's native `/tree` — this extension adds naming, cross-session discovery, and automatic branch capture.

## Mental model

Pi's `/tree` already handles navigation within a thought. This extension adds the layer above it:

```
/thoughts:start "question"   ← name a train of thinking
  ... have a conversation ...
  /tree                       ← branch, explore, backtrack (pi native)
  /tree                       ← auto-labeled + summarized each time
/thoughts:switch              ← jump to a different thought (picker)
/thoughts:switch <slug>       ← jump directly
/thoughts                     ← see all active threads
```

That's the full workflow. Everything else is automatic.

## What happens automatically

**Every turn** (`turn_end`):
- A heuristic summary is regenerated in the background — questions found, decisions made, approaches tried, open issues

**Every `/tree` navigation** (`session_before_tree`):
- The current branch point is auto-labeled (e.g. `branch-1`, `branch-2`)
- A snapshot of the current conversation is captured at that point
- The pre-generated summary is attached at the new position so you don't lose context

## Commands

### `/thoughts:start [name]`

Start a thought thread. If no name given, prompts you.

A good name is the live question or tension — not the topic:
```
✓ "Lead with 1 Gig or 500 on Frontier offer page?"
✓ "Does a thought tracker belong inside pk?"
✗ "Frontier review"           (topic, not question)
✗ "meeting notes"             (container, not thought)
```

### `/thoughts:switch [slug]`

Jump to a different thought thread — works across sessions and working directories.

With no argument, shows a picker of all known threads. With a slug, jumps directly.

```
/thoughts:switch
/thoughts:switch lead-with-1g-or-500
```

### `/thoughts`

List all thought threads across every session and working directory, sorted by last activity.

```
Thought Threads:

  Lead with 1 Gig or 500?
    slug: lead-with-1g-or-500
    cwd: ~/work/frontier
    modified: 3m ago

  Does a thought tracker belong in pk?
    slug: does-a-thought-tracker-belong-in-pk
    cwd: ~/dotfiles/pi
    modified: 2d ago
```

## The `thought_recall` tool

After compaction erases context, the LLM can recover the original verbatim text at any labeled anchor:

```
thought_recall(anchorId: "756abf8fc800")
```

Returns the original snapshot text captured when that anchor was created.

## Storage

All state lives in pi's session JSONLs — no separate index files.

- **Labels**: `thought:<slug>` on any session entry — this is how cross-session discovery works
- **Custom entries**: snapshots, summaries, and branch labels stored as `CustomEntry` with `customType: "thoughts"` — these live outside LLM context so compaction never touches them

## Index file

`~/.pi/agent/thoughts-index.jsonl` — one entry per line, written when you run `/thoughts:start`. Read by `/thoughts` and `/thoughts:switch`. If a session file is later deleted, its entry is silently skipped.

## Settings

```json
{
  "thoughts": {
    "passive": true
  }
}
```

`passive: true` disables automatic summary generation (branch labeling still happens).
