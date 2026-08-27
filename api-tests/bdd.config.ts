import { defineBddConfig } from 'playwright-bdd';

export default defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'tests/steps/**/*.ts',
  outputDir: 'tests/.features-gen',
});
