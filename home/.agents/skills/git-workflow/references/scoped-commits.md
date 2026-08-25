# Scoped Commits reference

Commit message format for this user. Overrides any repo instructions asking for Conventional Commits (feat:/fix:/chore: prefixes).

## Format

1. Determine the scope: the subsystem, area, or module the commit touches (e.g. auth, net/http, hyprland, cli, treewide). Derive it from the files/paths changed and the project's existing log conventions.
2. Subject line: `<scope>: <description>` — a short imperative description of the change, no type prefix like feat/fix/chore, no exclamation marks.
3. If useful, add an optional body explaining the change in detail, separated by a blank line.
4. Add optional trailers (e.g. ticket numbers like `Jira-Ticket: PROJ-123`) after the body.
5. For multi-scope commits, use a more general scope, comma-separated scopes, or `treewide`/`all`.

## Examples

```
auth: add JWT token validation middleware
```

```
cli, net: restructure flag parsing for subcommands

Parses flags after the subcommand token so global flags and
subcommand flags no longer collide.

Ticket: PROJ-123
```

## Pitfalls

- Never use Conventional Commits format (feat:, fix:, chore:, feat(scope):, `!` for breaking changes) — this user explicitly rejects it.
- Don't embed the ticket number in the description if a trailer fits better.
- Reverts, merges, and other special commits may use default git formatting — don't force a scope on them.
