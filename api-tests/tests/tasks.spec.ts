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

test('GET /api/tasks/{id} with unknown id returns 404 problem details', async ({ request }) => {
  const res = await request.get('/api/tasks/999999');
  expect(res.status()).toBe(404);

  const contentType = res.headers()['content-type'];
  expect(contentType).toContain('application/problem+json');

  const body = await res.json();
  expect(body.status).toBe(404);
  expect(body.title).toBeTruthy();
  expect(body.detail).toBeTruthy();
  expect(body.taskId).toBe(999999);
});

test('POST /api/tasks without title returns 400 problem details with field error', async ({ request }) => {
  const res = await request.post('/api/tasks', {
    data: { description: 'No title provided' }
  });
  expect(res.status()).toBe(400);

  const contentType = res.headers()['content-type'];
  expect(contentType).toContain('application/problem+json');

  const body = await res.json();
  expect(body.status).toBe(400);
  expect(body.title).toBeTruthy();
  expect(body.errors).toBeTruthy();
  expect(Array.isArray(body.errors.title)).toBeTruthy();
  expect(body.errors.title.length).toBeGreaterThan(0);
});

test('POST /api/tasks with blank title returns 400 problem details indicating title must not be blank', async ({ request }) => {
  const res = await request.post('/api/tasks', {
    data: { title: '   ' }
  });
  expect(res.status()).toBe(400);

  const contentType = res.headers()['content-type'];
  expect(contentType).toContain('application/problem+json');

  const body = await res.json();
  expect(body.status).toBe(400);
  expect(body.title).toBeTruthy();
  expect(body.errors).toBeTruthy();
  expect(Array.isArray(body.errors.title)).toBeTruthy();
  const titleErrors: string[] = body.errors.title;
  expect(titleErrors.some((msg: string) => msg.toLowerCase().includes('blank') || msg.toLowerCase().includes('required'))).toBeTruthy();
});
