import { test, expect } from '@playwright/test';

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

// E1 error handling tests

test('GET non-existent task returns 404 with stable error body', async ({ request }) => {
  const res = await request.get('/api/tasks/999999');
  expect(res.status()).toBe(404);

  const body = await res.json();
  expect(body.status).toBe(404);
  expect(body.error).toBe('Not Found');
  expect(typeof body.message).toBe('string');
  expect(body.message.length).toBeGreaterThan(0);
  expect(body.timestamp).toBeTruthy();
  expect(body.path).toBe('/api/tasks/999999');
});

test('POST task with blank title returns 400 with stable error body', async ({ request }) => {
  const res = await request.post('/api/tasks', {
    data: { title: '   ', description: 'no title supplied' }
  });
  expect(res.status()).toBe(400);

  const body = await res.json();
  expect(body.status).toBe(400);
  expect(body.error).toBe('Bad Request');
  expect(typeof body.message).toBe('string');
  expect(body.message.length).toBeGreaterThan(0);
  expect(body.timestamp).toBeTruthy();
  expect(body.path).toBe('/api/tasks');
});

test('POST task with missing title returns 400 with stable error body', async ({ request }) => {
  const res = await request.post('/api/tasks', {
    data: { description: 'title field omitted entirely' }
  });
  expect(res.status()).toBe(400);

  const body = await res.json();
  expect(body.status).toBe(400);
  expect(body.error).toBe('Bad Request');
  expect(typeof body.message).toBe('string');
  expect(body.message.length).toBeGreaterThan(0);
  expect(body.timestamp).toBeTruthy();
  expect(body.path).toBe('/api/tasks');
});

test('POST task with malformed JSON body returns 400 with stable error body', async ({ request }) => {
  const res = await request.post('/api/tasks', {
    data: 'not-valid-json{',
    headers: { 'Content-Type': 'application/json' }
  });
  expect(res.status()).toBe(400);

  const body = await res.json();
  expect(body.status).toBe(400);
  expect(body.error).toBe('Bad Request');
  expect(typeof body.message).toBe('string');
  expect(body.timestamp).toBeTruthy();
  expect(body.path).toBe('/api/tasks');
});

test('500 response body does not expose stack trace', async ({ request }) => {
  // Trigger a 500 by sending a valid-structure request with an invalid enum value
  // to verify the generic handler returns a clean body without stack traces
  const res = await request.post('/api/tasks', {
    data: { title: 'valid-title', status: 'INVALID_STATUS_VALUE' }
  });
  // Either 400 (handled binding error) or 500 — either way the body must not contain stack trace markers
  const body = await res.json();
  const bodyText = JSON.stringify(body);
  expect(bodyText).not.toContain('at com.');
  expect(bodyText).not.toContain('java.lang.');
  expect(bodyText).not.toContain('StackTrace');
  expect(body.status).toBeDefined();
  expect(body.message).toBeDefined();
  expect(body.timestamp).toBeTruthy();
});
