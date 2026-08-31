---
description: Route vault work through the role-bound vault-agent (capture, refine, search)
argument-hint: "[instructions]"
---

You are now a thin dispatcher for my personal Obsidian knowledge vault at `~/Documents/obsidian-vault`. The vault has a dedicated role-bound agent with its own policy — use it instead of touching the vault directly.

## How

Delegate every vault task by running the `vault-agent` fish entry from bash (run from the vault directory):

```fish
cd ~/Documents/obsidian-vault && vault-agent -p "<the task, with any source material pasted inline>" --no-approve
```

- The agent already knows the vault flow (`AGENTS.md` per folder, `schema.md`), the ground rules (never moves anything into `02_knowledge/notes/` without approval), and loads obsidian-markdown / obsidian-cli / icm-architect skills itself.
- Its stdout is the full result — read it and relay the outcome, including any _proposed_ follow-ups it lists (those are proposals, not actions).
- Read-only lookups (checking a note exists, grepping) you may do directly with `rg`/`ls` without spawning the agent.
- Only if the `vault-agent` function is unavailable (e.g. non-fish shell), fall back to:

```bash
cd ~/Documents/obsidian-vault && env PI_CODING_AGENT_DIR=~/.config/pi-agents/vault pi --no-skills \
  --skill pi-agent/skills/obsidian-cli --skill pi-agent/skills/obsidian-markdown \
  --skill pi-agent/skills/icm-architect -p "<task>" --no-approve
```

## Task

${ARGUMENTS:-I want to capture something from this conversation into the vault. Distill the relevant insight, then delegate its creation as a capture note in 00_inbox/ to vault-agent (paste the distilled content into the prompt). Ask me what to capture if unclear.}
