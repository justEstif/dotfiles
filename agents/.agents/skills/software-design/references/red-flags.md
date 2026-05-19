# Red Flags

Detection signals for design problems. Use during the Explore phase — these sharpen your instincts about where friction signals real shallowness vs. acceptable trade-offs. Not a checklist to tick off mechanically.

Ordered by frequency of occurrence in practice.

## Shallow module

Interface is nearly as complex as implementation. Many small classes/methods that individually do very little.

**Detection**: Count the public API surface vs. lines of implementation. Ratio close to 1:1 = shallow.

```
// Shallow: 6 getter/setter methods wrapping 6 fields, no logic
class UserDTO {
    getName() { return this.name; }
    setName(n) { this.name = n; }
    // ... 4 more
}
```

**Fix**: Merge with related functionality to create depth. Ask "what complexity is this hiding?"

## Pass-through method

Method does almost nothing except invoke another method with a similar or identical signature. Body is 1-3 lines, mostly delegating with same parameters.

```
class OrderService {
    createOrder(items, userId) {
        return this.orderRepository.createOrder(items, userId);
    }
}
```

**Fix**: Expose the lower layer directly, redistribute functionality so the method adds real value, or merge the layers.

## Pass-through variable

Variable passed through a long chain of methods but only used deep in the call stack. Parameter appears in 3+ method signatures but is only consumed by the deepest.

**Fix**: Use context objects, dependency injection, or restructure to reduce the chain.

## Information leakage

Two or more modules depend on the same piece of knowledge (file format, protocol, data structure). Changing one internal detail requires changes in multiple modules.

**Detection patterns**:
- Shared format/protocol knowledge
- Interface types that mirror internal structures
- Constructor parameters exposing implementation choices

```
// Leakage: caller must know internal serialization format
function saveUser(user: User, format: "json" | "msgpack"): void { ... }

// Hidden: module decides serialization internally
function saveUser(user: User): void { ... }
```

**Fix**: Consolidate shared knowledge into a single module. One of the two should own the knowledge entirely.

## Temporal decomposition

Code organized by execution order rather than logical grouping. Module names reflect sequence ("first", "then", "after") or pipeline stages rather than responsibilities. Common in read-process-write pipelines where separate modules share data structure knowledge.

**Fix**: Group by information — all code dealing with a particular data format or concept should live together.

## Overexposed configuration

Configuration parameters that most users don't need, pushed to callers instead of using sensible defaults. Functions with 5+ parameters where most callers pass the same values.

```
// Red flag: pushing complexity to every caller
createServer(port, host, backlog, keepAlive, timeout, maxHeaders,
             headerTimeout, requestTimeout, maxConnections)

// Better: defaults + optional overrides
createServer({ port: 3000 })
```

**Fix**: Use sensible defaults. Only expose configuration callers actually vary. Pull complexity downward.

## Conjoined methods

Can't understand method A without reading method B. Reading one function requires constantly jumping to another. Shared mutable state between methods with no clear contract.

**Fix**: Make each method self-contained with a clear interface contract, or merge them if they're truly one logical operation.

## Special-general mixture

A general-purpose module contains special-case code for a specific use case. `if` branches or parameters that serve only one caller. Comments like "this is for the billing page".

**Fix**: Keep the general mechanism clean. Let the specific use case implement its specialization externally.

## Repetition

Same pattern repeated in multiple places with minor variations. Bug fixes that need to be applied in multiple places.

**Fix**: Extract common pattern into a shared abstraction — but only if stable and repeated 3+ times. Premature abstraction of 2 occurrences often isn't worth it.

## Non-obvious code

Reader cannot quickly understand what code does or why. Tracing through multiple files required for a single operation. Generic containers used instead of named types.

```
// Non-obvious
const result: [string, [number, boolean]] = process(data);

// Obvious
interface ProcessResult {
    userId: string;
    score: number;
    isActive: boolean;
}
const result: ProcessResult = process(data);
```

**Fix**: Better naming, extract named types, add comments explaining "why", simplify control flow.

## Vague naming

Names too generic to convey meaning: `data`, `result`, `handle`, `process`, `manager`, `info`, `tmp`. Multiple variables could swap names without confusion.

**Fix**: Choose names precise about what the thing IS or DOES. If it's hard to name, the abstraction might be unclear.
