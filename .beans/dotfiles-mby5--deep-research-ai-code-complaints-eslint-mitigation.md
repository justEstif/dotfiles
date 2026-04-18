---
# dotfiles-mby5
title: 'Deep Research: AI Code Complaints & ESLint Mitigation'
status: completed
type: epic
priority: normal
created_at: 2026-04-18T02:05:44Z
updated_at: 2026-04-18T02:15:41Z
---

Investigate common complaints about AI-generated code and map them to strict ESLint rules for Next.js, TypeScript, and Node.js environments.

## Deep Research: AI Code Complaints & ESLint Mapping

### 1. The "Any" Escape Hatch (TypeScript)
**Complaint:** When AI struggles with complex types, it falls back to `any`, `@ts-ignore`, or non-null assertions (`!`), silently destroying type safety.
**ESLint Mitigation:**
- `@typescript-eslint/no-explicit-any`: error
- `@typescript-eslint/ban-ts-comment`: error
- `@typescript-eslint/no-non-null-assertion`: error

### 2. Floating Promises (Node.js / Express)
**Complaint:** AI frequently fires off async functions (like DB calls or API requests) without `await`ing them or handling errors, causing unhandled promise rejections that crash Node apps.
**ESLint Mitigation:**
- `@typescript-eslint/no-floating-promises`: error (forces `await` or `.catch()`)
- `@typescript-eslint/no-misused-promises`: error

### 3. React Hooks Violations (React / Next.js)
**Complaint:** AI treats hooks like regular functions, placing them inside `if` statements, loops, or early returns. It also constantly messes up `useEffect` dependency arrays, causing infinite loops.
**ESLint Mitigation:**
- `react-hooks/rules-of-hooks`: error
- `react-hooks/exhaustive-deps`: error

### 4. Next.js Anti-Patterns
**Complaint:** Using standard `<a>` tags instead of `<Link>`, `<img>` instead of `<Image>`, or accidentally leaking server secrets to the client.
**ESLint Mitigation:**
- `@next/next/recommended` plugin (catches standard Next.js errors)
- `@next/next/no-html-link-for-pages`: error

### 5. Monolithic Components (Architecture)
**Complaint:** AI generates massive 500-line React components with 8 `useState` hooks and deeply nested ternary operators for rendering.
**ESLint Mitigation:**
- `max-lines-per-function`: [error, 50]
- `complexity`: [error, 10]
- `sonarjs/cognitive-complexity`: [error, 15]

### 6. Spaghetti Imports & Circular Dependencies
**Complaint:** AI grabs imports from random relative paths (e.g., `../../../components/Button`) instead of using aliases, and creates circular dependencies.
**ESLint Mitigation:**
- `import/no-cycle`: error
- `perfectionist/sort-imports`: error (forces a strict order so the AI doesn't hallucinate locations as easily)

\n\nConfigured `eslint-config-agent-strict` to include the following ESLint rules to combat common AI code generation issues:\n- React/Hooks tracking (`rules-of-hooks`, `exhaustive-deps`) to prevent infinite renders.\n- Next.js anti-patterns (`no-html-link-for-pages`, `no-img-element`).\n- Explicit `any` or `@ts-ignore` bans so it can't skip type safety.\n- Floating promise bans (`no-floating-promises`) so it doesn't crash Node servers with unhandled DB calls.\n- Circular dependency tracking.

\n\n### 6. Total TypeScript & Patterns.dev Best Practices\n**Complaint:** AI uses outdated or unsafe TypeScript features (like `enums`, `as` casting instead of `satisfies`, or mixing `type` and `interface`). It also doesn't optimize imports for bundlers.\n**ESLint Mitigation:**\n- `@typescript-eslint/consistent-type-definitions`: `['error', 'type']` (Matt Pocock recommends `type` over `interface`).\n- `@typescript-eslint/consistent-type-assertions`: `['error', { assertionStyle: 'never' }]` (Bans `as Type` casting to force the AI to prove types or use `satisfies`).\n- `@typescript-eslint/consistent-type-imports`: `['error', { prefer: 'type-imports' }]` (Forces `import type` for better bundling).\n- `no-restricted-syntax`: Ban `TSEnumDeclaration` (TS enums have bloated runtime behavior, prefer union types).\n- `unicorn/no-for-loop`: `error` (Forces the AI to use `map`, `filter`, `reduce` instead of imperative mutable `for` loops).

\n\n### 7. React Render Optimization Patterns\n**Complaint:** AI writes React code that causes massive re-renders (defining components inside components, subscribing to huge objects instead of primitives, using `&&` with numbers that render `0` to the DOM).\n**ESLint Mitigation:**\n- `react/no-unstable-nested-components`: `error` (Prevents defining components inside other components, which destroys state and remounts the DOM every render).\n- `react/jsx-no-constructed-context-values`: `error` (Prevents passing `value={{...}}` to providers without memoizing, causing massive re-renders).\n- `react/jsx-no-leaked-render`: `['error', { validStrategies: ['ternary', 'coerce'] }]` (Prevents the classic `{count && <Badge />}` bug where `0` is rendered to the UI).
