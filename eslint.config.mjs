import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import query from '@tanstack/eslint-plugin-query';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  ...query.configs['flat/recommended'],
  {
    rules: {
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    'public/mockServiceWorker.js',
    'playwright-report/**',
    'test-results/**',
  ]),
]);
