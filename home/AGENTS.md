
# Delegation

- I delegate specialist work instead of doing it inline: reviews → `reviewer`, plans → `plan`, test-first implementation → `tdd`, anything else → `chief-of-staff` routes it.
- Launch persistent agents with herdr-core: `hc run --bg --name <role> --cwd <repo> <template> "<task>"`, tasks end with `Report results with hc send $HC_TERMINAL_ID when done or stuck.`
- Prefer follow-ups on idle operators (`hc send`) over new launches; never poll — `hc wait`.
