import globals from 'globals';

import { FlatCompat } from '@eslint/eslintrc';
import pluginJs from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: pluginJs.configs.recommended,
});

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: { globals: globals.browser },
    rules: {
      'quotes': ['error', 'single', { avoidEscape: true }],
      'indent': ['off', 2],
      'curly': 'error',
      'comma-dangle': ['error', 'only-multiline'],
      'max-len': ['error', { code: 120, ignoreComments: true }],
      'eol-last': ['error', 'always'],
      'eqeqeq': 'error',
      'prefer-const': 'error',
      'prefer-destructuring': 'error',
      'prefer-arrow-callback': ['error', { allowNamedFunctions: true, allowUnboundThis: true }],
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'error',
      'object-curly-spacing': ['error', 'always'],
      'no-var': 'error',
      'no-use-before-define': 'error',
      'semi': 'off',
      '@typescript-eslint/semi': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  ...compat.extends('plugin:@typescript-eslint/recommended'),
];
