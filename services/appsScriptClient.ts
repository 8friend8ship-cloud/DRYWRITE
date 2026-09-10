import type { ContentRecord } from '../types';

export interface AppsScriptClient {
  listContent(): Promise<ContentRecord[]>;
  getContent(contentId: string): Promise<ContentRecord | null>;
  saveContent(record: ContentRecord): Promise<ContentRecord>;
}

export interface AppsScriptClientConfig {
  webAppUrl: string;
}

interface FrontApiErrorEnvelope {
  code?: string;
  message?: string;
  retryable?: boolean;
}

interface FrontApiEnvelope<T> {
  ok: boolean;
  action?: string;
  requestId?: string;
  data?: T;
  nextPageToken?: string | null;
  contractVersion?: string;
  serverTime?: string;
  error?: FrontApiErrorEnvelope;
}

interface SaveContentResult {
  record: ContentRecord;
  resultId?: string;
  auditId?: string;
  evidenceId?: string;
}

const EXPECTED_CONTRACT_VERSION = 'DRYWRITE_FRONT_API_V1';

export class BackendContractUnavailableError extends Error {
  constructor(message = 'Apps Script endpoint and request contract are not configured.') {
    super(message);
    this.name = 'BackendContractUnavailableError';
  }
}

export class BackendContractError extends Error {
  readonly code: string;
  readonly retryable: boolean;

  constructor(code: string, message: string, retryable = false) {
    super(message);
    this.name = 'BackendContractError';
    this.code = code;
    this.retryable = retryable;
  }
}

function normalizeWebAppUrl(value: string): string {
  const text = String(value || '').trim();
  if (!text) throw new BackendContractUnavailableError();

  let parsed: URL;
  try {
    parsed = new URL(text);
  } catch {
    throw new BackendContractUnavailableError('Apps Script endpoint URL is invalid.');
  }

  if (parsed.protocol !== 'https:') {
    throw new BackendContractUnavailableError('Apps Script endpoint must use HTTPS.');
  }
  return parsed.toString();
}

function assertEnvelope<T>(payload: unknown): FrontApiEnvelope<T> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new BackendContractError('INVALID_RESPONSE', 'Apps Script returned an invalid JSON envelope.', true);
  }

  const envelope = payload as FrontApiEnvelope<T>;
  if (envelope.contractVersion && envelope.contractVersion !== EXPECTED_CONTRACT_VERSION) {
    throw new BackendContractError(
      'CONTRACT_VERSION_MISMATCH',
      `Expected ${EXPECTED_CONTRACT_VERSION} but received ${envelope.contractVersion}.`,
      false,
    );
  }

  if (!envelope.ok) {
    throw new BackendContractError(
      envelope.error?.code || 'BACKEND_ERROR',
      envelope.error?.message || 'Apps Script could not complete the request.',
      Boolean(envelope.error?.retryable),
    );
  }
  return envelope;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<FrontApiEnvelope<T>> {
  let response: Response;
  try {
    response = await fetch(url, {
      redirect: 'follow',
      ...init,
    });
  } catch {
    throw new BackendContractError('NETWORK_ERROR', 'Apps Script endpoint could not be reached.', true);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new BackendContractError('INVALID_RESPONSE', 'Apps Script response was not valid JSON.', true);
  }

  // Apps Script ContentService responses may use a successful HTTP status even when
  // the application envelope reports an error, so the JSON contract is authoritative.
  if (!response.ok) {
    const envelope = payload as FrontApiEnvelope<T>;
    throw new BackendContractError(
      envelope?.error?.code || `HTTP_${response.status}`,
      envelope?.error?.message || `Apps Script request failed with HTTP ${response.status}.`,
      response.status >= 500,
    );
  }

  return assertEnvelope<T>(payload);
}

// Exact contract: WRITE PR#2 apps-script/DryWriterFrontReadApi.gs.
// Public reads use LIST_CONTENT / GET_CONTENT. SAVE_CONTENT remains backend-authorized.
export function createAppsScriptClient(config: AppsScriptClientConfig): AppsScriptClient {
  const webAppUrl = normalizeWebAppUrl(config.webAppUrl);

  const getUrl = (action: string, extra?: Record<string, string>) => {
    const url = new URL(webAppUrl);
    url.searchParams.set('action', action);
    Object.entries(extra || {}).forEach(([key, value]) => url.searchParams.set(key, value));
    return url.toString();
  };

  return {
    async listContent() {
      const envelope = await requestJson<ContentRecord[]>(getUrl('LIST_CONTENT', { pageSize: '100' }));
      return Array.isArray(envelope.data) ? envelope.data : [];
    },

    async getContent(contentId: string) {
      const id = String(contentId || '').trim();
      if (!id) return null;
      try {
        const envelope = await requestJson<ContentRecord>(getUrl('GET_CONTENT', { contentId: id }));
        return envelope.data || null;
      } catch (error) {
        if (error instanceof BackendContractError && error.code === 'NOT_FOUND') return null;
        throw error;
      }
    },

    async saveContent(record: ContentRecord) {
      const envelope = await requestJson<SaveContentResult>(webAppUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'SAVE_CONTENT',
          record: {
            ...record,
            expectedUpdatedAt: record.updatedAt,
          },
        }),
      });
      if (!envelope.data?.record) {
        throw new BackendContractError('INVALID_RESPONSE', 'SAVE_CONTENT returned no content record.', true);
      }
      return envelope.data.record;
    },
  };
}
