import { expect } from '@playwright/test';
import { createBdd, test as base } from 'playwright-bdd';
import { ApiClient, assertNoInternalLeak, looksLikeProblemDetails, type ProblemDetails } from '../support/api-client';

type Fixtures = {
  api: ApiClient;
  response?: any;
  responseJson?: any;
};

const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
});

const { Given, When, Then } = createBdd(test);

Given('the Task Tracker API is running', async ({ request, baseURL }) => {
  // best-effort health check: list tasks should respond (or at least connect)
  const res = await request.get('/api/tasks');
  expect(res.status(), 'API should be reachable at baseURL').toBeLessThan(600);
  expect(baseURL).toBeTruthy();
});

When('I GET {string}', async ({ api }, path: string) => {
  const res = await api.get(path);
  // store on test info via fixtures
  (test as any).info().annotations; // no-op to keep types quiet
  (globalThis as any).__lastResponse = res;
});

When('I POST {string} with json:', async ({ api }, path: string, docString: string) => {
  const json = JSON.parse(docString);
  const res = await api.postJson(path, json);
  (globalThis as any).__lastResponse = res;
});

When('I POST {string} with raw body {string} and content type {string}', async ({ api }, path: string, body: string, contentType: string) => {
  const res = await api.postRaw(path, body, contentType);
  (globalThis as any).__lastResponse = res;
});

Then('the response status should be {int}', async ({}, status: number) => {
  const res = (globalThis as any).__lastResponse;
  expect(res, 'No response captured. Did a When step run?').toBeTruthy();
  expect(res.status()).toBe(status);
});

Then('the response should be Problem Details', async ({},) => {
  const res = (globalThis as any).__lastResponse;
  const json = (globalThis as any).__lastResponseJson ?? (await res.json().catch(() => null));
  (globalThis as any).__lastResponseJson = json;
  expect(json, 'Response is not valid JSON').toBeTruthy();
  expect(looksLikeProblemDetails(json), `Expected ProblemDetails with numeric status and string detail, got: ${JSON.stringify(json)}`).toBeTruthy();
});

Then('the Problem Details field {string} should be {int}', async ({}, field: string, value: number) => {
  const json: ProblemDetails = (globalThis as any).__lastResponseJson;
  expect(json).toBeTruthy();
  expect((json as any)[field]).toBe(value);
});

Then('the Problem Details field {string} should contain {string}', async ({}, field: string, fragment: string) => {
  const json: ProblemDetails = (globalThis as any).__lastResponseJson;
  expect(json).toBeTruthy();
  expect(String((json as any)[field] ?? '')).toContain(fragment);
});

Then('the Problem Details should mention validation for field {string}', async ({}, field: string) => {
  const json: ProblemDetails = (globalThis as any).__lastResponseJson;
  const combined = JSON.stringify(json).toLowerCase();
  expect(combined).toContain(field.toLowerCase());
  expect(combined).toMatch(/valid|constraint|missing|must not|required/);
});

Then('the response body should not leak internal implementation details', async ({},) => {
  const res = (globalThis as any).__lastResponse;
  const text = await res.text();
  assertNoInternalLeak(text);
});

Then('the response content type should include {string}', async ({}, expected: string) => {
  const res = (globalThis as any).__lastResponse;
  const ct = res.headers()['content-type'] ?? '';
  expect(ct).toContain(expected);
});
