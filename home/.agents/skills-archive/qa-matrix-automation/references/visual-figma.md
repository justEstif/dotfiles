# Visual checks — Figma-assisted, human-confirmed

Visual-vs-Figma rows (`visual.*`) can't be scripted to a boolean the way eventing/path checks can — "matches Figma 1:1" is a subjective render judgment. This skill still routes those to `status: "NEEDS_HUMAN"` (see `SKILL.md` scope table) and does not fabricate PASS/FAIL. What changes with the Figma MCP available is the *evidence a human reviews*, not who signs off.

## What to do when a row has a `figma_url`

1. Pull the design side: `get_screenshot` (and `get_design_context` for text/spacing/variable values) on the `figma_url` node — this is the source of truth per the sheet's own instructions ("use Figma as the source of truth").
2. Pull the implementation side: `agent-browser screenshot` (or `snapshot` for a11y-tree/text comparison) of the corresponding staging page/component at the matching viewport.
3. Diff the two — call out concrete deltas (copy text mismatch, spacing, missing element, wrong asset) rather than a vague "looks close." A screenshot diff tool is optional; a side-by-side description of specific discrepancies is the minimum bar.
4. Write the row with `status: "NEEDS_HUMAN"` regardless of what the diff found, plus `notes` listing the specific discrepancies (or "no discrepancies found in automated pass" if clean). Never write `PASS`/`FAIL` for a `visual.*` scenario from this pass.

**NEVER let an agent's Figma-vs-staging diff resolve a `visual.*` row to PASS or FAIL.** **Instead:** the diff narrows what the human (Creative/CE) needs to look at — they still flip the final status. **Why:** pixel/text diffing catches gross mismatches but misses brand/quality judgment calls (does this *feel* right) that the sheet's sign-off process exists to catch; auto-resolving removes the actual QA step, not just the busywork around it.

## Getting the Figma link into the row

Add `figma_url` on the `visual.*` row when you script/generate it (see `assets/qa-record.schema.json`) — pull the link from the same Figma file the CE/Creative team is already using as source of truth for that release, at the frame/node level (not the whole file), so `get_screenshot`/`get_design_context` return the right scope instead of the entire page.

**NEVER default to comparing against the whole Figma file when only one component changed.** **Instead:** get the specific frame/node link for that component. **Why:** a whole-file screenshot forces a human to re-locate the relevant section anyway, defeating the point of narrowing the diff.

## Practical note on the Figma skills

When actually calling Figma MCP tools (`get_design_context`, `get_screenshot`, etc.) from an agent context, follow whatever Figma-specific skill guidance is already loaded for that call (e.g. a `figma-design-to-code`-style prerequisite skill) rather than calling the tools ad hoc — those skills cover auth, node-selection, and output-format pitfalls that are out of scope here.
