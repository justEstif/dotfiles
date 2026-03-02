---
name: zellij-cli
description: Use this skill whenever a coding agent (like pi/Claude) needs to offload commands to background panes, spawn sub-agents in observable sessions, run parallel tasks, or manage terminal multiplexing via Zellij. Triggers include - "run this in the background", "spawn a sub-agent", "run in zellij", "offload this command", "open a new pane", "run in parallel", "keep this running while I work", or any scenario where isolating a long-running process or creating an observable sub-agent session would be beneficial. Use this even when zellij isn't explicitly mentioned — if the task benefits from parallelism, background execution, or agent observability, this skill applies.
---

# Zellij CLI Skill

Zellij is a terminal multiplexer (like tmux) that lets you manage multiple panes/tabs in one terminal session. As a coding agent, you can use it to offload commands, spawn observable sub-agents, and run parallel workloads — all controllable via CLI.

## Core Mental Model

```
Session (named, persistent)
└── Tab (named, groupable)
    ├── Pane (can run a command, shell, or agent)
    ├── Pane (floating, embedded, or tiled)
    └── Pane ...
```

- **Sessions** persist even when you disconnect
- **Panes** can run any command including another agent instance
- Everything is scriptable from within a running session

---

## Quick Reference: Most Useful Agent Actions

### Spawn a sub-agent or long-running command in a new pane

```bash
# New floating pane running a command (closes when done)
zellij action new-pane --floating --close-on-exit --name "build" -- npm run build

# New tiled pane (splits screen)
zellij action new-pane --direction down --name "tests" -- pytest

# New tab with a command
zellij action new-tab --name "sub-agent"
# Then write a command to the focused pane:
zellij action write-chars "claude --some-flags\n"
```

### Spawn yourself (Claude/pi) as a sub-agent in an observable pane

```bash
# Spawn a sub-agent in a named floating pane for full observability
zellij action new-pane --floating --name "sub-agent: task-name" -- claude -p "your task prompt here"

# Or in a tab for more space
zellij action new-tab --name "sub-agent"
zellij action write-chars "claude -p 'do X, Y, Z'\n"
```

### Send input to a pane

```bash
# Write text/commands to the focused pane
zellij action write-chars "ls -la\n"

# Write raw bytes (e.g., Ctrl+C = 3, Enter = 13)
zellij action write 3        # Ctrl+C (interrupt)
zellij action write 13       # Enter
```

### Observe / read output

```bash
# Dump the scrollback of the focused pane to a file, then read it
zellij action dump-screen /tmp/pane-output.txt
cat /tmp/pane-output.txt

# Open scrollback in your editor
zellij action edit-scrollback
```

### Navigate between panes

```bash
zellij action focus-next-pane
zellij action focus-previous-pane
zellij action move-focus right   # right|left|up|down
zellij action go-to-tab-name "sub-agent"
zellij action go-to-tab 1        # by index
```

### Manage sessions (target a specific session)

```bash
# Run action in a different session
zellij --session my-session action new-pane -- some-command

# List tabs
zellij action query-tab-names

# List connected clients and their pane IDs
zellij action list-clients
```

---

## Common Agent Patterns

### Pattern 1: Fire-and-forget background task

```bash
zellij action new-pane \
  --floating \
  --close-on-exit \
  --name "background: npm build" \
  -- npm run build
```

### Pattern 2: Long-running watcher you can check on

```bash
zellij action new-pane \
  --direction down \
  --name "log-watcher" \
  -- tail -f /tmp/app.log
```

### Pattern 3: Spawn a sub-agent with full observability

```bash
# The human (or parent agent) can watch this pane in real time
zellij action new-pane \
  --floating \
  --name "sub-agent: refactor auth" \
  -- claude -p "Refactor the auth module in /src/auth to use JWT. Output changes to stdout."
```

### Pattern 4: Dump and read sub-agent output

```bash
# Focus the sub-agent pane first, then dump its output
zellij action go-to-tab-name "sub-agent: refactor auth"
zellij action dump-screen /tmp/agent-output.txt
cat /tmp/agent-output.txt
```

### Pattern 5: Parallel workloads

```bash
# Spawn multiple tasks simultaneously
zellij action new-pane --name "task-1" --close-on-exit -- ./scripts/run_tests.sh
zellij action new-pane --name "task-2" --close-on-exit -- ./scripts/lint.sh
zellij action new-pane --name "task-3" --close-on-exit -- ./scripts/typecheck.sh
```

### Pattern 6: Start a named session for a project

```bash
# Start or attach to a session
zellij attach my-project 2>/dev/null || zellij --session my-project
```

---

## Key Flags for `new-pane`

| Flag                    | Purpose                             |
| ----------------------- | ----------------------------------- |
| `-f, --floating`        | Opens as floating overlay           |
| `-n, --name <name>`     | Names the pane (shows in frame)     |
| `-c, --close-on-exit`   | Closes pane when command finishes   |
| `-d, --direction <dir>` | `right`, `down` — where to split    |
| `--cwd <path>`          | Set working directory for the pane  |
| `-s, --start-suspended` | Start paused, run on first keypress |
| `-- <command>`          | Command to run (after double-dash)  |

---

## Environment Variables

Inside any zellij pane, these env vars are available:

- `$ZELLIJ` — set to `0` when inside a session (use to detect if inside zellij)
- `$ZELLIJ_PANE_ID` — current pane's ID (e.g., `terminal_3`)
- `$ZELLIJ_SESSION_NAME` — name of current session

**Detect if inside zellij:**

```bash
if [ -n "$ZELLIJ" ]; then
  echo "inside zellij"
fi
```

---

## Tips for Coding Agents

1. **Name everything** — use `--name` for panes and tabs so you can navigate back with `go-to-tab-name`
2. **Use `dump-screen` to read output** — write results to `/tmp/` and read them back
3. **`write-chars` with `\n`** — always append `\n` to simulate pressing Enter
4. **Check `$ZELLIJ`** before spawning — avoid nested sessions if already inside one
5. **Use `--close-on-exit`** for ephemeral tasks; omit it for tasks you want to observe after completion
6. **Target other sessions** with `zellij --session <name> action ...` for cross-session control
