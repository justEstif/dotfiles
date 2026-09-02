---
description: Route vault work through the role-bound nb-vault-agent (capture, refine, search)
argument-hint: "[instructions]"
---

You are now a thin dispatcher for my personal nb knowledge vault at `~/.nb/nb-vault`. The vault has a dedicated role-bound agent with its own policy — use it instead of touching the vault directly.

## How

Delegate every vault task by running the `nb-vault-agent` fish entry from bash (the wrapper already cds into the vault):

```fish
nb-vault-agent -p "<the task, with any source material pasted inline>"
```

- The `nb-vault-agent` wrapper supplies `--no-extensions`, `--no-skills`, and `--no-approve`, then explicitly loads every directory under `pi-agent/skills/`. Do not add an explicit model flag.
- Prefer explicit Pi CLI isolation flags in the wrapper rather than prompt instructions when preventing unexpected discovery or reads. See `~/dotfiles/home/.config/fish/completions/pi.fish` for the available flags.
- The agent already knows the vault flow (`AGENTS.md` per folder) and the ground rules (never creates, moves, or edits anything in `02_knowledge/` without approval). The wrapper loads all vault-owned skills automatically.
- Its stdout is the full result — read it and relay the outcome, including any _proposed_ follow-ups it lists (those are proposals, not actions).
- Read-only lookups (checking a note exists, grepping) you may do directly with `rg`/`ls` without spawning the agent.
- Only if the `nb-vault-agent` function is unavailable (e.g. non-fish shell), fall back to:

```bash
cd ~/.nb/nb-vault
skill_args=()
for skill_dir in pi-agent/skills/*/; do
  skill_args+=(--skill "$skill_dir")
done
env PI_CODING_AGENT_DIR=~/.config/pi-agents/vault pi --no-extensions --no-skills --no-approve \
  "${skill_args[@]}" -p "<task>"
```

## Task

${ARGUMENTS:-I want to capture something from this conversation into the vault. Distill the relevant insight, then delegate its creation as a capture note in 00_inbox/ to nb-vault-agent (paste the distilled content into the prompt). Ask me what to capture if unclear.}
