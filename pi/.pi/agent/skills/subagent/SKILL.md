---
name: subagent
description: Spawn one or more small pi subagents as separate pi processes for explicit delegation requests. Use when the user says subagent, spawn subagent, delegate to subagents, plan agent, research agent, or review agent. Runs deterministic Python orchestration with per-agent reference files, curated context, dependency ordering, and saved artifacts.
---

# Subagent

Spawn small pi instances as disposable subagents. Pi has no native subagent feature; this skill implements it by writing an explicit JSON plan and running `scripts/run-subagents.py`.

## Agent types

Read the relevant reference before planning a run:

- `references/plan-agent.md` — small plans/checkpoints; no execution.
- `references/research-agent.md` — read-only investigation with evidence.
- `references/review-agent.md` — independent critique of a plan, design, diff, or implementation.

Each reference has Claude-style frontmatter. Treat it as the contract for tools, model, write policy, parallel safety, and prompt body.

## Orchestration rules

- Only activate on explicit user intent: `subagent`, `spawn subagent`, `delegate to subagents`, or named agent requests.
- Choose the smallest useful number of subagents.
- Infer agent type from the request; ask one clarifying question if ambiguous.
- Curate context. Do not dump the full conversation into subagent prompts.
- Encode dependencies with `depends_on`; independent subagents run in parallel.
- Main thread owns synthesis and final decisions.
- If subagents disagree, resolve when evidence is clear; otherwise show disagreement and ask the user.

## JSON plan

Write a temporary plan file and pass it to the runner:

```json
{
  "task": "overall user request",
  "context": "curated shared context: goals, constraints, known decisions, relevant files/commands",
  "subagents": [
    {
      "id": "research-1",
      "type": "research",
      "task": "one narrow question or artifact",
      "tools": "read-only",
      "model": null,
      "depends_on": []
    }
  ]
}
```

`type` maps to `references/<type>-agent.md`. The runner also accepts full names like `research-agent`.

## Run

From the skill directory:

```bash
python3 scripts/run-subagents.py /path/to/plan.json
```

The script saves artifacts to:

- project repo: `.pi/subagents/<timestamp>-<task>/`
- outside a repo: `~/.pi/agent/subagents/<timestamp>-<task>/`

Artifacts include:

- `manifest.md`
- `plan.json`
- `<agent-id>-prompt.md`
- `<agent-id>-output.md`
- `summary.md`

Return a short synthesis first, then the artifact directory and separated raw outputs/evidence.

## Safety

- Do not hand-write ad-hoc background `pi` shell loops; use the Python runner.
- Do not let the script infer agent types; the main pi must write an explicit plan.
- Do not add write-capable behavior globally. Write policy belongs in each reference agent contract.
