import { expect } from '@playwright/test';
import { When, Then } from './fixtures';

// ── When (actions triggering errors) ─────────────────────────────────────────

When(
  'I request task with id {int}',
  async ({ request, world }, id: number) => {
    world.response = await request.get(`/api/tasks/${id}`, {
      headers: world.extraHeaders,
    });
  },
);

When(
  'I update task with id {int} with title {string}',
  async ({ request, world }, id: number, title: string) => {
    world.response = await request.put(`/api/tasks/${id}`, {
      data: { title },
      headers: world.extraHeaders,
    });
  },
);

When(
  'I delete task with id {int}',
  async ({ request, world }, id: number) => {
    world.response = await request.delete(`/api/tasks/${id}`, {
      headers: world.extraHeaders,
    });
  },
);

When('I create a task without a title', async ({ request, world }) => {
  world.response = await request.post('/api/tasks', {
    data: { description: 'no title here' },
    headers: world.extraHeaders,
  });
});

/**
 * Sends a raw string body with Content-Type: application/json so that
 * Spring's HttpMessageNotReadableException is triggered.
 */
When(
  'I send malformed JSON to the create task endpoint',
  async ({ request, world }) => {
    world.response = await request.post('/api/tasks', {
      data: '{bad json',
      headers: {
        ...world.extraHeaders,
        'Content-Type': 'application/json',
      },
    });
  },
);

// ── Then (error body assertions) ─────────────────────────────────────────────

Then(
  'the error body status should be {int}',
  async ({ world }, expectedStatus: number) => {
    const body = await world.response!.json();
    expect(body.status).toBe(expectedStatus);
  },
);

Then(
  'the error body errorCode should be {string}',
  async ({ world }, expectedCode: string) => {
    const body = await world.response!.json();
    expect(body.errorCode).toBe(expectedCode);
  },
);

Then(
  'the error body message should be {string}',
  async ({ world }, expectedMessage: string) => {
    const body = await world.response!.json();
    expect(body.message).toBe(expectedMessage);
  },
);

Then(
  'the error body path should be {string}',
  async ({ world }, expectedPath: string) => {
    const body = await world.response!.json();
    expect(body.path).toBe(expectedPath);
  },
);

Then(
  'the error body correlationId should be {string}',
  async ({ world }, expectedCorrelationId: string) => {
    const body = await world.response!.json();
    expect(body.correlationId).toBe(expectedCorrelationId);
  },
);

Then('the error body correlationId should be null', async ({ world }) => {
  const body = await world.response!.json();
  expect(body.correlationId).toBeNull();
});

Then(
  'the error body should have a valid timestamp',
  async ({ world }) => {
    const body = await world.response!.json();
    expect(body.timestamp).toBeTruthy();
    const parsed = new Date(body.timestamp).getTime();
    expect(Number.isNaN(parsed)).toBe(false);
  },
);

Then(
  'the error body should have field {string}',
  async ({ world }, field: string) => {
    const body = await world.response!.json();
    expect(body).toHaveProperty(field);
  },
);
