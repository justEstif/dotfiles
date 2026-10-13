---
name: understand
description: "The 5 pstack understanding skills (poteto, MIT) as reference files. Load when a trigger matches: 'how does X work', code walkthroughs before changing something, placement / ownership / layering questions ('where should this live', 'which package owns this', 'is this the right layer') (how); 'why does X work this way', 'why we picked Y', design rationale, regressions, postmortems, data-backed thresholds (why); 'teach me this', 'help me really understand X', 'explain this change or subsystem to me' (teach); 'recall my work on X', 'catch me up', 'what have I been working on', 'where did I leave off', before starting or resuming work (recall); catch the user up on everything in this chat since their last message, plain-words summary with action items (ketchup)."
source: https://github.com/cursor/plugins/tree/main/pstack
license: MIT (pstack, by poteto)
---

# Understand

The 5 pstack understanding skills by poteto (MIT), ported from the Cursor pstack plugin into `references/`. Bodies are the source skills' text; only Cursor machinery was adapted (spawn syntax → pi subagents, MCP discovery → local evidence, Cursor transcript paths → pi session storage, image-gen → pi codemode / tldraw-offline). Read the matched reference, not all of them.

| member | reference | trigger |
| --- | --- | --- |
| how | references/how.md | "How does X work", walkthrough before changing something, where-should-this-live. |
| why | references/why.md | "Why is X this way", "why we picked Y", design rationale, postmortems. |
| teach | references/teach.md | "Teach me this", "help me really understand X", explain a change or subsystem. |
| recall | references/recall.md | "Recall my work on X", "where did I leave off", rebuild context across past sessions. |
| ketchup | references/ketchup.md | Catch the user up on this one chat since their last message. |

## Bundle rules

- **Spawns are pi subagents** where dispatch is available, else one inline pass per role in a fresh context. `how`'s explorers and explainer are read-only; `why`'s investigators never write. Member files state this per step.
- **why's confidence language is governed by [why/epistemics.md](references/why/epistemics.md).** When `teach` or another member reuses `why`'s findings, the hedges are findings, not style. Never flatten them.
- **teach vs the local `teacher` skill:** `teacher` teaches any topic to a human via active recall and chunking; `teach` explains a code change or subsystem by running `how` and `why`. Distinct jobs; don't merge.
- **recall vs ketchup:** `recall` rebuilds working context across past sessions plus live repo state; `ketchup` summarizes this single chat since the user's last message. "Catch me up" with a named feature or file routes to `recall`.
- **Sidecars:** `references/how/explainer-prompt.md` belongs to `how`; `references/why/epistemics.md` belongs to `why`.
