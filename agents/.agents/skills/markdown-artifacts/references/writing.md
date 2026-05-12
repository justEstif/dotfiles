# Writing Readable Markdown

Based on *Don't Make Me Think* by Steve Krug, applied to Markdown artifacts.

Readers scan. They don't read your spec top-to-bottom. They grab the first answer that looks right and muddle through. Write for that behavior, not against it.

## Krug's Three Laws for Markdown

### 1. Don't make me think

Headings must be self-evident. The reader should know what a section contains without reading the body.

Bad:

```markdown
## Overview
## Details
## Other Considerations
```

Good:

```markdown
## Chosen approach: event-driven decomposition
## Why not: shared database with CDC
## Open questions before implementation
```

### 2. Easy choices, not fewer sections

It doesn't matter how many sections you have, as long as each is clearly labeled and short. A 10-section spec where every heading answers "what's in here?" beats a 3-section spec with walls of text.

### 3. Omit needless words

Cut half. Then cut half again.

Remove:

- **Happy talk** — "In this section we will explore..." → delete the sentence.
- **Setup paragraphs** — "Before diving in, it's important to understand..." → start with the thing.
- **Qualifier stacking** — "It might be worth considering that perhaps..." → say the thing.
- **Transition sentences** — "Now that we've covered X, let's move to Y." → use a heading.

## Visual Hierarchy

One `#`, a few `##`, mostly `###`. Never skip levels.

```markdown
# Document title (one per document)

## Major section (3–7 per document)

### Subsection (as needed, rarely deeper)
```

If you need `####`, the section is probably too deep. Flatten or split into a separate document.

## Scannability

Readers scan for: headings, bold terms, lists, tables. Write so those elements carry the message alone.

**Bold only what you'd want found in a scan.** Not whole sentences:

```markdown
Bad: **This means we should use a managed queue instead of self-hosted.**
Good: Use a **managed queue** instead of self-hosted.
```

**Lists over paragraphs when enumerating.** A paragraph with "first... second... third..." should be a list.

**Tables over prose when comparing.** "Option A does X but not Y. Option B does Y but not X..." → table.

## Section Structure

Every section should answer one of:

- **What** is this?
- **Why** this and not something else?
- **How** does it work?
- **What's next** / what's blocked?

If a section answers none of these, delete it.

## Decision Records

When recording a decision, use a consistent format:

```markdown
## Decision: use event-driven decomposition

**Chosen:** Domain events via message bus.

**Not chosen:** Shared database with CDC, direct service calls.

**Why:** Latency tolerance allows eventual consistency. Team ownership boundaries align with domain boundaries.

**Revisit when:** Latency SLO tightens below 100ms p99.
```

This is scannable. A reader gets the decision in the first line, the alternatives in three words, and the reasoning in one sentence.

## Callouts

Use blockquotes sparingly and consistently:

```markdown
> **Warning:** This migration requires downtime. Schedule for off-peak.

> **Note:** The old endpoint is still active until 2026-06-01.

> **Assumption:** The upstream API returns within 2s at p95.
```

Do not use callouts for normal content. If everything is in a callout, nothing is.

## Collapsible Sections

For reference material that supports but is not essential to the main document:

```markdown
<details>
<summary>Raw benchmark data</summary>

| Run | Latency (ms) |
| --- | --- |
| 1   | 42           |
| 2   | 38           |

</details>
```

GitHub, GitLab, and most Markdown renderers support this. Use it to keep the main document scannable while preserving detail.

## Anti-Patterns

| Anti-pattern | Why it hurts | Fix |
| --- | --- | --- |
| Generic headings ("Overview", "Details") | Reader must open the section to learn anything | Use noun phrases that state the content |
| Walls of text (>5 sentences without a break) | Scanner gives up | Lists, tables, bold terms, or split sections |
| Happy talk / intro paragraphs | Zero information, costs attention | Delete |
| Bold entire sentences | Reader can't distinguish signal from noise | Bold the 2–3 key terms |
| Emoji as decoration | Adds visual noise without information | Use only when the emoji is the information (e.g. status indicators) |
| Inconsistent section order across artifacts | Reader can't build a mental model | Use a standard section template per artifact type |
| "TBD" / "TODO" without ownership | Signals unfinished thinking without accountability | State who decides and when, or delete the section |
