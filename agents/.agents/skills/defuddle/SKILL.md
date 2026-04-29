---
name: defuddle
description: Extract clean markdown content from web pages using Defuddle CLI, removing clutter and navigation to save tokens. Use instead of WebFetch when the user provides a URL to read or analyze, for online documentation, articles, blog posts, or any standard web page. Do NOT use for URLs ending in .md — those are already markdown, use WebFetch directly.
---

# Defuddle

Use Defuddle CLI to extract clean readable content from web pages. Prefer over WebFetch for standard web pages — it removes navigation, ads, and clutter, reducing token usage.

If not installed: `npm install -g defuddle`

## Usage

Always use `-m` for markdown output:

```bash
defuddle parse <url> -m
```

Save to file:

```bash
defuddle parse <url> -m -o content.md
```

Extract specific metadata:

```bash
defuddle parse <url> -p title
defuddle parse <url> -p description
defuddle parse <url> -p domain
```

## NEVER

- **NEVER** fetch a URL ending in `.md` — those are already markdown. Use WebFetch directly instead. **Why:** defuddle strips HTML structure that doesn't exist in raw markdown. **Instead:** use `curl -sL <url>` or WebFetch.
- **NEVER** use defuddle for API endpoints or raw files (JSON, CSV, XML). **Why:** defuddle expects HTML pages with article content — it will produce garbage for non-HTML. **Instead:** use `curl` or WebFetch for raw content.

| Flag        | Format                           |
| ----------- | -------------------------------- |
| `-m`        | Markdown (default choice)        |
| `--json`    | JSON with both HTML and markdown |
| (none)      | HTML                             |
| `-p <name>` | Specific metadata property       |
