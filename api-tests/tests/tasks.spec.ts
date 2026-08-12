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