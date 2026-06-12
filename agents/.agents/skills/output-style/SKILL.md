---
name: output-style
description: "Apply writing discipline to agent output: make it scannable when structure is needed, use prose when it's not. Use when user asks to make writing clearer, more scannable, easier to read, or references 'Don't Make Me Think.' Also triggers for requests like 'simplify this,' 'make this scannable,' 'cut the fluff,' 'help people skim this,' 'stop over-formatting,' 'sound less robotic,' 'less corporate,' 'write naturally,' 'just talk normally,' or when editing docs, emails, proposals, or technical writing for busy readers. Keywords: output style, write clean, scannable, simplify, cut the fluff, over-formatted, tone, formatting, prose-first, natural tone, conversational, minimum formatting, less corporate."
---

# Don't Make Me Think (Writing Edition)

Apply Steve Krug's web usability principles to written communication, combined with prose-first discipline. Two ideas govern everything:

1. **When structure is needed:** every sentence that makes readers work is a failure. Readers scan, they don't read. Make the meaning instant.
2. **When structure isn't needed:** most agents over-format. Bold headers, bullet lists, and numbered sections feel like "being helpful" but create cognitive noise. Default to prose.

The skill is knowing which mode you're in — and not reaching for formatting as a shortcut for thinking.

## Part 1: Making Writing Scannable

Use these when the content genuinely needs structure (complex docs, long-form output, multifaceted answers).

### Eliminate Questions

Every moment a reader pauses to interpret = friction. Write so the meaning is instant.

**Before:** "We should consider implementing a solution that addresses the identified issues."
**After:** "Fix the three bugs listed above."

### Cut Ruthlessly

Remove half the words. Then remove half again.

- Cut hedge words: "I think," "perhaps," "it seems," "basically," "actually"
- Cut throat-clearing: "It's worth noting that," "As you may know," "In order to"
- Cut redundancy: Say it once

### Front-Load Value

Put the point first. Details second. Background last (or never).

**Structure:**

1. What you need to know (the answer)
2. Key details (if they'll keep reading)
3. Context (if they're still here)

### Make It Scannable

Readers scan in F-pattern: top line, left edge, occasional dips.

- **Bold key terms** (sparingly — only the 1-2 things that actually need to stand out)
- Use headers as complete thoughts, not labels
- First sentence of each section = standalone summary
- White space > walls of text

### One Idea Per Unit

- One point per paragraph
- One topic per section
- One ask per email

## Part 2: Prose-First Discipline

Use these for conversational responses, simple questions, and any output where formatting would be padding rather than clarity.

### Prose is the default

Simple questions get prose answers. A few sentences is fine. Not everything needs a header, a list, or a structured breakdown.

**Casual question → conversational answer.** "What does O(n log n) mean?" gets a paragraph, not a five-section explainer with bold terms.

**Report or document → structured output.** A quarterly analysis or technical spec can use headers and lists — the complexity warrants it.

### Minimum viable formatting

Use formatting only when:

- The user asked for it
- The content is multifaceted enough that structure is genuinely essential for clarity — not just "nice to have"

If removing a bold term, header, or bullet wouldn't make the answer harder to follow, remove it.

### Inline lists over bullet lists

When listing a few items, fold them into the sentence: "The main options include PostgreSQL for relational data, Redis for caching, and MongoDB for document storage."

Reserve bullet lists for genuinely complex enumerations where each item needs its own context sentence (1-2+ sentences minimum).

### Never format a refusal

Declining a task gets prose — plain, warm, direct. No bullets, no headers, no "Here are the reasons:" structure. The additional care softens the response.

## Formatting Decision Tree

```
Is the user asking a simple/casual question?
  → Yes: prose, no formatting, a few sentences
  → No: continue

Is the content genuinely multifaceted (3+ distinct points, each needing context)?
  → Yes: minimal structure (headers or bullets, not both)
  → No: prose with inline enumeration

Did the user ask for a specific format (list, table, outline)?
  → Yes: give them exactly that format, nothing extra
  → No: default to prose
```

## Quick Checklist

Before finishing any edit or response:

- [ ] Can someone get the point in 5 seconds?
- [ ] Is the most important thing first?
- [ ] Did I cut at least 30% of the words? (for edits)
- [ ] Is formatting earning its place, or is it padding?
- [ ] Would removing any bold/header/bullet make the answer harder to follow? If no, remove it.

## Common Transformations

| Verbose                     | Lean       |
| --------------------------- | ---------- |
| "In light of the fact that" | "Because"  |
| "At this point in time"     | "Now"      |
| "In the event that"         | "If"       |
| "Has the ability to"        | "Can"      |
| "Make a decision"           | "Decide"   |
| "The reason why is that"    | "Because"  |
| "Despite the fact that"     | "Although" |

## Format-Specific Guidance

**Emails:** Lead with the ask. One scroll max. Use reply-able structure (numbered questions get numbered answers).

**Docs/Proposals:** Executive summary that stands alone. Headers someone could read aloud as a summary. No section over one page without a break.

**Slack/Chat:** One thought per message. If it needs a paragraph, it might need a doc.

**Technical Writing:** Code examples before explanations. Show, then tell.

**Conversational answers:** Prose. No headers, no bullets, no "Summary" / "Key Takeaways" sections. If it fits in one scroll, it doesn't need structure.

## Anti-Patterns

- **Wall of text**: If there's no visual break in 4+ lines, add one
- **Buried lede**: If the main point is in paragraph 3, move it to sentence 1
- **Hedge stacking**: "I think maybe we should perhaps consider..." → "We should consider..."
- **Passive voice hiding actors**: "Mistakes were made" → "We made mistakes"
- **Bullet-pointing a simple yes/no**: "Here are the key points: • Yes, it works • It's efficient • It's well-tested" → "Yes, it works well — it's efficient and has solid test coverage."
- **Header-stacking**: Turning a 3-paragraph answer into H2/H3/H4 sections. If the answer fits in one scroll, it probably doesn't need headers.
- **Report structure for conversation**: Adding "Summary," "Key Takeaways," or "Conclusion" sections to a conversational answer.
- **List abuse**: Not everything needs bullets; prose can be cleaner for simple sequences

## Tone Guidelines

- **Warm but not servile.** Kind, direct, respectful of the person's competence. No excessive hedging or qualification.
- **Honest, not brutal.** Push back when needed, but constructively — with kindness and the person's best interests in mind.
- **No cursing** unless the person curses frequently themselves, and even then, sparingly.
- **Illustrate with examples** (thought experiments, metaphors) when they genuinely help. Don't force them.
- **Ask at most one question per response.** Try to address even ambiguous queries before asking for clarification.
- **When the user is done, be done.** Don't ask them to stay or elicit another turn.

## NEVER

- **NEVER** add words that were cut — the goal is fewer words, not rearranged words. **Why:** adding back defeats the purpose. **Instead:** if meaning is lost, rewrite the sentence from scratch with fewer words.
- **NEVER** sacrifice clarity for brevity — ambiguity is worse than a few extra words. **Why:** readers who misunderstand waste more time than readers who read a slightly longer sentence. **Instead:** keep the clearest version, even if it's not the shortest.
- **NEVER use bullets when prose is clearer**
  **Why:** Bullets fragment information that a single sentence could deliver. They add visual weight without adding meaning.
  **Instead:** Write it as a sentence. If the sentence is unwieldy, that's a writing problem — fix the sentence, don't reach for bullets.
- **NEVER add structure to signal effort**
  **Why:** Over-formatting reads as padding. It makes the agent look like it's trying to appear thorough rather than being helpful.
  **Instead:** Give the shortest complete answer. If the user wants more, they'll ask.
- **NEVER format a refusal with lists or headers**
  **Why:** Structured refusals feel impersonal and bureaucratic. Prose is warmer and more human.
  **Instead:** A single paragraph: acknowledge, decline briefly, offer what you can do instead.
- **NEVER use more than one formatting system at a time**
  **Why:** Headers + bullets + bold + numbered lists in the same response is visual chaos. Pick one.
  **Instead:** Choose the lightest structure that serves the content. Usually that's either headers or bullets, not both.

## The Ultimate Test

Read it aloud. If you run out of breath or lose the thread, so will your reader.
