---
name: ddgr-search
description: Web search using the ddgr CLI tool (DuckDuckGo from terminal). Use this skill whenever a coding agent needs to search the web for documentation, error messages, library APIs, package info, changelogs, or any online resource. Triggers on phrases like "search the web", "look up", "find docs for", "google this", "check if X exists", "what's the latest version of", or whenever current information is needed. Always prefer this over guessing at URLs or relying on stale training data.
---

# ddgr Web Search Skill

Use `ddgr` to search DuckDuckGo from the terminal. It's fast, no API key needed, and returns clean results.

## Installation

```bash
# Check if installed
which ddgr || pip install ddgr --break-system-packages
# Or: sudo apt install ddgr / brew install ddgr
```

## Core Usage

```bash
# Basic search — returns top results with title, URL, snippet
ddgr --json "your query here"

# Limit results (default is 10, use 3-5 for most tasks)
ddgr --json --num 5 "query"

# Search a specific site
ddgr --json "site:docs.python.org pathlib"

# Safe output (no color, no pager — always use in scripts)
ddgr --json --noua "query"
```

## Recommended Pattern for Agents

```bash
# Always use --json for structured output, pipe to jq for parsing
ddgr --json --num 5 "query" | jq '.[] | {title, url, abstract}'

# Get just URLs
ddgr --json --num 5 "query" | jq -r '.[].url'

# Then fetch the most relevant URL
curl -s "https://example.com/docs" | cat
# or use: lynx --dump "URL" for readable text
```

## Tips

- **Queries**: Be specific. `"python requests library post json example"` beats `"python http"`.
- **Version lookups**: `"numpy latest version site:pypi.org"` or `"numpy changelog site:github.com"`
- **Error messages**: Wrap in quotes: `ddgr --json '"ModuleNotFoundError: No module named X"'`
- **Docs**: `"site:docs.X.com topic"` often gives cleaner results than open search.
- **Combine with curl/wget**: ddgr finds the URL, then fetch the page for full content.

## Output Structure (JSON)

```json
[
  {
    "title": "Page title",
    "url": "https://...",
    "abstract": "Short snippet from the page"
  }
]
```

## Quick Reference

| Goal           | Command                                                   |
| -------------- | --------------------------------------------------------- |
| General search | `ddgr --json --num 5 "query"`                             |
| Specific site  | `ddgr --json "site:github.com repo-name"`                 |
| PyPI package   | `ddgr --json "site:pypi.org package-name"`                |
| Error lookup   | `ddgr --json '"exact error message"'`                     |
| Latest release | `ddgr --json "package-name release notes changelog 2024"` |
