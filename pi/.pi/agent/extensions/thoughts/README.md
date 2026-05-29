# thoughts extension for pi

Track named "thought threads" — long, branching trains of thinking that span sessions and working directories.

## What it does

The `thoughts` extension lets you:

1. **Start a named thread** with `/thought:start`, capturing a snapshot of your current context
2. **Add checkpoints** with `/thought:label` to mark key decision points within a thread
3. **Discover threads** across all working directories with `/thoughts`
4. **Resume a thread** from any directory with `/thought:resume <name>`
5. **View thread history** with `/thought:view` including snapshots and auto-generated summaries
6. **Query snapshots later** via the `thought_recall` LLM tool after compaction has erased context

Threads live inside pi's native session tree. No separate files, no sync issues. Everything persists in your session JSONLs.

## Install

Place this extension in `~/.pi/agent/extensions/thoughts/` (it should already be there). Restart pi or run `/reload`.

The extension auto-discovers in interactive and RPC modes. If you want to manually load it:

```bash
pi -e ~/.pi/agent/extensions/thoughts/index.ts
```

## Commands

### /thought:start [name]

Start a new thought thread.

- **With name**: `/thought:start "Lead with 1G or 500 on pricing?"`
- **Without name**: Prompts you to name it interactively

A good name is the **live question or tension**, not the topic:
- ✅ "Lead with 1 Gig or 500 on Frontier offer page?"
- ✅ "Does a thought tracker belong inside pk?"
- ❌ "Frontier review" (topic, not question)
- ❌ "thoughts about pricing" (vague)

The extension validates names:
- Must be at least 8 characters
- Cannot be reserved words (notes, thoughts, todo, temp, untitled, etc.)
- Soft-rejects topic-shaped names (no verb, no question mark) and lets you retry

### /thought:label [sub-name]

Add a checkpoint within the current thought thread.

- **With sub-name**: `/thought:label "reject 500-strategy"`
- **Without sub-name**: Prompts for a name (optional)

Useful for marking decision forks or major shifts in thinking within a single thread.

### /thought:status

Show the current thread's status:
- Display name and slug
- Anchor ID (for `thought_recall`)
- Number of checkpoints
- Age of most recent summary (if any)

### /thoughts

List all thought threads across all working directories.

Shows:
- Thread display name and slug
- Working directory it lives in
- Number of checkpoints
- Last modified time

### /thought:resume <name>

Resume a thought thread from any working directory.

- Opens the session containing that thread
- If multiple sessions contain the thread, prompts you to choose

### /thought:view [name] [full]

View a thread with all anchors and summaries.

- **Without args**: Shows current thread
- **With name**: `/thought:view "lead-with-1g-or-500"`
- **With full**: `/thought:view "lead-with-1g-or-500" full` — shows complete snapshots instead of previews

Copies the rendered output to clipboard if available.

## Thought-Shaped Summaries

When you leave a branch via `/tree` navigation, the extension optionally generates a summary of the abandoned branch in this format:

```
## Live edge
The single most recent open question or unresolved tension on this branch.

## What was tried
- Distinct move 1
- Distinct move 2

## What was decided
- Conclusion A
- Conclusion B

## Open questions
- Question 1 not yet answered
- Question 2 not yet answered

## Resume here
The single next move you should take.
```

This summary is:
- **Pre-generated in the background** after each turn (no waiting at navigation time)
- **Stored in custom entries** outside the LLM context (survives compaction untouched)
- **Returned at tree navigation** so you never replay the conversation

In v1, summaries are placeholder text. In v2, they'll be LLM-generated using a configurable worker model.

## The `thought_recall` Tool

After compaction erases context, the LLM can recover original text from thought anchors:

```
thought_recall(anchorId: "a1b2c3d4e5f6")
```

Returns:
- The original verbatim snapshot at that anchor
- Marked as `{ found: true }` or `{ found: false, isError: true }`

Useful when the agent needs to reference original wording that was lost in summarization.

## Storage Format

Threads are marked in pi's session JSONLs using two mechanisms:

### Labels
Each thread anchor is a `LabelEntry` with label = `"thought:<slug>"`. Example:
```json
{"type":"label","id":"abc123","targetId":"def456","label":"thought:lead-with-1g-or-500"}
```

### Custom Entries
Alongside each label, a `CustomEntry` stores the snapshot:
```json
{
  "type":"custom",
  "id":"xyz789",
  "customType":"thoughts",
  "data":{
    "kind":"start",
    "anchorId":"a1b2c3d4",
    "name":"lead-with-1g-or-500",
    "displayName":"Lead with 1 Gig or 500?",
    "snapshot":"User: [...]\n\nAssistant: [...]\n\nUser: [...]",
    "createdAt":1234567890000
  }
}
```

Custom entries live outside LLM context and survive compaction untouched. This is what makes anchors truly durable.

## Settings

Optional. In your `~/.pi/settings.json`:

```json
{
  "thoughts": {
    "passive": true,
    "enabled": true
  }
}
```

- **passive**: If `true`, disables background summary generation. Default: `false`
- **enabled**: If `false`, disables the extension entirely. Default: `true`

## Roadmap (v2+)

- [ ] LLM-generated summaries (currently placeholders)
- [ ] Configurable worker model for summaries
- [ ] `/thought:promote` — export a thread to pk as stable synthesized knowledge
- [ ] Ancestry views and tree visualization
- [ ] Auto-detect thought moments (prompt heuristics)
- [ ] Session parking (freeze abandoned branches)

## Notes

- Threads are **opt-in**. Run `/thought:start` to begin one.
- **No special file formats**. Everything lives in your session JSONLs under `~/.pi/agent/sessions/`.
- **Cross-pwd discovery** scans all sessions globally. `/thoughts` finds threads everywhere.
- **Snapshot capture** includes 3 messages: the leaf, the prior assistant response, and the message before that. Truncated to 4KB per block to avoid bloat.
- **Session info** is updated with the thread name, so `/resume` shows the thread name in the picker.

## Deferred Features (v1 → v2+)

The original plan included `/thought:promote` to export completed threads to pk. This is deferred until real usage reveals the right shape for pk integration. For now, threads are their own lightweight, speculative container.

## Errors & Troubleshooting

**"No active thought thread"**
- You haven't run `/thought:start` yet, or the thread is on a different branch.

**"Thread not found"**
- The thread slug doesn't match any session. Check `/thoughts` to list all threads.

**"No session loaded"**
- Pi doesn't have an active session. Start one with `/new`.

**Anchor ID not found in `thought_recall`**
- The anchor was deleted or the session was corrupted. Try `/thought:view` to inspect what's stored.

---

Built for pi's native session tree. Questions? Check the plan: `~/.pi/agent/extensions/thoughts/.ai/plans/plan.md`.
