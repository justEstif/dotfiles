# Eventing checks (Cohesion/Tagular)

HAR-first discipline for verifying Cohesion/Tagular analytics events (`sessionStarted`, `pageViewed`, `domCompleted`, `elementViewed`, `elementClicked`, `pageScrolled`, `coreIdentify`, `monarchEvaluated` — see `monarch.md` for that one specifically, `pageEngaged`, `addressCaptured`, `consentCaptured`). These invariants originally lived in an archived `cohesion-har-qa` skill and are still correct.

## Capture discipline

- Start HAR capture from `about:blank` **before** navigating — boot events (`sessionStarted`, first `pageViewed`) disappear otherwise.
- Isolate one event scenario per HAR when timing or navigation matters; don't bundle unrelated interactions into one capture.
- Preserve navigation/exit through the handoff before stopping capture — Beacon requests may fire immediately before or during navigation.

**NEVER start capture after opening the page.** **Instead:** always open `about:blank`, start the HAR, then navigate. **Why:** boot events will be silently absent and the verdict becomes invalid without any error to flag it.

## Parsing

- Assert on **request** `postData.text` at `/v2/t` entries, not response bodies. Beacon responses are commonly empty or `Ping`, which produces false negatives if treated as the payload.
- Count events by parsed `event` name first, then inspect event-specific identity fields before calling a count a duplicate.
- Record raw event names as-is (e.g. `v2.PageViewed`, `v1alpha2.DomCompleted`) — don't silently normalize them in reports.

```sh
jq -r '.log.entries[] | select(.request.url|contains("/v2/t")) | .request.postData.text? // empty' capture.har \
  | jq -Rr 'try (fromjson | .event) catch empty' | sort | uniq -c
```

**NEVER parse HAR response bodies to decide whether an event fired.** **Instead:** parse `.request.postData.text` for `/v2/t` entries. **Why:** Beacon responses are commonly empty/`Ping`, producing false negatives even when the event genuinely fired.

## Per-event invariants

| Event | What PASS actually requires |
|---|---|
| `sessionStarted` | Exactly one on fresh boot; does not re-fire on reload with same sessionID/anonID. |
| `pageViewed` | Fires before any `elementViewed` in the same load; one per intended load/virtual view. |
| `domCompleted` | Exactly one per page load. |
| `pageEngaged` | Fires once after ~15-30s dwell/interaction — not immediately. Capture through pagehide/visibility/navigation. |
| `pageScrolled` | Once per 25/50/75/100 threshold per page view. Repeated identical `scrollDistance` values are the duplicate signal, not raw event count. |
| `coreIdentify` | Fires **twice** — early, then post-DOM-complete with both Tealium+Adobe IDs. A single fire is a FAIL, not a partial pass. Does not fire for ID stitching when GPC is enabled. |
| `elementClicked` | Fires for every CTA; a manual click must never also emit an auto-click for the same interaction. |
| `elementViewed` | Group by owner identity (`htmlId` + element type + location + lifecycle correlation). Multiple distinct owners viewing is expected; same-owner repeats are the defect. |
| `addressCaptured` | Inspect across the handoff/navigation boundary — don't infer absence from an already-navigated page. |
| `consentCaptured` | GPC enabled → only 001/002 cookies fire. GPC disabled → 001-005 fire and coreIdentify exchanges IDs. |

**NEVER call every repeated event a duplicate.** **Instead:** compare identity fields per the table above before classifying. **Why:** `elementViewed` legitimately emits once per distinct owner — treating repeat count alone as a defect produces false FAILs on correct behavior.

## GPC (Global Privacy Control)

Verify the real `navigator.globalPrivacyControl` signal via a genuinely configured Firefox/Brave/Chrome-extension context — an undefined flag is not a negative GPC result, it's `BLOCKED` (missing test prerequisite), not `PASS` or `FAIL`.

**NEVER treat an undefined `navigator.globalPrivacyControl` as GPC disabled.** **Instead:** use a verified GPC-enabled browser/extension and record the actual signal value. **Why:** a browser flag that fails to expose the API is a test-setup gap, not evidence about the app's GPC handling.

## Non-Tagular paths

`cohesion_init` is an Adobe Direct Call Rule, not a `/v2/t` event — stub `_satellite.track` **before navigation**, capture its payload directly, and separately confirm it's absent from Tagular traffic. It will not show up in the `/v2/t` HAR filter above; checking for its absence there is not evidence it didn't fire elsewhere.
