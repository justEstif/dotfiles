## Markdown output rules
- Never wrap markdown tables in code fences. Emit tables as real markdown:
  blank line before the table, a header row, a `| --- |` separator row with
  the same column count, then data rows.
