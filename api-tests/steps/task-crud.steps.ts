import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';

// ── Given (setup) ────────────────────────────────────────────────────────────

/**
 * Creates a task and stores its id so later When / Then steps can reference it.
 * Does NOT overwrite world.response — this is a setup step, not a When step.
 */
Given(
  'I have created a task with title {string}',
  async ({ request, world }, title: string) => {
    const res = await request.post('/api/tasks', { data: { title } });
    expect(res.status()).toBe(201);
    const body = await res.json();
    world.createdTaskId = body.id;
  },
);

/**
 * Deletes the previously created task without capturing the response.
 * Used as a setup step (And/Given) before a When step that reads the same task.
 */
Given('I have deleted the created task', async ({ request, world }) => {
  const res = await request.delete(`/api/tasks/${world.createdTaskId}`);
  expect(res.status()).toBe(204);
});

// ── When (actions) ───────────────────────────────────────────────────────────

When(
  'I create a task with title {string} and description {string}',
  async ({ request, world }, title: string, description: string) => {
    world.response = await request.post('/api/tasks', {
      data: { title, description },
      headers: world.extraHeaders,
    });
  },
);

When(
  'I create a task with title {string} and status {string}',
  async ({ request, world }, title: string, status: string) => {
    world.response = await request.post('/api/tasks', {
      data: { title, status },
      headers: world.extraHeaders,
    });
  },
);

When(
  'I create a task with title {string}',
  async ({ request, world }, title: string) => {
    world.response = await request.post('/api/tasks', {
      data: { title },
      headers: world.extraHeaders,
    });
  },
);

When('I list all tasks', async ({ request, world }) => {
  world.response = await request.get('/api/tasks', {
    headers: world.extraHeaders,
  });
});

When('I fetch the created task', async ({ request, world }) => {
  world.response = await request.get(`/api/tasks/${world.createdTaskId}`, {
    headers: world.extraHeaders,
  });
});

When(
  'I update the created task with title {string}',
  async ({ request, world }, title: string) => {
    world.response = await request.put(`/api/tasks/${world.createdTaskId}`, {
      data: { title },
      headers: world.extraHeaders,
    });
  },
);

When(
  'I update the created task with status {string}',
  async ({ request, world }, status: string) => {
    world.response = await request.put(`/api/tasks/${world.createdTaskId}`, {
      data: { status },
      headers: world.extraHeaders,
    });
  },
);

When('I delete the created task', async ({ request, world }) => {
  world.response = await request.delete(`/api/tasks/${world.createdTaskId}`, {
    headers: world.extraHeaders,
  });
});

// ── Then (assertions) ────────────────────────────────────────────────────────

Then(
  'the response status should be {int}',
  async ({ world }, expectedStatus: number) => {
    expect(world.response!.status()).toBe(expectedStatus);
  },
);

Then(
  'the task body should have title {string}',
  async ({ world }, expectedTitle: string) => {
    const body = await world.response!.json();
    expect(body.title).toBe(expectedTitle);
  },
);

Then(
  'the task body should have status {string}',
  async ({ world }, expectedStatus: string) => {
    const body = await world.response!.json();
    expect(body.status).toBe(expectedStatus);
  },
);

Then('the task body should have an id', async ({ world }) => {
  const body = await world.response!.json();
  expect(body.id).toBeTruthy();
});

Then('the response body should be an array', async ({ world }) => {
  const body = await world.response!.json();
  expect(Array.isArray(body)).toBeTruthy();
});

Then(
  'the task body should have field {string}',
  async ({ world }, field: string) => {
    const body = await world.response!.json();
    expect(body).toHaveProperty(field);
  },
);
