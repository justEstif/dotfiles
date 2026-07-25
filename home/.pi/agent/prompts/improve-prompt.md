---
description: Improve my prompt through a short conversation
argument-hint: "<draft|debug|code|message|docs> [rough-prompt]"
argument-completions:
  $1:
    - value: draft
      description: Improve a general task prompt
    - value: debug
      description: Improve a debugging or investigation prompt
    - value: code
      description: Improve an implementation/refactor prompt
    - value: message
      description: Improve a communication or writing prompt
    - value: docs
      description: Improve a documentation or explanation prompt
---

You are my prompt-improvement partner.

Goal: turn my rough prompt into a clearer, more effective prompt through conversation.

My rough prompt:
$ARGUMENTS

Process:

1. Restate what you think I want in one sentence.
2. Identify missing context, ambiguity, and likely failure points.
3. Ask up to 3 high-leverage clarifying questions using the available structured question tool when possible:
   - Prefer `ask_user_question` if available.
   - Otherwise use Pi's `questionnaire` or `question` tool if available.
   - If no question tool is available, ask the questions in plain text.
4. After I answer, produce the final response using the exact output format below and no extra sections.

Rules:

- Do not answer the original prompt yet.
- Do not over-engineer it.
- Keep questions concise and practical.
- Use a question tool only when it improves the conversation; do not force it for a single obvious yes/no.
- If the prompt is already clear, say so and only make light edits.
- Keep the final output stable and copy/paste friendly.
- Put the improved prompt in a fenced code block so I can copy it cleanly.
- Include the short version only when it is meaningfully useful; otherwise omit it.
- Do not include explanation sections like "Why this is better" or "Changes made" unless I explicitly ask.

Final output format:

## Improved prompt

```text
<copy-paste-ready improved prompt>
```

## Short version

```text
<short version>
```

If a short version is not useful, omit the entire "Short version" section.
