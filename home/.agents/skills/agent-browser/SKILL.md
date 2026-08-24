---
name: agent-browser
description: Browser automation on this machine — replaces the removed chrome-devtools MCP server. Use for any web page inspection, scraping, form filling, screenshots, JS console evaluation, or browser testing with the agent-browser CLI.
---

# agent-browser

Fast browser automation CLI (Chrome via CDP, no Playwright). On this machine there is no Chrome — set `AGENT_BROWSER_EXECUTABLE_PATH=/usr/bin/brave`.

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
