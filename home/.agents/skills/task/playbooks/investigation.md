---
source: https://github.com/cursor/plugins/tree/main/pstack/skills/poteto-mode
license: MIT (pstack, by poteto)
---

### Investigation

**You own the answer. Plan, route, write.**

Investigation requests are read-only. They produce a cited explanation or a recommendation, not a code change.

1. Route through the [how](../../understand/references/how.md) skill. For motivation questions, also route through the [why](../../understand/references/why.md) skill.
2. Throughput checkpoint stays one line: `throughput checkpoint: n/a, read-only investigation`.
3. Produce the how-shaped output (Overview / Key Concepts / How It Works / Where Things Live / Gotchas), or a recommendation with a tradeoffs table if the request is a decision between alternatives.
4. Apply the [unslop](../../writing/references/unslop.md) skill to the reply.

No PR, no watch loop, no [architect](../../fanout/references/architect.md) unless the investigation precedes a code change. If it does, hand back to the user and re-route to Bug fix or Feature.

**Reply:** the investigation output. For "are we sure?" answers, include your real judgment with reasons. Push back if the premise is wrong (see Autonomy in the [task SKILL.md](../SKILL.md)).
