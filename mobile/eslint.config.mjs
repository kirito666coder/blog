import { defineConfig, globalIgnores } from 'eslint/config';
import expoFlat from 'eslint-config-expo/flat.js';
import {
  baseConfigWithoutReactHooks,
  commonIgnoreGlobs,
} from '../eslint.config.mjs';

export default defineConfig([
  globalIgnores([
    ...commonIgnoreGlobs,
    'ios/**/build/**',
    'android/**/build/**',
  ]),

  ...expoFlat,
  ...baseConfigWithoutReactHooks,

  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
]);
