import { test as base } from 'playwright-bdd';
import { createBdd } from 'playwright-bdd';
import type { APIResponse } from '@playwright/test';

/**
 * Mutable per-scenario state shared between Given / When / Then steps.
 */
export type World = {
  /** Last HTTP response captured by a When step. */
  response: APIResponse | null;
  /** ID of the task created in a Given step (for use in When/Then). */
  createdTaskId: number | null;
  /** Additional request headers accumulated by Given steps. */
  extraHeaders: Record<string, string>;
};

/** Extended test with the shared World fixture. */
export const test = base.extend<{ world: World }>({
  world: async ({}, use) => {
    await use({
      response: null,
      createdTaskId: null,
      extraHeaders: {},
    });
  },
});

export const { Given, When, Then } = createBdd(test);
