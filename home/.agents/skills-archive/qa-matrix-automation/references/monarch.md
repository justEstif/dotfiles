# Monarch evaluation checks

Monarch is Red Ventures' personalization/decisioning tool (Cohesion team). It picks which Experience/Variant a page slot serves — A/B tests, JO experiments, audience segmentation, champion serving. Response time is ~60ms (up to 90-200ms with integrations); the docs frame it as a real network request, not injected JS.

**Spectrum-specific flow (per "ADR: Spectrum Monarch"):** `Monarch decision → Cohesion component map → feature-owned slot → feature adapter + resolver → closed feature model → UI`. Each feature (e.g. `src/features/hero/`) owns a `monarch-adapter.ts` (accepts only supported Monarch values) and a `resolve-hero.ts` (maps Monarch's choice to an allowed local presentation, or falls back to a complete local default if Monarch is unavailable/invalid). `src/app/_monarch-components.ts` maps Monarch component IDs (e.g. `Hero | Base | Editable`) to lazy-loaded feature entry points.

## Is it visible in the Network tab?

Yes, generally — Monarch is a real HTTP request/response. But **this codebase's ADR doesn't state whether Spectrum's call is client-side (visible in browser Network tab) or server-side (SSR/API route, invisible to the browser)** — confirm this in code (search for the Monarch client call site) before assuming Network tab inspection works. If it's server-side, you're back to checking the `monarchEvaluated` analytics beacon in the HAR instead (see below) — same capture you're already doing for eventing checks.

**NEVER assume Monarch verification = "look for a network call" without confirming call site.** **Instead:** grep the repo for the Monarch client invocation (adapter/resolver layer) to determine client vs. server evaluation before writing the check. **Why:** getting this wrong means either scripting an assertion against a response that never reaches the browser, or missing a real client-side call by only checking the analytics beacon.

## Response shape

The evaluation response/event centers on a `rules` array, each with a `returnable` object:

- `returnable.returnableId` / `returnableName` — chosen return value or Experience name
- `returnable.experience.experienceId` / `experienceName` / `experienceNumber`
- `returnable.experience.slots[]` → `slotId`, `slotName`, `returnableId`, `returnableName`
- `returnable.connection` → `connectionName`/`Id`/`Type` (preamp/wordpress/custom), `contentType`
- `decisionCorrelationId`, `experiment.experimentId`/`experimentName`, `experiment.optionSetId`/`optionSetName`

"Default Internet Hero Experience" (the sheet's example expected value) appears as `returnable.experience.experienceName` (or `returnableName`).

## Assertion for `eventing.monarchEvaluated`

```json
{"scenario": "eventing.monarchEvaluated", "assertion": "returnable.experience.experienceName equals the expected default experience for this audience/traffic-flow config"}
```

**NEVER trust the evaluation response alone as proof the right experience rendered.** **Instead:** cross-check the rendered UI (via `agent-browser snapshot`/screenshot) against the `experienceName` the evaluation returned. **Why:** the ADR notes Monarch failures fall back silently to local defaults — a broken evaluation can still produce a plausible-looking page, so response-only verification can mask a real defect.

## Authoring vs. delivery (don't conflate)

Configuring the traffic flow (`/admin/v1/sources/{sourceId}/traffic-flow/draft`, `defaultSelectable: {type:'experience', experienceId:'...'}`) is authoring, done through Monarch Admin — that's a separate concern from this skill's QA scope. Delivery verification (does the configured experience actually reach the page) is what this skill checks. Don't use the admin API as a substitute for observing actual delivery.

## Known gaps

No dedicated Monarch QA runbook exists in Confluence/Jira as of 2026-08-24 — this reference is built from the architecture ADR and event-schema docs, not an official test checklist. Treat the assertion above as a starting point to validate against actual staging traffic, not a confirmed spec.
