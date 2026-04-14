// eslint.config.js
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default defineConfig([
  // ignore build and generated files
  globalIgnores(['.next/**', 'out/**', 'build/**', 'dist/**', 'node_modules/**', 'next-env.d.ts']),

  // surface unused eslint-disable comments
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  // Next.js recommended + TypeScript configs (spread because these are config arrays/objects)
  ...nextVitals,
  ...nextTs,

  // project rules and plugin registrations
  {
    files: ['**/*.{js,jsx,ts,tsx}'],

    // register plugin modules so rule names like "prettier/prettier" and "react-hooks/..." work
    plugins: {
      prettier: prettierPlugin,
      'react-hooks': reactHooks,
      '@typescript-eslint': tsPlugin,
    },

    // let react plugin detect version automatically (next's config already includes react plugin,
    // but setting this is harmless and useful)
    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      // Prettier
      'prettier/prettier': 'error',

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-unused-vars': 'off',

      // JS best practices
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // React
      'react/jsx-boolean-value': ['error', 'never'],
      'react/self-closing-comp': 'error',
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],

      // Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Next override
      '@next/next/no-img-element': 'off',

      // import sorting - keep off if you use a dedicated sorter (optional)
      'import/order': 'off',
      'sort-imports': 'off',
    },
  },

  // Prettier config must be last so it can turn off conflicting rules
  prettierConfig,
]);
