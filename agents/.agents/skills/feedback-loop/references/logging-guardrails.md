# Logging Guardrails

Source philosophy: [loggingsucks.com](https://loggingsucks.com/) — logs optimized for writing are useless for querying. The fix: wide events.

## The Mental Model Shift

> Instead of logging *what your code is doing*, log *what happened to this request*.

**Scattered logs** (broken):
```
INFO: Processing payment
INFO: Cart loaded, 3 items
ERROR: Payment failed
```

**Wide event** (correct): one JSON object emitted once per request per service, built up throughout the lifecycle, containing all fields you might need to debug.

## Required Fields by Layer

Every wide event should include fields from these layers. Omit layers that don't apply.

| Layer | Required fields |
|-------|----------------|
| **Request** | `request_id`, `trace_id`, `timestamp`, `method`, `path`, `status_code`, `duration_ms`, `service`, `version` |
| **User/Session** | `user.id`, `user.subscription`, `session_id`, `feature_flags` |
| **Business** | Domain-specific: `cart.id`, `order.id`, `payment.provider`, `payment.attempt` — whatever makes this request meaningful |
| **Error** | `error.type`, `error.code`, `error.message`, `error.retriable` — always on failures, never silently swallowed |

High-cardinality fields (`user_id`, `order_id`, `trace_id`) are what make logs debuggable. Low-cardinality fields alone (`method`, `status_code`) only support dashboards.

## Implementation Pattern

Build the event in middleware; enrich in handlers; emit once at the end.

```typescript
// middleware: initialize
const event = { request_id, timestamp, method, path, service, version };
ctx.set('wideEvent', event);

// handler: enrich as you go
event.user = { id: user.id, subscription: user.subscription };
event.cart = { id: cart.id, item_count: cart.items.length, total_cents: cart.total };

// middleware: emit on completion
event.status_code = ctx.res.status;
event.duration_ms = Date.now() - startTime;
logger.info(event); // ONE emit
```

Never emit partial events mid-request. The event is only useful when complete.

## Tail Sampling (cost control)

Always keep:
- All errors (`status_code >= 500`, any `error` field present)
- Slow requests (above p99 latency threshold)
- VIP / enterprise users
- Requests with active feature flags under rollout

Randomly sample the rest at 1–5%. Happy fast requests are statistically redundant.

```typescript
function shouldSample(event: WideEvent): boolean {
  if (event.status_code >= 500) return true;
  if (event.error) return true;
  if (event.duration_ms > P99_THRESHOLD_MS) return true;
  if (event.user?.subscription === 'enterprise') return true;
  if (event.feature_flags?.some_active_rollout) return true;
  return Math.random() < 0.05;
}
```

## What to Enforce as Checks

These are the guardrails to encode — each should be a lint rule or CI check, not a prose instruction.

| Check | Rule / Mechanism |
|-------|-----------------|
| Ban bare `console.log` in app code | `no-console` ESLint rule (warn on `.warn`, error on `.log`/`.error`) |
| Require structured logger import | Custom ESLint rule or import boundary: only `src/lib/logger` may call the underlying logger |
| Ban string-only log calls | Custom rule: `logger.info(string)` → error; `logger.info(object)` → ok |
| Require `request_id` / `trace_id` on all log events | Custom middleware test or type-level enforcement |
| Ban log statements inside loops | `no-restricted-syntax` targeting `CallExpression` inside `ForStatement` / `WhileStatement` |
| Require error objects on error-level logs | Custom rule: `logger.error` must include an `err` or `error` field |

## Anti-Patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| `console.log("Payment failed for user " + userId)` | String — unsearchable by field, loses structure | `logger.info({ event: 'payment_failed', user_id: userId })` |
| 15 log lines per request | Scattered context, impossible to correlate across services | Accumulate into one wide event, emit once |
| Only logging errors | No baseline for "what does normal look like?" | Sample happy paths too (1–5%) |
| Low-cardinality fields only (`method`, `env`) | Can build dashboards, can't debug a specific user | Add `user_id`, `order_id`, `trace_id` |
| Treating OTel as "done" | OTel is a delivery format; it doesn't add business context | Instrument spans with user/business fields deliberately |
| Logging before context is gathered | Early partial log is less useful than one complete event | Build event throughout; emit at request end |
