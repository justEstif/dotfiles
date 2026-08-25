---
name: qa-matrix-automation
description: "Automates landing-page QA matrices (eventing, address/serviceability paths, URL param persistence) against staging/prod with agent-browser, writing results as append-only JSONL queryable in DuckDB instead of hand-filled Google Sheet cells. Use when: a CE/QA sheet asks for SessionID-per-cell sign-off across browser/device combos, eventing checks are marked N/A for lack of tooling, or someone wants to replace manual QA matrix busywork with scripted runs. Triggers: QA sheet, eventing QA, Cohesion/Tagular event checks, Monarch evaluation testing, address category testing, serviceability redirect testing, session ID sign-off, browser/device matrix, DuckDB QA results."
compatibility: Works in Claude Cowork with code execution and network access. Requires agent-browser, Chromium, and DuckDB; install them on first use if absent. dev3000 is optional and local-target only.
---

# QA Matrix Automation

Replaces the "paste a SessionID in every cell" QA sheet pattern with scripted `agent-browser` runs against staging/prod and structured result rows a human (or duckdb) can query instead of scrolling a spreadsheet.

## Claude Cowork bootstrap

Before the first run, check whether `agent-browser`, Chromium, and DuckDB are available. In a Cowork code-execution sandbox, install missing dependencies with:

```bash
npm install -g agent-browser
npx playwright install chromium
pip3 install duckdb --break-system-packages
```

Ask before installing packages when the environment requires approval. If organization policy blocks package installation, network access, or access to the target site, emit `status: "BLOCKED"` with the missing capability in `notes`; do not substitute an unverified manual PASS.

## Scope split — know what this skill covers

QA sheets like this bundle four categories that have wildly different automatability. Don't blur them:

| Category                                                                       | Automatable here?   | Why                                                                                            |
| ------------------------------------------------------------------------------ | ------------------- | ---------------------------------------------------------------------------------------------- |
| Eventing checks (sessionStarted, pageViewed, elementClicked, etc.)             | Yes                 | Deterministic request-body assertions from a HAR                                               |
| Address/path checks (BAU serviceable, no-apartment, Cox/Xfinity unserviceable) | Yes                 | Fixed input set, deterministic branch outcome                                                  |
| URL param persistence (pre/post-loc)                                           | Yes                 | Deterministic string presence in URL across navigations                                        |
| Visual checks vs. Figma                                                        | Assisted, not automatable | Figma MCP can pull the design side and diff it against a staging screenshot, narrowing what a human checks — but "matches Figma 1:1" is still a subjective judgment; don't fabricate a PASS/FAIL |

**NEVER report a visual-check row as PASS/FAIL from this skill.** **Instead:** emit `status: "NEEDS_HUMAN"` for visual rows, optionally with a Figma-vs-staging diff in `notes` (see `references/visual-figma.md`), and leave the actual sign-off to Creative/CE. **Why:** a scripted screenshot diff without a human eye produces false confidence on pixel-perfect claims that matter for sign-off.

## Target selection: agent-browser vs. dev3000

**NEVER reach for dev3000 when the target is staging/prod.** **Instead:** use plain `agent-browser` pointed at the staging URL. **Why:** dev3000's core value (server logs correlated with browser events) requires it to own the dev-server process; it can only do that for a locally-running server, not `https://staging.spectrum.rvcore.app/`. Against staging, dev3000 buys you nothing over agent-browser except a persistent Chrome profile.

Use dev3000 instead when the actual target is local dev (`localhost`) and you want server + browser evidence unified — not for staging/prod QA sheets.

## Result format: append-only JSONL, not a spreadsheet

One line per (scenario × address_category × viewport × browser) check, appended as it runs — never rewritten in place (avoids read-modify-write races across parallel agent-browser sessions):

```json
{
  "run_id": "...",
  "scenario": "eventing.pageScrolled",
  "address_category": "BAU Serviceable",
  "viewport": "mobile",
  "browser": "chrome",
  "page": "/order",
  "status": "PASS|FAIL|OPEN|BLOCKED|NEEDS_HUMAN",
  "har_path": "hars/...",
  "notes": null,
  "checked_at": "..."
}
```

Query with DuckDB instead of building a report generator:

```sql
CREATE VIEW qa AS SELECT * FROM read_json_auto('results/*.jsonl');
SELECT scenario, viewport, browser FROM qa WHERE status = 'FAIL';
SELECT address_category, count(*) FILTER (status='FAIL') FROM qa GROUP BY 1;
```

**NEVER collapse the matrix into one boolean per component.** **Instead:** keep viewport/browser/address_category as separate columns even when results are identical across most of them. **Why:** the sheet's whole value is catching the one device/browser combo that diverges; flattening early hides exactly the bug this QA exists to find.

## Eventing assertions — reuse HAR-first discipline

**MANDATORY — READ `references/eventing.md`** before scripting any `eventing.*` scenario. It has the full capture/parsing discipline and per-event PASS conditions (sessionStarted, pageViewed, coreIdentify's double-fire, pageScrolled duplicate logic, elementViewed owner-identity grouping, GPC handling, and the non-Tagular `cohesion_init` DCR path).

## Monarch assertions

**MANDATORY — READ `references/monarch.md`** before scripting `eventing.monarchEvaluated` or any Monarch-experience check. Monarch is Red Ventures' decisioning/personalization tool — the reference covers the `returnable.experience.experienceName` response shape, why you must confirm client- vs. server-side evaluation before assuming the Network tab shows anything, and why the evaluation response alone doesn't prove the right experience rendered (silent fallback to local defaults on Monarch failure).

## Address/path category fixtures

Treat these as a fixed fixture set, not ad hoc addresses — reuse across scenarios and check they're still valid before a run (serviceability data can drift):

- BAU Serviceable (with apartment)
- BAU Serviceable, no apartment
- Unserviceable → Cox redirect
- Unserviceable → Xfinity redirect

**NEVER invent new test addresses per run.** **Instead:** pull from the fixed fixture list above (or the sheet's Address Categories block) so failures are reproducible against a known input. **Why:** serviceability APIs are stateful/geo-dependent; a random address makes a FAIL unreproducible.

## References

- `references/eventing.md` — Cohesion/Tagular HAR-first capture/parsing discipline and per-event PASS conditions.
- `references/monarch.md` — Monarch decisioning architecture, response shape, and delivery-verification caveats.
- `references/visual-figma.md` — how to use the Figma MCP (`get_screenshot`, `get_design_context`) plus an `agent-browser` screenshot to produce a human-reviewable diff for `visual.*` rows, and why the diff still can't resolve status itself.

## Assets

- `assets/qa-record.schema.json` — JSON Schema for one result row. Validate generated rows against this before appending, especially the `status` enum and the fixed `address_category` values.
- `assets/qa-template.jsonl` — starter file with one example row per status, showing the shape (including `null` handling for scenarios that don't vary by viewport/browser/address).
- `assets/viewer.template.html` — Alpine.js CRUD UI for a `.jsonl` results file. Unlike the other assets, copy this one into the project too (e.g. `qa/viewer.html`, next to `qa/results.jsonl`) — on load it auto-fetches a sibling `results.jsonl` (or `?file=name.jsonl`) so opening the page shows data immediately, no manual "Open" click. Auto-fetch only works served over HTTP (`bunx serve .` from the directory containing both the viewer and JSONL — this repo already uses bun, so prefer it over `npx`/`python3 -m http.server`) — plain `file://` double-click can't `fetch()` a local sibling file; the page detects this and shows the serve command inline instead of failing silently. When overriding the filename, open the clean URL directly (for example, `http://127.0.0.1:3000/viewer?file=staging.jsonl`), not `viewer.html?file=staging.jsonl`: `serve` redirects `.html` to `/viewer` and drops the query string, causing the viewer to fall back to `results.jsonl`. The manual "Open .jsonl" button (File System Access API in Chrome/Edge, import+download fallback elsewhere) still works over `file://` and enables in-place Save. Point people at this instead of having them hand-edit JSON lines — it's the sheet replacement's actual UI.
- `assets/scenarios.template.json` — starter scenario catalog: address fixtures + one entry per check (`id`, `category`, `automatable`, `assertion`). This is what a Google Sheet QA matrix gets translated into on first setup for a project. Copy it into the target project (e.g. `qa/scenarios.json`), then edit the entries to match that project's actual sheet — don't run agent-browser checks against the template's Spectrum-specific ids for an unrelated project.

### First-time setup for a new project

When a user hands you a QA sheet (pasted, exported CSV, or Sheets link) and wants this automated:

1. Copy `assets/scenarios.template.json` into the target project (e.g. `qa/scenarios.json`) — this file is project state, not skill state, so it does not live in the skill's own `assets/`.
2. Map each sheet row to a `scenario` entry: eventing/address/URL-param rows get `automatable: true` and an `assertion` describing the pass condition; visual-vs-Figma rows get `automatable: false` and will always emit `NEEDS_HUMAN`.
3. Copy `assets/qa-template.jsonl`'s shape into `qa/results.jsonl` as the append target for future runs — don't reuse the template file itself as a live results file.
4. Copy `assets/viewer.template.html` into `qa/viewer.html` (same directory as `qa/results.jsonl`, since it auto-fetches a sibling file by default) — unlike the other assets, this one is meant to live in the project, not be opened from the skill's own folder.

**NEVER edit `assets/scenarios.template.json` in place to fit one project's sheet.** **Instead:** copy it out first. **Why:** the template is the reusable starting point for the *next* project's sheet; overwriting it with one project's specifics breaks that reuse.

**NEVER ask a non-engineer to hand-edit the JSONL file directly.** **Instead:** hand them the served `qa/viewer.html` URL. **Why:** the whole point of moving off Google Sheets was structured, agent-friendly data — a stray trailing comma or malformed line from manual editing breaks `read_json_auto` for everyone downstream.
