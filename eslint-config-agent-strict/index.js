import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import perfectionist from 'eslint-plugin-perfectionist';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  sonarjs.configs.recommended,
  unicorn.configs['flat/recommended'],
  perfectionist.configs['recommended-natural'],
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  {
    plugins: {
      'react-hooks': reactHooksPlugin,
      '@next/next': nextPlugin,
      'import': importPlugin,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // --------------------------------------------------------
      // 1. COMPLEXITY LIMITS (The Agent Constraints)
      // --------------------------------------------------------
      'complexity': ['error', 10],                     
      'max-depth': ['error', 3],                       
      'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }], // Prevent "God Files" (Information Hiding)
      'max-lines-per-function': ['error', 40],         
      'max-params': ['error', 4], // Prevent "Overexposed Configuration Parameters" (Philosophy of Software Design)
      'max-statements': ['error', 15],                 
      'sonarjs/cognitive-complexity': ['error', 15],

      // --------------------------------------------------------
      // 2. DETERMINISTIC FEEDBACK (No "Creative" Solutions)
      // --------------------------------------------------------
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-warning-comments': ['error', { terms: ['todo', 'fixme', 'hack'], location: 'start' }],

      // --------------------------------------------------------
      // 3. TYPESCRIPT ESCAPE HATCHES (Node/Express/React)
      // --------------------------------------------------------
      // The AI will fall back to `any` when confused. Forbid it.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      
      // Prevent Node.js apps from crashing due to AI forgetting to await DB/API calls
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // --------------------------------------------------------
      // TOTAL TYPESCRIPT & PATTERNS.DEV BEST PRACTICES
      // --------------------------------------------------------
      // 1. Force `type` instead of `interface` (Total TypeScript recommendation for predictable unions/intersections)
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      
      // 2. Ban `as Type` casting. Force the AI to actually prove the type or use `satisfies`.
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      
      // 3. Force `import type` where possible to optimize Next.js / Vite bundling
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      
      // 4. Ban TypeScript `enum` (they have unpredictable runtime bloat; prefer string unions)
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'Do not use TypeScript enums. Use a union of string literals or a const object instead (Total TypeScript recommendation).',
        },
      ],
      
      // 5. Ban imperative `for` loops in favor of `map`, `filter`, `reduce` (React/Next.js best practice)
      'unicorn/no-for-loop': 'error',

      // --------------------------------------------------------
      // 4. REACT & NEXT.JS (Anti-patterns & Rules of Hooks)
      // --------------------------------------------------------
      // AI constantly violates hooks or forgets exhaustive deps
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      
      // Prevent AI from defining components inside other components (destroys state and remounts DOM)
      'react/no-unstable-nested-components': 'error',
      
      // Prevent passing unmemoized objects to Context Providers (causes massive re-renders)
      'react/jsx-no-constructed-context-values': 'error',
      
      // Prevent the classic `{count && <Badge />}` bug where `0` or `NaN` renders to the DOM
      'react/jsx-no-leaked-render': ['error', { validStrategies: ['ternary', 'coerce'] }],
      
      // Next.js standard optimizations
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'error',
      
      // --------------------------------------------------------
      // 5. IMPORTS & ARCHITECTURE (Vercel Best Practices)
      // --------------------------------------------------------
      // Prevent AI from inventing circular dependencies or grabbing broken relative paths
      'import/no-cycle': 'error',
      
      // Vercel / Next.js Critical Rule: Ban importing from huge barrel files that destroy build performance
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lucide-react',
              message: 'Vercel Best Practice: Do not import from the lucide-react barrel file. It loads 1,500+ modules and kills dev performance. Use Next.js optimizePackageImports or import specific icons.',
            },
            {
              name: '@mui/material',
              message: 'Vercel Best Practice: Do not import from the @mui/material barrel file. Use direct imports (e.g. @mui/material/Button).',
            },
            {
              name: 'lodash',
              message: 'Import specific lodash functions (e.g. lodash/get) instead of the entire library.',
            }
          ],
        },
      ],
      
      // Force uniform naming so the AI doesn't mix camelCase and kebab-case React components
      'unicorn/filename-case': ['error', { 
        cases: { kebabCase: true, pascalCase: true }, // Allow both component and util names
        ignore: ['^next-env.d.ts$']
      }],
      'unicorn/prevent-abbreviations': 'off', // Too annoying for React codebases (props, refs, env)
    },
  },
);
