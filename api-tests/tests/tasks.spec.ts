import { test, expect } from '@playwright/test';

type ProblemDetails = {
  type?: string; title?: string; status?: number; detail?: string;
  instance?: string; taskId?: number; errors?: Record<string, string[]>;
};

async function createTask(request: any, payload?: object) {
  return request.post('/api/tasks', { data: payload ?? { title: 'Test Task', description: 'Test Desc' } });
}

async function expectProblemDetailsBasics(res: any, expected: { status: number; title: string }): Promise<ProblemDetails> {
  expect(res.status()).toBe(expected.status);
  const ct = res.headers()['content-type'] ?? '';
  expect(ct).toContain('application/problem+json');
  const body = (await res.json()) as ProblemDetails;
  expect(body).toMatchObject({ title: expected.title, status: expected.status });
  expect(typeof body.type).toBe('string'); expect(body.type!.length).toBeGreaterThan(0);
  expect(typeof body.detail).toBe('string'); expect(body.detail!.length).toBeGreaterThan(0);
  expect(typeof body.instance).toBe('string'); expect(body.instance!.length).toBeGreaterThan(0);
  return body;
}

// === EXISTING TESTS ===

test('create and fetch a task', async ({ request }) => {
  const created = await request.post('/api/tasks', { data: { title: 'Write capstone demo', description: 'Use CodeMie + claude-code', status: 'TODO' } });
  expect(created.status()).toBe(201);
  const body = await created.json();
  expect(body.id).toBeTruthy(); expect(body.title).toBe('Write capstone demo');
  const fetched = await request.get('/api/tasks/' + body.id);
  expect(fetched.ok()).toBeTruthy();
  expect((await fetched.json()).title).toBe('Write capstone demo');
});

test('list tasks returns array', async ({ request }) => {
  const res = await request.get('/api/tasks');
  expect(res.ok()).toBeTruthy();
  expect(Array.isArray(await res.json())).toBeTruthy();
});

test('GET /api/tasks/{id} with unknown id returns 404 problem details', async ({ request }) => {
  const res = await request.get('/api/tasks/999999');
  expect(res.status()).toBe(404);
  expect(res.headers()['content-type']).toContain('application/problem+json');
  const body = await res.json();
  expect(body.status).toBe(404); expect(body.title).toBeTruthy(); expect(body.detail).toBeTruthy(); expect(body.taskId).toBe(999999);
});

test('POST /api/tasks without title returns 400 problem details with field error', async ({ request }) => {
  const res = await request.post('/api/tasks', { data: { description: 'No title provided' } });
  expect(res.status()).toBe(400);
  expect(res.headers()['content-type']).toContain('application/problem+json');
  const body = await res.json();
  expect(body.status).toBe(400); expect(body.title).toBeTruthy(); expect(body.errors).toBeTruthy();
  expect(Array.isArray(body.errors.title)).toBeTruthy(); expect(body.errors.title.length).toBeGreaterThan(0);
});

test('POST /api/tasks with blank title returns 400 problem details indicating title must not be blank', async ({ request }) => {
  const res = await request.post('/api/tasks', { data: { title: '   ' } });
  expect(res.status()).toBe(400);
  expect(res.headers()['content-type']).toContain('application/problem+json');
  const body = await res.json();
  expect(body.status).toBe(400); expect(body.title).toBeTruthy(); expect(body.errors).toBeTruthy();
  expect(Array.isArray(body.errors.title)).toBeTruthy();
  const titleErrors: string[] = body.errors.title;
  expect(titleErrors.some((msg: string) => msg.toLowerCase().includes('blank') || msg.toLowerCase().includes('required'))).toBeTruthy();
});

// === NEW TESTS - EPMCDMETST-61331: RFC 7807 full coverage ===

// --- Positive CRUD ---

test('POST /api/tasks returns created task with id, default status TODO and createdAt timestamp', async ({ request }) => {
  const res = await createTask(request, { title: 'Create Field Validation Task', description: 'Field contract check' });
  expect(res.status()).toBe(201);
  const body = await res.json();
  expect(body.id).toBeDefined(); expect(typeof body.id).toBe('number');
  expect(body.title).toBe('Create Field Validation Task'); expect(body.description).toBe('Field contract check');
  expect(body.status).toBe('TODO');
  expect(body.createdAt).toBeDefined(); expect(typeof body.createdAt).toBe('string');
  expect(body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
});

test('POST /api/tasks with explicit status IN_PROGRESS stores the correct status', async ({ request }) => {
  const res = await createTask(request, { title: 'Status Test Task IN_PROGRESS', status: 'IN_PROGRESS' });
  expect(res.status()).toBe(201);
  expect((await res.json()).status).toBe('IN_PROGRESS');
});

test('POST /api/tasks with status DONE stores the correct status', async ({ request }) => {
  const res = await createTask(request, { title: 'Done Task', status: 'DONE' });
  expect(res.status()).toBe(201);
  expect((await res.json()).status).toBe('DONE');
});

test('PUT /api/tasks/{id} updates title, description and status on existing task', async ({ request }) => {
  const createRes = await createTask(request, { title: 'Original Title', description: 'Before update', status: 'TODO' });
  expect(createRes.ok()).toBeTruthy();
  const created = await createRes.json();
  const updateRes = await request.put('/api/tasks/' + created.id, { data: { title: 'Updated Title', description: 'After update', status: 'IN_PROGRESS' } });
  expect(updateRes.ok()).toBeTruthy();
  const updated = await updateRes.json();
  expect(updated.id).toBe(created.id);
  expect(updated.title).toBe('Updated Title'); expect(updated.description).toBe('After update'); expect(updated.status).toBe('IN_PROGRESS');
  expect(updated.createdAt).toBeDefined();
});

test('PUT /api/tasks/{id} partial update only changes supplied fields', async ({ request }) => {
  const createRes = await createTask(request, { title: 'Partial Update Task', description: 'Keep this', status: 'TODO' });
  expect(createRes.ok()).toBeTruthy();
  const created = await createRes.json();
  const updateRes = await request.put('/api/tasks/' + created.id, { data: { status: 'DONE' } });
  expect(updateRes.ok()).toBeTruthy();
  const updated = await updateRes.json();
  expect(updated.title).toBe('Partial Update Task'); expect(updated.description).toBe('Keep this'); expect(updated.status).toBe('DONE');
});

test('DELETE /api/tasks/{id} deletes existing task; subsequent GET returns 404 RFC7807', async ({ request }) => {
  const createRes = await createTask(request, { title: 'Task to Delete', description: 'Delete me' });
  expect(createRes.ok()).toBeTruthy();
  const created = await createRes.json();
  const delRes = await request.delete('/api/tasks/' + created.id);
  expect([200, 204]).toContain(delRes.status());
  const pd = await expectProblemDetailsBasics(await request.get('/api/tasks/' + created.id), { status: 404, title: 'Task not found' });
  expect(pd.taskId).toBe(created.id);
});

test('Full lifecycle: create -> GET by id -> update -> DELETE -> verify 404', async ({ request }) => {
  const created = await (await createTask(request, { title: 'Lifecycle Task', description: 'Full lifecycle', status: 'TODO' })).json();
  expect(created.id).toBeDefined();
  const fetched = await (await request.get('/api/tasks/' + created.id)).json();
  expect(fetched.title).toBe('Lifecycle Task');
  const updated = await (await request.put('/api/tasks/' + created.id, { data: { title: 'Lifecycle Task Updated', status: 'IN_PROGRESS' } })).json();
  expect(updated.title).toBe('Lifecycle Task Updated'); expect(updated.status).toBe('IN_PROGRESS');
  expect([200, 204]).toContain((await request.delete('/api/tasks/' + created.id)).status());
  expect((await request.get('/api/tasks/' + created.id)).status()).toBe(404);
});

// --- RFC 7807 - 404 Not Found (all endpoints) ---

test('GET /api/tasks/{id} 404 RFC7807 has all required fields', async ({ request }) => {
  const pd = await expectProblemDetailsBasics(await request.get('/api/tasks/888888'), { status: 404, title: 'Task not found' });
  expect(pd.taskId).toBe(888888);
  expect(pd.instance).toContain('/api/tasks/888888');
  expect(pd.type).toContain('http');
});

test('PUT /api/tasks/{id} with unknown id returns 404 RFC7807 including taskId extension', async ({ request }) => {
  const unknownId = 99999991;
  const pd = await expectProblemDetailsBasics(await request.put('/api/tasks/' + unknownId, { data: { title: 'nope', status: 'DONE' } }), { status: 404, title: 'Task not found' });
  expect(pd.taskId).toBe(unknownId);
  expect(pd.instance).toContain('/api/tasks/' + unknownId);
});

test('DELETE /api/tasks/{id} with unknown id returns 404 RFC7807 including taskId extension', async ({ request }) => {
  const unknownId = 99999992;
  const pd = await expectProblemDetailsBasics(await request.delete('/api/tasks/' + unknownId), { status: 404, title: 'Task not found' });
  expect(pd.taskId).toBe(unknownId);
  expect(pd.instance).toContain('/api/tasks/' + unknownId);
});

// --- RFC 7807 - 400 Validation Failed ---

test('POST /api/tasks missing title: 400 RFC7807 errors.title array', async ({ request }) => {
  const pd = await expectProblemDetailsBasics(await request.post('/api/tasks', { data: { description: 'No title' } }), { status: 400, title: 'Validation failed' });
  expect(pd.errors).toBeDefined(); expect(typeof pd.errors).toBe('object');
  expect(Array.isArray(pd.errors!.title)).toBeTruthy(); expect(pd.errors!.title.length).toBeGreaterThan(0);
});

test('POST /api/tasks blank title: 400 RFC7807 errors.title contains title must not be blank', async ({ request }) => {
  const pd = await expectProblemDetailsBasics(await request.post('/api/tasks', { data: { title: '   ', description: 'desc' } }), { status: 400, title: 'Validation failed' });
  expect(pd.errors).toBeDefined(); expect(Array.isArray(pd.errors!.title)).toBeTruthy();
  expect(pd.errors!.title).toContain('title must not be blank');
  expect(pd.instance).toContain('/api/tasks');
  expect(pd.type).toContain('validation-error');
});

test('POST /api/tasks null title: 400 RFC7807 with errors.title populated', async ({ request }) => {
  const res = await request.post('/api/tasks', { data: { title: null, description: 'desc' } });
  expect(res.status()).toBe(400);
  expect(res.headers()['content-type'] ?? '').toContain('application/problem+json');
  const body = await res.json();
  expect(body.status).toBe(400); expect(body.errors?.title).toBeDefined();
  expect(Array.isArray(body.errors.title)).toBeTruthy(); expect(body.errors.title.length).toBeGreaterThan(0);
});

test('POST /api/tasks empty string title: 400 RFC7807 with errors.title populated', async ({ request }) => {
  const res = await request.post('/api/tasks', { data: { title: '', description: 'desc' } });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.status).toBe(400); expect(body.title).toBe('Validation failed');
  expect(body.errors?.title).toBeDefined(); expect(Array.isArray(body.errors.title)).toBeTruthy();
});

test('POST /api/tasks 400 RFC7807: detail field is Request validation failed', async ({ request }) => {
  const res = await request.post('/api/tasks', { data: { description: 'Missing title' } });
  expect(res.status()).toBe(400);
  expect((await res.json()).detail).toBe('Request validation failed');
});

// --- Content-Type header verification ---

test('Content-Type is application/problem+json for 404 responses', async ({ request }) => {
  expect(((await request.get('/api/tasks/999991')).headers()['content-type'] ?? '')).toContain('application/problem+json');
});

test('Content-Type is application/problem+json for 400 validation responses', async ({ request }) => {
  const res = await request.post('/api/tasks', { data: { description: 'no title' } });
  expect(res.headers()['content-type'] ?? '').toContain('application/problem+json');
});

// --- Boundary / type mismatch ---

test('GET /api/tasks/{id} with non-numeric id: returns 4xx or 5xx problem details (boundary)', async ({ request }) => {
  const res = await request.get('/api/tasks/not-a-number');
  expect([400, 404, 500]).toContain(res.status());
  const ct = res.headers()['content-type'] ?? '';
  if (ct.includes('application/problem+json')) {
    const body = (await res.json()) as ProblemDetails;
    expect(typeof body.title).toBe('string'); expect(typeof body.status).toBe('number');
    expect(typeof body.type).toBe('string'); expect(typeof body.detail).toBe('string');
    expect(typeof body.instance).toBe('string');
  }
});

test('GET /api/tasks/{id} with negative id (boundary): returns 404 RFC7807', async ({ request }) => {
  const res = await request.get('/api/tasks/-1');
  expect(res.status()).toBe(404);
  expect(res.headers()['content-type'] ?? '').toContain('application/problem+json');
  const body = await res.json();
  expect(body.status).toBe(404); expect(body.taskId).toBe(-1);
});

test('GET /api/tasks/{id} with very large id (boundary): returns 404 RFC7807', async ({ request }) => {
  const res = await request.get('/api/tasks/9999999999');
  expect(res.status()).toBe(404);
  const body = await res.json();
  expect(body.status).toBe(404); expect(body.title).toBe('Task not found');
});

// --- RFC 7807 - 500 Internal Server Error (best-effort contract) ---

test('PUT /api/tasks/{id} with invalid enum status: returns RFC7807 content (400 or 500)', async ({ request }) => {
  const createRes = await createTask(request, { title: 'For invalid enum', description: 'desc' });
  expect(createRes.ok()).toBeTruthy();
  const created = await createRes.json();
  const res = await request.put('/api/tasks/' + created.id, { data: { title: 'Still valid', status: 'BROKEN_STATUS' } });
  const ct = res.headers()['content-type'] ?? '';
  if (ct.includes('application/problem+json')) {
    const body = (await res.json()) as ProblemDetails;
    expect([400, 500]).toContain(body.status);
    expect(typeof body.title).toBe('string'); expect(typeof body.type).toBe('string');
    expect(typeof body.detail).toBe('string'); expect(typeof body.instance).toBe('string');
    if (body.status === 500) {
      expect(body.title).toBe('Internal Server Error');
      expect(body.detail).toBe('An unexpected error occurred');
      expect(body.type).toContain('internal-server-error');
    }
  } else {
    expect(res.ok()).toBeFalsy();
    expect([400, 500]).toContain(res.status());
  }
});
