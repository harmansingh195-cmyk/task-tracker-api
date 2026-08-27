import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test, type TestCtx } from '../support/fixtures';
import {
  assertNoInternalLeak,
  looksLikeProblemDetails,
  type ProblemDetails,
} from '../support/api-client';

const { Given, When, Then } = createBdd(test);

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------
Given('the Task Tracker API is running', async ({ request, baseURL }) => {
  const res = await request.get('/api/tasks');
  expect(res.status(), `API should be reachable at ${baseURL}`).toBeLessThan(600);
});

// ---------------------------------------------------------------------------
// When — HTTP request helpers
// ---------------------------------------------------------------------------
When('I GET {string}', async ({ api, ctx }, path: string) => {
  ctx.response = await api.get(path);
  ctx.json = null;
});

When('I POST {string} with json:', async ({ api, ctx }, path: string, docString: string) => {
  ctx.response = await api.postJson(path, JSON.parse(docString));
  ctx.json = null;
});

When(
  'I POST {string} with raw body {string} and content type {string}',
  async ({ api, ctx }, path: string, body: string, contentType: string) => {
    ctx.response = await api.postRaw(path, body, contentType);
    ctx.json = null;
  },
);

// ---------------------------------------------------------------------------
// Internal helper — lazy JSON parse cached on ctx
// ---------------------------------------------------------------------------
async function resolveJson(ctx: TestCtx): Promise<ProblemDetails | null> {
  if (ctx.json === null && ctx.response) {
    ctx.json = await ctx.response.json().catch(() => null);
  }
  return ctx.json as ProblemDetails | null;
}

// ---------------------------------------------------------------------------
// Then — assertions
// ---------------------------------------------------------------------------
Then('the response status should be {int}', async ({ ctx }, status: number) => {
  expect(ctx.response, 'No response captured — a When step must run first.').toBeTruthy();
  expect(ctx.response!.status()).toBe(status);
});

Then('the response should be Problem Details', async ({ ctx }) => {
  const json = await resolveJson(ctx);
  expect(json, 'Response body is not valid JSON').toBeTruthy();
  expect(
    looksLikeProblemDetails(json),
    `Expected RFC7807 Problem Details (numeric "status" + string "detail"), got: ${JSON.stringify(json)}`,
  ).toBeTruthy();
});

Then(
  'the Problem Details field {string} should be {int}',
  async ({ ctx }, field: string, value: number) => {
    const json = await resolveJson(ctx);
    expect(json, 'Problem Details JSON not resolved').toBeTruthy();
    expect((json as any)[field]).toBe(value);
  },
);

Then(
  'the Problem Details field {string} should contain {string}',
  async ({ ctx }, field: string, fragment: string) => {
    const json = await resolveJson(ctx);
    expect(json, 'Problem Details JSON not resolved').toBeTruthy();
    expect(String((json as any)[field] ?? '')).toContain(fragment);
  },
);

Then(
  'the Problem Details should mention validation for field {string}',
  async ({ ctx }, field: string) => {
    const json = await resolveJson(ctx);
    const combined = JSON.stringify(json).toLowerCase();
    expect(combined, `Expected field name "${field}" to appear in Problem Details`).toContain(
      field.toLowerCase(),
    );
    expect(combined).toMatch(/valid|constraint|missing|must not|required/);
  },
);

Then('the response body should not leak internal implementation details', async ({ ctx }) => {
  const text = await ctx.response!.text();
  assertNoInternalLeak(text);
});

Then('the response content type should include {string}', async ({ ctx }, expected: string) => {
  const ct = ctx.response!.headers()['content-type'] ?? '';
  expect(ct).toContain(expected);
});
