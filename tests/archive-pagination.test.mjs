import test from 'node:test';
import assert from 'node:assert/strict';
import { URL } from 'node:url';
import handler from '../api/content.js';

function mockResponse() {
  return {
    code: 200,
    headers: {},
    body: null,
    status(code) { this.code = code; return this; },
    setHeader(name, value) { this.headers[name] = value; return this; },
    json(value) { this.body = value; return this; },
    send(value) { this.body = value; return this; },
  };
}

test('LIST_CONTENT forwards a bounded cursor and retains backend envelope', async () => {
  const originalFetch = globalThis.fetch;
  let requested;
  globalThis.fetch = async (url) => {
    requested = new URL(String(url));
    return {
      status: 200,
      headers: { get: () => 'application/json' },
      text: async () => JSON.stringify({
        ok: true,
        action: 'LIST_CONTENT',
        contractVersion: 'DRYWRITE_FRONT_API_V1',
        data: [{ contentId: 'PUBLIC_ONLY' }],
        nextPageToken: 'NEXT_PAGE',
      }),
    };
  };
  try {
    const res = mockResponse();
    await handler({ method: 'GET', query: { action: 'LIST_CONTENT', pageSize: '100', pageToken: 'CURSOR_ONE' } }, res);
    assert.equal(res.code, 200);
    assert.equal(requested.searchParams.get('pageToken'), 'CURSOR_ONE');
    assert.equal(requested.searchParams.get('pageSize'), '100');
    assert.equal(requested.searchParams.get('action'), 'LIST_CONTENT');
    assert.equal(JSON.parse(res.body).nextPageToken, 'NEXT_PAGE');
    assert.equal(res.headers['Cache-Control'], 'no-store');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('LIST_CONTENT rejects malformed and oversized cursors before upstream', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; throw new Error('should not fetch'); };
  try {
    for (const pageToken of ['', ['ARRAY_CURSOR'], 'a'.repeat(4097)]) {
      const res = mockResponse();
      await handler({ method: 'GET', query: { action: 'LIST_CONTENT', pageToken } }, res);
      assert.equal(res.code, 400);
      assert.equal(res.body.error.code, 'INVALID_PAGE_TOKEN');
    }
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('SAVE_CONTENT cannot cross the public read-only proxy', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; throw new Error('should not fetch'); };
  try {
    const post = mockResponse();
    await handler({ method: 'POST', query: { action: 'SAVE_CONTENT' } }, post);
    assert.equal(post.code, 405);
    assert.equal(post.body.error.code, 'METHOD_NOT_ALLOWED');

    const get = mockResponse();
    await handler({ method: 'GET', query: { action: 'SAVE_CONTENT' } }, get);
    assert.equal(get.code, 400);
    assert.equal(get.body.error.code, 'ACTION_NOT_ALLOWED');
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('GET_CONTENT sends only the requested contentId, not a list cursor', async () => {
  const originalFetch = globalThis.fetch;
  let requested;
  globalThis.fetch = async (url) => {
    requested = new URL(String(url));
    return {
      status: 200,
      headers: { get: () => 'application/json' },
      text: async () => JSON.stringify({ ok: true, action: 'GET_CONTENT', data: { contentId: 'ALLOWED_ID' } }),
    };
  };
  try {
    const res = mockResponse();
    await handler({ method: 'GET', query: { action: 'GET_CONTENT', contentId: 'ALLOWED_ID', pageToken: 'INVALID' } }, res);
    assert.equal(res.code, 200);
    assert.equal(requested.searchParams.get('contentId'), 'ALLOWED_ID');
    assert.equal(requested.searchParams.has('pageToken'), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
