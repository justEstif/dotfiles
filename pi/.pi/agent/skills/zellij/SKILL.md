---
name: zellij
description: Orchestrate Zellij terminal multiplexer (v0.44.0+) by managing panes, reading outputs, and running background tasks via the native CLI.
version: 1.0.0
tags: [terminal, multiplexer, cli, orchestration, zellij]
---

# Zellij Orchestration Skill

> **⚠️ VERSION REQUIREMENT:** This skill heavily relies on the expanded CLI Automation features (like `list-panes`, `dump-screen --pane-id`, and `send-keys`) introduced in **Zellij v0.44.0**. It will not work correctly on earlier versions.

## Description

Use this skill when the user asks you to interact with Zellij, manage terminal panes, run background tasks, or read output from other terminal windows. This skill leverages the native Zellij CLI (v0.44.0+) to act as an agentic orchestration layer.

## Triggers

"use zellij", "open a new pane", "run this in the background", "what is the error in the other pane", "check the server logs", "split the terminal", "send keystrokes to pane"

## Core CLI Workflows (v0.44.0+)

As an AI agent, you should use the `bash` tool to execute these Zellij CLI commands to orchestrate the user's workspace.

### 1. Discovering Workspace State

To understand what panes are currently open and get their IDs:

```bash
zellij action list-panes --json
```

_Note: Look for the `pane_id` in the JSON output to target specific panes in subsequent commands._

### 2. Reading Pane Output (The "Eyes" of the Agent)

If you need to read the output of a dev server, test runner, or any other pane, dump its screen to a temporary file and read it:

```bash
# Dump the full scrollback of a specific pane (requires pane-id from list-panes)
zellij action dump-screen --pane-id <ID> --full --path /tmp/zellij_dump.txt
cat /tmp/zellij_dump.txt
```

### 3. Running Background / Parallel Tasks

When you need to run a long task (like `npm install`, compiling, or a test suite) without blocking your own execution context, spawn it in a floating pane:

```bash
# Returns the new pane_id instantly
zellij run --floating --name "Agent Task" -- npm run test
```

### 4. Blocking on External Execution

If you _must_ wait for an external pane to finish before continuing your work:

```bash
zellij run --floating --blocking --name "Wait Task" -- ./build.sh
```

### 5. Interacting with Interactive Prompts (REPLs, TUIs)

If a pane is stuck on a prompt or running an interactive tool, you can send keystrokes to it:

```bash
zellij action send-keys --pane-id <ID> "y" "Enter"
zellij action send-keys --pane-id <ID> "Ctrl c"
```

### 6. Managing Layout

```bash
# Open a new split pane in the current tab
zellij action new-pane
# Move focus to a specific pane to bring it to the user's attention
zellij action focus-pane --pane-id <ID>
```

## Agent Guidelines

1. **Never guess Pane IDs.** Always run `zellij action list-panes --json` first to get the correct `pane_id` before trying to read from or send keys to a pane.
2. **Use Floating Panes for Agent Tasks.** When spawning utility commands (`npm install`, linters, etc.), prefer `--floating` so you don't mess up the user's tiled layout.
3. **Clean Up.** If you open a floating pane specifically to run a temporary task or read output, you **must close the pane** when you are finished by using `zellij action close-pane --pane-id <ID>`. Do not leave leftover background panes cluttering the workspace unless the user explicitly asks for a long-running service (like a dev server) to remain open.
