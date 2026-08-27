import { test as base } from 'playwright-bdd';
import { ApiClient } from './api-client';
import type { APIResponse } from '@playwright/test';

/**
 * Per-scenario state bag — holds the last HTTP response and its parsed JSON.
 * Using a mutable object fixture lets Given/When/Then steps share state safely
 * within a single scenario without reaching for globalThis.
 */
export type TestCtx = {
  response: APIResponse | null;
  json: any;
};

export type BddFixtures = {
  api: ApiClient;
  ctx: TestCtx;
};

/**
 * Extended BDD test object with API client and per-scenario context fixtures.
 * Exported so that createBdd(test) in step files uses the same extended instance.
 * Also included in the "steps" pattern in playwright.config.ts so bddgen can
 * auto-detect the test export without the deprecated importTestFrom option.
 */
export const test = base.extend<BddFixtures>({
  api: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
  ctx: async ({}, use) => {
    await use({ response: null, json: null });
  },
});
