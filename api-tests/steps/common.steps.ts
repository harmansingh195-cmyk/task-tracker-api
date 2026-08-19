import { expect } from '@playwright/test';
import { Given } from './fixtures';

/**
 * Health-check: confirms the API is responsive before any scenario runs.
 * A status < 500 is sufficient — the list endpoint may return an empty array (200).
 */
Given('the Task Tracker API is running', async ({ request }) => {
  const res = await request.get('/api/tasks');
  expect(res.status()).toBeLessThan(500);
});

/**
 * Accumulates extra headers that subsequent When steps will include.
 * Using Given here so it can appear in the Given / Background section.
 */
Given(
  'I set request header {string} to {string}',
  async ({ world }, headerName: string, headerValue: string) => {
    world.extraHeaders[headerName] = headerValue;
  },
);
