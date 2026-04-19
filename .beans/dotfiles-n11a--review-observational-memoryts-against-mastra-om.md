---
# dotfiles-n11a
title: Review observational-memory.ts against Mastra OM
status: in-progress
type: task
priority: normal
created_at: 2026-04-19T22:24:16Z
updated_at: 2026-04-19T23:12:38Z
---

Review @pi/.pi/agent/extensions/observational-memory.ts, explain how it works, and compare it to Mastra's Observational Memory using current web docs.

- [ ] Inspect implementation
- [ ] Research Mastra OM docs/blog
- [ ] Summarize how the Pi extension works
- [ ] Compare against Mastra and call out gaps/mismatches


## Follow-up

User reported OM says "Observing..." but nothing seems to happen and status stays the same.

- [ ] Add runtime logging around observer flow
- [x] Log token counts, trigger decisions, auth, request start/end, append result, and status reset
- [x] Summarize what changed for the user


## New scope

- [ ] Analyze om-debug.log and identify why observations are empty
- [ ] Produce line-by-line gap analysis vs Mastra OM
- [ ] Propose a package/plugin architecture for easier configuration


User clarified the refactor must live under `pi/.pi/agent/extensions/`.
- [x] Move package-style OM extension into pi/.pi/agent/extensions/


- [x] Delete accidental duplicate OM extension under .pi/extensions/


- [x] Expose dedicated OM commands (/om:status and /om:observe)


- [x] Move OM config from .pi/om.config.json into pi settings


- [x] Improve OM model selection and surface provider/model errors in status


- [x] Add explicit system/instructions messages for OM observer and reflector provider calls


- [x] Switch OM observer/reflector from complete() to completeSimple() with systemPrompt


- [x] Set OM observer/reflector to an Anthropic Sonnet model for testing
