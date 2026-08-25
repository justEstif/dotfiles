---
name: agent-browser
description: Browser automation on this machine — replaces the removed chrome-devtools MCP server. Use for any web page inspection, scraping, form filling, screenshots, JS console evaluation, or browser testing with the agent-browser CLI.
---

# agent-browser

Fast browser automation CLI (Chrome via CDP, no Playwright). `AGENT_BROWSER_EXECUTABLE_PATH` is platform-managed by the user's mise config: Google Chrome on macOS and Brave on Omarchy/Linux. Use that environment variable as-is; only discover another installed Chromium browser if the configured executable is unavailable. For eventing or tracking QA, record the exact browser because privacy protections can change observed traffic.

The chrome-devtools MCP server was deliberately removed from pi mcp.json — do not re-add it; use agent-browser instead.

## Start here

This file is a discovery stub. Before running any `agent-browser` command, load the actual workflow content from the CLI (always version-matched):

```bash
agent-browser skills get core             # workflows, common patterns, troubleshooting
agent-browser skills get core --full      # + full command reference and templates
agent-browser skills list                 # specialized skills (electron, slack, ...)
```

## Pitfalls

- Use a named session (`export AGENT_BROWSER_SESSION=...`) — the default session is shared.
- Refs (`@eN`) go stale after any page change; re-snapshot before the next interaction.
- To automate the user's running Brave: fully kill it and relaunch with `--remote-debugging-port=9222`.
