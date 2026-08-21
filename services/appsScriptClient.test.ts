import { strict as assert } from 'node:assert';
import { AppsScriptContractError, createAppsScriptClient } from './appsScriptClient.ts';

const url = 'https://script.google.com/macros/s/TEST_DEPLOYMENT/exec';
const client = createAppsScriptClient({ webAppUrl: url });
const originalFetch = globalThis.fetch;

try {
  globalThis.fetch = async (input) => {
    const requested = new URL(String(input));
    assert.equal(requested.searchParams.get('action'), 'LIST_CONTENT');
    return new Response(JSON.stringify({
      ok: true,
      action: 'LIST_CONTENT',
      requestId: 'REQ_TEST',
      data: [],
      contractVersion: 'DRYWRITE_FRONT_API_V1',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  assert.deepEqual(await client.listContent(), []);

  globalThis.fetch = async () => new Response(JSON.stringify({
    ok: false,
    action: 'LIST_CONTENT',
    requestId: 'REQ_TEST_ERROR',
    error: { code: 'SERVER_CONFIG_MISSING', message: 'Writer spreadsheet is not configured.', retryable: false },
    contractVersion: 'DRYWRITE_FRONT_API_V1',
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  await assert.rejects(
    () => client.listContent(),
    (error: unknown) => error instanceof AppsScriptContractError && error.code === 'SERVER_CONFIG_MISSING',
  );
} finally {
  globalThis.fetch = originalFetch;
}

assert.throws(
  () => createAppsScriptClient({ webAppUrl: 'https://example.com/exec' }),
  /Approved Apps Script Web App URL is required/,
);
