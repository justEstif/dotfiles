---
name: cohesion-har-qa
description: Tests browser analytics events for Cohesion/Tagular integrations using HAR-first capture, request-body parsing, and duplicate-call analysis. Use when validating sessionStarted, PageViewed, DomCompleted, PageEngaged, PageScrolled, Identify, ElementClicked, ElementViewed, addressCaptured, ConsentCaptured, cohesion_init, GPC consent behavior, or similar Beacon events; keywords include Cohesion, Tagular, Tealium, Beacon, /v2/t, HAR, event QA, duplicate events, and payload verification.
compatibility: Requires a controllable Chromium/Playwright browser or agent-browser with HAR support, jq, and access to the test surface.
---

# Cohesion HAR QA

Use this skill for browser analytics QA where Beacon timing can race navigation. The HAR is the source of truth for Tagular events; console logs and live Network-panel snapshots are diagnostic only.

## Event-specific evidence

- `SessionStarted`: one request on fresh boot; none on same-session reload.
- `PageViewed`: verify raw event name, `webContext.page.url`, and one request per intended load or virtual view.
- `DomCompleted`: one request per page load.
- `PageEngaged`: capture through dwell plus pagehide/visibility/navigation; verify it is not immediate.
- `PageScrolled`: record threshold sequence and count each `scrollDistance` per page view.
- `Identify`: compare `traits.id`, every `externalIds` entry, and message IDs before classifying a second event as duplicate.
- `ElementClicked`: compare physical click, target identity, tracking source, and approved action outcome; manual clicks must not also emit auto events.
- `ElementViewed`: group by owner (`htmlId`, element type, location, lifecycle/view correlation); multiple distinct owners are expected.
- `addressCaptured`: inspect the HAR across the handoff boundary and verify address, postal code, location, and address ID.
- `ConsentCaptured`: capture the full payload and active cookie grants.
- `cohesion_init`: capture `_satellite.track` payload separately; it is not a `/v2/t` event.
- GPC: record the real browser privacy signal, cookie grants, and continued Beacon flow.

**Status:** use `PASS` only when request body and fields match; `FAIL` for a captured contract violation; `OPEN` for incomplete evidence; `BLOCKED` for unavailable browser, partner, credential, or privacy prerequisites.

## Anti-patterns

## Anti-patterns

- **NEVER** parse HAR response bodies to decide whether an event fired. **Why:** Beacon responses are commonly empty or `Ping`, producing false negatives. **Instead:** parse `.request.postData.text` for `/v2/t` entries.
- **NEVER** start capture after opening the page. **Why:** boot events will be absent and the verdict will be invalid. **Instead:** start from `about:blank`, then navigate.
- **NEVER** call every repeated event a duplicate. **Why:** `ElementViewed` legitimately emits once per owner. **Instead:** compare the event’s identity fields and lifecycle key.
- **NEVER** mark an event absent while navigation or page exit is in flight. **Why:** Beacon delivery can overlap the transition. **Instead:** preserve navigation/exit in the HAR and stop capture afterward.
- **NEVER** treat an undefined `navigator.globalPrivacyControl` as GPC enabled. **Why:** a browser flag may not activate the privacy signal. **Instead:** use a verified Firefox/Brave configuration or Chrome extension and record the signal.
- **NEVER** claim a DCR passed because a Tagular beam exists. **Why:** `cohesion_init` is not a `/v2/t` event. **Instead:** capture `_satellite.track` directly and separately assert its absence from Tagular traffic.

**Why these rules are strict:** each failure mode has produced a misleading QA verdict in real Beacon-based tests.

## Core invariants

- Start capture **before navigation or reload**. Boot events otherwise disappear from the evidence.
- Parse `/v2/t` **request** bodies at `.log.entries[].request.postData.text`; responses are usually only `Ping` acknowledgements.
- Isolate one event scenario per HAR when timing or navigation matters.
- Preserve navigation through handoff before stopping capture; Beacon requests may be emitted immediately before or during navigation.
- Count events by parsed `event` name, then inspect event-specific identity fields before calling a count a duplicate.
- Record raw event names. Do not silently normalize `v2.PageViewed` or `v1alpha2.DomCompleted` to a display name.
- Keep `PASS`, `FAIL`, `OPEN`, and `BLOCKED` distinct. Missing evidence is not a pass or a failure.

## Capture and parse

With `agent-browser`:

```sh
agent-browser --session qa open about:blank
agent-browser --session qa network har start /tmp/cohesion-event.har
agent-browser --session qa open 'https://dev.example/?rvDebug=1'
# perform exactly one scenario
agent-browser --session qa network har stop /tmp/cohesion-event.har
```

Count parsed Tagular events:

```sh
jq -r '.log.entries[] | select(.request.url|contains("/v2/t")) | .request.postData.text? // empty' /tmp/cohesion-event.har \
  | jq -Rr 'try (fromjson | .event) catch empty' \
  | sort | uniq -c
```

Inspect selected fields:

```sh
jq -r '.log.entries[] | select(.request.url|contains("/v2/t")) | .request.postData.text? // empty' /tmp/cohesion-event.har \
  | jq -Rr 'try (fromjson | [.event, .properties.actionOutcome, .properties.scrollDistance, .properties.webElement.htmlId, .properties.webElement.elementType] | @tsv) catch empty'
```

If the HAR is empty or boot events are missing, discard that verdict and repeat with capture started from `about:blank` before opening the test URL.

## Duplicate analysis

Use event-specific identity, not raw counts alone:

- `SessionStarted`, `PageViewed`, `DomCompleted`, `ConsentCaptured`: normally one per isolated page load.
- `PageScrolled`: compare `scrollDistance` per page view; repeated 25/50/75/100 values are duplicates unless the page view was deliberately re-armed.
- `Identify`: compare `traits.id`, `externalIds`, and message IDs. Two events may be valid when an external ID changed.
- `ElementClicked`: compare physical interaction, tracking source, target identity, and action outcome. A manual click must not also produce an auto event for the same click.
- `ElementViewed`: group by owner identity (`htmlId`, element type, location, and lifecycle/view correlation). Multiple different elements are expected; same-owner repeats are the defect signal.
- `addressCaptured`: search the HAR across the handoff boundary; do not infer absence from a page that has already navigated.
- `pageEngaged`: keep capture active through the configured dwell and pagehide/visibility/navigation trigger.

## Non-Tagular paths

`cohesion_init` is an Adobe Direct Call Rule, not a `/v2/t` event. Stub `_satellite.track` **before navigation**, capture the callback payload, and separately inspect the HAR to confirm it is absent from Tagular traffic. Verify required IDs, phone rules, refire-on-change, and dedupe.

GPC is a browser privacy-state test, not an event. Use a real Firefox/Brave GPC configuration or verified Chrome extension. A launch flag that leaves `navigator.globalPrivacyControl` undefined is not a GPC test.

## Reporting

For each event record:

- status (`PASS`, `FAIL`, `OPEN`, or `BLOCKED`);
- HAR path and capture boundary;
- raw event name and count;
- relevant payload fields;
- duplicate assessment and identity key;
- exact next action if unresolved.

Never mark a full checklist complete while any required event is `OPEN`, `FAIL`, or `BLOCKED`.
