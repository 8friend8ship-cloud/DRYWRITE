import type { ContentRecord } from '../types';

export interface AppsScriptClient {
  listContent(): Promise<ContentRecord[]>;
  getContent(contentId: string): Promise<ContentRecord | null>;
  saveContent(record: ContentRecord): Promise<ContentRecord>;
}

export interface AppsScriptClientConfig {
  webAppUrl: string;
}

interface AppsScriptEnvelope<T> {
  ok: boolean;
  action: string;
  requestId: string;
  data?: T;
  error?: { code?: string; message?: string; retryable?: boolean };
  contractVersion?: string;
}

export class AppsScriptContractError extends Error {
  constructor(
    message: string,
    readonly code = 'APPS_SCRIPT_CONTRACT_ERROR',
    readonly retryable = false,
  ) {
    super(message);
    this.name = 'AppsScriptContractError';
  }
}

function validateWebAppUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'script.google.com' || !url.pathname.endsWith('/exec')) {
    throw new AppsScriptContractError('Approved Apps Script Web App URL is required.', 'WEB_APP_URL_INVALID');
  }
  return url.toString();
}

async function readEnvelope<T>(response: Response, expectedAction: string): Promise<T> {
  if (!response.ok) {
    throw new AppsScriptContractError(`Apps Script HTTP ${response.status}`, 'HTTP_ERROR', response.status >= 500);
  }
  let envelope: AppsScriptEnvelope<T>;
  try {
    envelope = await response.json() as AppsScriptEnvelope<T>;
  } catch {
    throw new AppsScriptContractError('Apps Script returned non-JSON content.', 'MALFORMED_RESPONSE', true);
  }
  if (!envelope || envelope.action !== expectedAction || envelope.contractVersion !== 'DRYWRITE_FRONT_API_V1') {
    throw new AppsScriptContractError('Apps Script response contract does not match DRYWRITE_FRONT_API_V1.', 'CONTRACT_MISMATCH');
  }
  if (!envelope.ok) {
    throw new AppsScriptContractError(
      envelope.error?.message || 'Apps Script request failed.',
      envelope.error?.code || 'REMOTE_ERROR',
      Boolean(envelope.error?.retryable),
    );
  }
  return envelope.data as T;
}

export function createAppsScriptClient(config: AppsScriptClientConfig): AppsScriptClient {
  const webAppUrl = validateWebAppUrl(config.webAppUrl);

  const get = async <T>(action: string, params: Record<string, string> = {}): Promise<T> => {
    const url = new URL(webAppUrl);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    const response = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    return readEnvelope<T>(response, action);
  };

  return {
    listContent: () => get<ContentRecord[]>('LIST_CONTENT', { pageSize: '50' }),
    getContent: async (contentId: string) => {
      try {
        return await get<ContentRecord>('GET_CONTENT', { contentId });
      } catch (error) {
        if (error instanceof AppsScriptContractError && error.code === 'NOT_FOUND') return null;
        throw error;
      }
    },
    saveContent: async (record: ContentRecord) => {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        redirect: 'follow',
        cache: 'no-store',
        headers: { 'Content-Type': 'text/plain;charset=utf-8', Accept: 'application/json' },
        body: JSON.stringify({ action: 'SAVE_CONTENT', record: { ...record, expectedUpdatedAt: record.updatedAt } }),
      });
      const result = await readEnvelope<{ record: ContentRecord }>(response, 'SAVE_CONTENT');
      return result.record;
    },
  };
}
