// root/eslint.config.js

import { defineConfig, globalIgnores } from 'eslint/config';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/out/**',
    '**/coverage/**',
    '**/next-env.d.ts',
  ]),

  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  {
    files: ['**/*.{js,jsx,ts,tsx}'],

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',

      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      prettier: prettierPlugin,
      'react-hooks': reactHooks,
      '@typescript-eslint': tsPlugin,
    },

    rules: {
      /*
       |--------------------------------------------------------------------------
       | Prettier
       |--------------------------------------------------------------------------
       */
      'prettier/prettier': 'error',

      /*
       |--------------------------------------------------------------------------
       | TypeScript
       |--------------------------------------------------------------------------
       */
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/no-explicit-any': 'warn',

      'no-unused-vars': 'off',

      /*
       |--------------------------------------------------------------------------
       | JavaScript
       |--------------------------------------------------------------------------
       */
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',

      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],

      /*
       |--------------------------------------------------------------------------
       | React Hooks
       |--------------------------------------------------------------------------
       */
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      /*
       |--------------------------------------------------------------------------
       | Imports
       |--------------------------------------------------------------------------
       */
      'import/order': 'off',
      'sort-imports': 'off',
    },
  },

  prettierConfig,
]);
