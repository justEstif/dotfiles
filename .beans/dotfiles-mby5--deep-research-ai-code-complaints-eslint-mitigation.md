---
# dotfiles-mby5
title: 'Deep Research: AI Code Complaints & ESLint Mitigation'
status: completed
type: epic
priority: normal
created_at: 2026-04-18T02:05:44Z
updated_at: 2026-04-18T02:10:28Z
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
