import { defineConfig, globalIgnores } from 'eslint/config';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

/** Paths ignored in every package (keep in sync with web/mobile where needed). */
export const commonIgnoreGlobs = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/out/**',
  '**/coverage/**',
  '**/.next/**',
  '**/.expo/**',
];

const linterOptionsBlock = {
  linterOptions: {
    reportUnusedDisableDirectives: true,
  },
};

const mainLintBlock = {
  files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],

  languageOptions: {
    parser: tsParser,
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },

  plugins: {
    prettier: prettierPlugin,
    '@typescript-eslint': tsPlugin,
  },

  rules: {
    'prettier/prettier': 'error',

    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],

    '@typescript-eslint/no-explicit-any': 'warn',
    'no-unused-vars': 'off',

    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',

    'no-console': ['warn', { allow: ['warn', 'error'] }],

    'import/order': 'off',
    'sort-imports': 'off',
  },
};

const reactHooksBlock = {
  files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],

  plugins: {
    'react-hooks': reactHooks,
  },

  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};

const coreTail = [prettierConfig];

/**
 * Shared TypeScript + Prettier rules. Use with Expo / other stacks that ship
 * their own `react-hooks` plugin to avoid duplicate plugin registration.
 */
export const baseConfigWithoutReactHooks = defineConfig([
  globalIgnores(commonIgnoreGlobs),
  linterOptionsBlock,
  mainLintBlock,
  ...coreTail,
]);

/**
 * Full shared preset (includes `react-hooks`). Safe with Next.js; do not merge
 * with `eslint-config-expo` in the same run — Expo already registers hooks.
 */
export const baseConfig = defineConfig([
  globalIgnores(commonIgnoreGlobs),
  linterOptionsBlock,
  mainLintBlock,
  reactHooksBlock,
  ...coreTail,
]);

/**
 * Root lint: repo-level files only. Web and mobile each run ESLint in their
 * own directory so framework plugins resolve paths correctly.
 */
export default defineConfig([
  globalIgnores([...commonIgnoreGlobs, 'web/**', 'mobile/**']),
  linterOptionsBlock,
  mainLintBlock,
  reactHooksBlock,
  ...coreTail,
]);
