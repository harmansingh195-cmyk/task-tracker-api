import { defineConfig } from '@playwright/test';
import bdd from './bdd.config';

export default defineConfig({
  // keep spec-style tests and generated bdd tests both discoverable
  testDir: './tests',
  testMatch: ['**/*.spec.ts', '**/.features-gen/**/*.spec.ts'],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
  },
  reporter: [['html', { open: 'never' }], ['list']],
});
