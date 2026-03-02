---
name: zellij-subagents
description: run and coordinate multiple pi subagents in parallel using zellij panes.
---

# Skill: zellij-subagents

Use this skill to orchestrate parallel Pi subagents via Zellij.

## What this is for

Typical use cases:

- Parallel research (eg, one subagent per subsystem)
- Multi-step workflows (recon → implementation → review)
- Isolating subagent context windows in separate panes
- Durable handoff artifacts (`handoff.json`) per subagent

## Requirements

- `pi` installed
- `zellij` installed and on `PATH`
- `node` installed and on `PATH`

Optional:

- Custom subagent command via `--cmd` (overrides the default Pi execution)

## Install / Setup

```bash
git clone git@github.com:e-beyene/zellij-pi-orchestrator.git
cd zellij-pi-orchestrator
pi
```

Inside Pi:

```text
/reload
```

The project-local extension is auto-discovered from `.pi/extensions/zellij-orchestrator/`.

## Data model

Runtime state is stored at:
`<cwd>/.orchestrator/<session>/subagents/<id>/`

Key files:

- `inbox/<task_id>.task`
- `prompts/<task_id>.md`
- `done/<task_id>.out.txt`
- `status`
- `handoff.json`

## Notes

- Timeout behavior: wrap-up steer once, grace period, then force-terminate.
- If force-terminated, no synthetic handoff is created.
- Targeted pane termination is limited by Zellij CLI capabilities; session-wide terminate is most reliable.

## Interface (extension-native)

Use friendly extension commands:

```text
/zj-start <session> [worker1 worker2 ...]
/zj-task <session> <worker|all> <taskId> <promptFile|promptText>
/zj-run <session> <worker> <promptFile|promptText>
/zj-wait <session> [worker|all] [timeoutSec] [--grace N]
/zj-results <session>
/zj-stop <session>
/zj-help
```

Or call the tool `zellij_orchestrate` directly.

## Completion semantics

Treat a subagent as complete only when both:

- worker status is `idle`
- `handoff.json` exists and includes `agent_end: true`

## Failure handling

On timeout:

1. assign `_force_wrapup`
2. wait grace period
3. force-terminate target
