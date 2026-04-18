import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import perfectionist from 'eslint-plugin-perfectionist';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  sonarjs.configs.recommended,
  unicorn.configs['flat/recommended'],
  perfectionist.configs['recommended-natural'],
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // --------------------------------------------------------
      // 1. COMPLEXITY LIMITS (The Agent Constraints)
      // --------------------------------------------------------
      // Forces agents to decompose large files and functions
      'complexity': ['error', 10],                     // Max 10 paths through a function
      'max-depth': ['error', 3],                       // Max 3 levels of nested blocks (if/for/while)
      'max-lines-per-function': ['error', 40],         // Keep functions small and focused
      'max-params': ['error', 4],                      // Force objects for many arguments
      'max-statements': ['error', 15],                 // Limit total statements per function
      
      // SonarJS Cognitive Complexity is smarter about nesting than basic complexity
      'sonarjs/cognitive-complexity': ['error', 15],

      // --------------------------------------------------------
      // 2. DETERMINISTIC FEEDBACK (No "Creative" Solutions)
      // --------------------------------------------------------
      // Forbid console.log in favor of a real logger in production apps
      'no-console': ['error', { allow: ['warn', 'error'] }],
      
      // Prevent the agent from leaving "todo" or "fixme" comments instead of fixing the issue
      'no-warning-comments': ['error', { terms: ['todo', 'fixme', 'hack'], location: 'start' }],

      // --------------------------------------------------------
      // 3. UNICORN OPINIONS (Catch entire classes of bugs)
      // --------------------------------------------------------
      // Prevent abbreviations that humans understand but agents might misinterpret
      'unicorn/prevent-abbreviations': 'error',
      // Force consistent file names
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
      
      // --------------------------------------------------------
      // 4. TYPESCRIPT STRICTNESS
      // --------------------------------------------------------
      // If the types are loose, the agent will find every crack
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
);
