// apps/web/eslint.config.js
import { defineConfig } from 'eslint/config';

import rootConfig from '../eslint.config';

import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...rootConfig,

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
      /*
       |--------------------------------------------------------------------------
       | React
       |--------------------------------------------------------------------------
       */
      'react/jsx-boolean-value': ['error', 'never'],

      'react/self-closing-comp': 'error',

      'react/jsx-curly-brace-presence': [
        'error',
        {
          props: 'never',
          children: 'never',
        },
      ],

      /*
       |--------------------------------------------------------------------------
       | Next.js
       |--------------------------------------------------------------------------
       */
      '@next/next/no-img-element': 'off',
    },
  },
]);
