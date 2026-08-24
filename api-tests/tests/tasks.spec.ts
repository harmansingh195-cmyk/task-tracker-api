import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

test('create and fetch a task', async ({ request }) => {
  const created = await request.post('/api/tasks', {
    data: { title: 'Write capstone demo', description: 'Use CodeMie + claude-code', status: 'TODO' }
  });
  expect(created.status()).toBe(201);

  const body = await created.json();
  expect(body.id).toBeTruthy();
  expect(body.title).toBe('Write capstone demo');

  const fetched = await request.get(`/api/tasks/${body.id}`);
  expect(fetched.ok()).toBeTruthy();

  const fetchedBody = await fetched.json();
  expect(fetchedBody.title).toBe('Write capstone demo');
});

test('list tasks returns array', async ({ request }) => {
  const res = await request.get('/api/tasks');
  expect(res.ok()).toBeTruthy();
  const tasks = await res.json();
  expect(Array.isArray(tasks)).toBeTruthy();
});

// ---------------------------------------------------------------------------
// ProblemDetails error contract tests (RFC 7807)
// ---------------------------------------------------------------------------

test('GET /api/tasks/:id — non-existent id returns 404 ProblemDetails', async ({ request }) => {
  const res = await request.get('/api/tasks/99999');
  expect(res.status()).toBe(404);

  const body = await res.json();
  // Required ProblemDetails fields
  expect(body.type).toBe('https://example.com/problems/task-not-found');
  expect(body.title).toBe('Task not found');
  expect(body.status).toBe(404);
  expect(body.detail).toBe('Task not found: 99999');
  expect(body.instance).toBe('/api/tasks/99999');
});

test('POST /api/tasks — blank title returns 400 ProblemDetails', async ({ request }) => {
  const res = await request.post('/api/tasks', {
    data: { title: '' }
  });
  expect(res.status()).toBe(400);

  const body = await res.json();
  expect(body.type).toBe('https://example.com/problems/validation-error');
  expect(body.title).toBe('Invalid request');
  expect(body.status).toBe(400);
  expect(body.detail).toBe('title is required');
  expect(body.instance).toBe('/api/tasks');
  // Extension: field-level errors
  expect(Array.isArray(body.invalidParams)).toBeTruthy();
  expect(body.invalidParams[0].name).toBe('title');
});

test('POST /api/tasks — missing title returns 400 ProblemDetails', async ({ request }) => {
  const res = await request.post('/api/tasks', {
    data: { description: 'No title provided' }
  });
  expect(res.status()).toBe(400);

  const body = await res.json();
  expect(body.type).toBe('https://example.com/problems/validation-error');
  expect(body.title).toBe('Invalid request');
  expect(body.status).toBe(400);
  expect(body.instance).toBe('/api/tasks');
});

test('GET /api/tasks/:id — non-numeric id returns 400 ProblemDetails', async ({ request }) => {
  const res = await request.get('/api/tasks/abc');
  expect(res.status()).toBe(400);

  const body = await res.json();
  expect(body.type).toBe('https://example.com/problems/type-mismatch');
  expect(body.title).toBe('Bad request');
  expect(body.status).toBe(400);
  expect(body.detail).toBe("Parameter 'id' must be a number");
  expect(body.instance).toBe('/api/tasks/abc');
});

test('PUT /api/tasks/:id — non-existent id returns 404 ProblemDetails', async ({ request }) => {
  const res = await request.put('/api/tasks/99999', {
    data: { title: 'Updated title' }
  });
  expect(res.status()).toBe(404);

  const body = await res.json();
  expect(body.type).toBe('https://example.com/problems/task-not-found');
  expect(body.title).toBe('Task not found');
  expect(body.status).toBe(404);
  expect(body.instance).toBe('/api/tasks/99999');
});

test('DELETE /api/tasks/:id — non-existent id returns 404 ProblemDetails', async ({ request }) => {
  const res = await request.delete('/api/tasks/99999');
  expect(res.status()).toBe(404);

  const body = await res.json();
  expect(body.type).toBe('https://example.com/problems/task-not-found');
  expect(body.title).toBe('Task not found');
  expect(body.status).toBe(404);
  expect(body.instance).toBe('/api/tasks/99999');
});

test('error responses do not contain stack traces', async ({ request }) => {
  const res = await request.get('/api/tasks/99999');
  expect(res.status()).toBe(404);

  const bodyText = await res.text();
  // Must not leak stack trace or exception class names
  expect(bodyText).not.toContain('at com.');
  expect(bodyText).not.toContain('java.lang.');
  expect(bodyText).not.toContain('Exception');
});
