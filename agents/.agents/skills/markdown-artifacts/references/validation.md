# Mermaid Validation

## Command

```bash
/home/estifanos/.agents/skills/markdown-artifacts/scripts/validate-mermaid-md path/to/doc.md
```

Accepts:

- Markdown files containing fenced `mermaid` blocks
- `.mmd` Mermaid files
- multiple files in one invocation

The script extracts each diagram, writes temporary `.mmd` files, and runs Mermaid CLI:

```bash
npx -y @mermaid-js/mermaid-cli -i input.mmd -o output.svg
```

A non-zero render exit fails validation.

## Why render instead of regex linting

Mermaid syntax errors are renderer-specific. A regex checker catches only fence extraction mistakes; `mmdc` exercises the actual parser and browser rendering path.

## Recommended repo integration

For a repo with Markdown docs:

```bash
/home/estifanos/.agents/skills/markdown-artifacts/scripts/validate-mermaid-md docs/**/*.md README.md
```

For CI, pin Mermaid CLI in `devDependencies` and call local `mmdc` through `npx --no-install` if reproducibility matters.

## Puppeteer/Linux notes

`@mermaid-js/mermaid-cli` uses Puppeteer. On locked-down Linux or containers, Chromium sandboxing may fail. Prefer fixing the environment, but for local-only validation you can pass a Puppeteer config file through the script:

```bash
validate-mermaid-md --puppeteer-config puppeteer-config.json doc.md
```

Example `puppeteer-config.json`:

```json
{
  "args": ["--no-sandbox", "--disable-setuid-sandbox"]
}
```

Do not make `--no-sandbox` the default in shared CI unless the runner isolation is understood.

## Failure handling

When validation fails:

1. Read the reported file and diagram number.
2. Fix Mermaid syntax, not the script.
3. Re-run validation on the same file.
4. If the diagram is too complex to repair quickly, split it into smaller diagrams.

## Common failures

| Failure | Fix |
| --- | --- |
| List syntax in node text, e.g. `[1. Item]` | Use `[① Item]`, `[(1) Item]`, or remove the space: `[1.Item]` |
| Subgraph name with spaces | Use `subgraph id[Readable Name]` |
| Edge references display label | Reference node/subgraph ID, not display text |
| Unescaped quotes/parentheses | Quote labels or simplify text |
| Too many crossings | Split diagram or change `LR`/`TD` direction |
| Deprecated `%%{init}%%` | Use frontmatter `config:` |
