import { defineConfig, globalIgnores } from 'eslint/config';
import { baseConfig } from '../eslint.config.mjs';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  globalIgnores([
    '**/.next/**',
    '**/out/**',
    '**/node_modules/**',
    'next-env.d.ts',
  ]),

  ...baseConfig,

  ...nextVitals,
  ...nextTs,

  {
    files: ['**/*.{js,jsx,ts,tsx}'],

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      'react/jsx-boolean-value': ['error', 'never'],
      'react/self-closing-comp': 'error',
      'react/jsx-curly-brace-presence': [
        'error',
        { props: 'never', children: 'never' },
      ],

      '@next/next/no-img-element': 'off',
    },
  },

  // Transition helper uses intentional effects/refs; keep source unchanged.
  {
    files: ['**/src/components/model/transition.tsx'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
]);
