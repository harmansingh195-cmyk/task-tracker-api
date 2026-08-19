import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

/**
 * Generate test files from feature files into .features-gen/.
 * The steps glob includes fixtures.ts so playwright-bdd picks up the custom test
 * instance with the World fixture automatically.
 */
const bddTestDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'steps/**/*.ts',
});

export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
  },
  reporter: [['html', { open: 'never' }], ['list']],
  projects: [
    {
      name: 'bdd',
      testDir: bddTestDir,
    },
    {
      name: 'api',
      testDir: './tests',
    },
  ],
});
