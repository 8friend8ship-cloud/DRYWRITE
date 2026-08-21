import type { ContentRecord } from '../types';

export interface AppsScriptClient {
  listContent(): Promise<ContentRecord[]>;
  getContent(contentId: string): Promise<ContentRecord | null>;
  saveContent(record: ContentRecord): Promise<ContentRecord>;
}

export interface AppsScriptClientConfig {
  webAppUrl: string;
}

export class BackendContractUnavailableError extends Error {
  constructor() {
    super('Apps Script endpoint and request contract are not configured.');
    this.name = 'BackendContractUnavailableError';
  }
}

// Implement this factory only after the Apps Script request/response contract is approved.
// No endpoint, function name, Sheet ID, or browser-side secret is guessed here.
export function createAppsScriptClient(config: AppsScriptClientConfig): AppsScriptClient {
  void config;
  throw new BackendContractUnavailableError();
}
