# Technical writing

Write so a tired engineer understands on the first read.

For a doc the user wrote, these layers are a standard to review against, not a license to rewrite. Route it through the `proof-reader` skill, which flags and asks.

Three rules sit above the layers:

- **Cut every word that does no work.** If the sentence survives without a word, the word goes. "In order to" is "to". "It is important to note that" is nothing.
- **Use the short, everyday word.** "Use", not "utilize". "Help", not "facilitate". "Do", not "perform". A long word has to buy its length with precision.
- **When a rule makes a sentence worse, fix the sentence another way or leave it alone.** A sentence that follows every rule and sounds like a machine wrote it has failed.

The codebase is the word list. Write the real symbol, file, flag, or command name, not a synonym or a description of it.

Don't invent jargon. Use the words a developer would say out loud: "move", "delete", "a budget that only decreases", not "evacuate", "ratchet", or "endgame". A named pattern is fine when the doc says what it means the first time. Propose a new offender and its replacement as an addition to [unslop](unslop.md)'s abstract-metaphor rule in your reply, with the diff. Don't edit that file.

## Vary the rhythm

A doc can obey every layer and still read machine-written: every sentence clipped short, no view anywhere, nothing specific.

- Mix sentence lengths on purpose. Short sentences land a point. Longer ones carry a fact with its condition or consequence.
- One thought per sentence does not mean one length per sentence. Split the sentence that carries two thoughts. Keep the long sentence that carries one.
- Have a view where the mode allows it. Explanation weighs trade-offs, so say what you make of them instead of listing pros and cons. Reference stays dry.
- Be specific over sterile. Not "schema changes can cause issues" but "a column rename fails the build".

## Shape

- **One document, one job.** A how-to tells the reader what to do; an explanation says why; a reference lists facts. Don't mix them in one doc.
- **PR descriptions and commit messages** follow `publisher`'s [opening-a-pr](../../publisher/references/opening-a-pr.md) format. Link logs and tables; don't paste them.
- **Write real paths.** Make every count or tree claim true at the commit that lands it, and include the command that regenerates it.
- Apply [unslop](unslop.md) while drafting.

## Worked example

Before:

> Configuration of the proto import ratchet budget script parameters is performed via budget.json. Note that it's important to remember that running with --write, which updates the committed budget to reflect the current count, should only be done when lowering it. If exceeded, CI fails.

After:

> `budget.mjs` reads the committed budget from `budget.json` and counts the files that import protos. If the count exceeds the budget, CI fails. Run `budget.mjs --write` only to lower the budget.

## Related

The local `documenter` skill generates project docs; this file is the standard those docs are held to. The local `proof-reader` skill reviews human-authored prose. Apply both where they fit; don't merge the jobs.
