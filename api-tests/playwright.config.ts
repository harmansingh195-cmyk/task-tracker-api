import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const bddTestDir = defineBddConfig({
  features: 'features/**/*.feature',
  // Include the fixtures file so bddgen auto-detects the exported "test" instance
  steps: ['tests/steps/**/*.ts', 'tests/support/fixtures.ts'],
  outputDir: 'tests/.features-gen',
});

export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
  },
  reporter: [['html', { open: 'never' }], ['list']],
  projects: [
    {
      name: 'api-spec',
      testDir: 'tests',
      testMatch: '*.spec.ts',
    },
    {
      name: 'bdd',
      testDir: bddTestDir,
    },
  ],
});
