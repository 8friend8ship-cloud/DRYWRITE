import { sampleContent } from '../data/sampleContent';
import { createAppsScriptClient, type AppsScriptClient } from './appsScriptClient';
import { readContentCache, writeContentCache } from './contentCache';
import type { ContentListResult, ContentRecord } from '../types';

export interface ContentRepository {
  listContent(): Promise<ContentListResult>;
  getContent(contentId: string): Promise<ContentRecord | null>;
  saveContent(record: ContentRecord): Promise<ContentRecord>;
}

export class SampleContentRepository implements ContentRepository {
  async listContent(): Promise<ContentListResult> {
    const cached = readContentCache();
    if (cached?.length) {
      return { records: cached, source: 'cache', integrationStatus: 'WAITING_BACKEND_CONTRACT' };
    }
    writeContentCache(sampleContent);
    return { records: sampleContent, source: 'sample', integrationStatus: 'WAITING_BACKEND_CONTRACT' };
  }

  async getContent(contentId: string): Promise<ContentRecord | null> {
    const result = await this.listContent();
    return result.records.find((record) => record.contentId === contentId) ?? null;
  }

  async saveContent(): Promise<ContentRecord> {
    throw new Error('Admin writes require an authorized Apps Script backend.');
  }
}

export class AppsScriptContentRepository implements ContentRepository {
  constructor(private readonly client: AppsScriptClient) {}

  async listContent(): Promise<ContentListResult> {
    const records = await this.client.listContent();
    writeContentCache(records);
    return { records, source: 'server', integrationStatus: 'CONNECTED' };
  }

  getContent(contentId: string): Promise<ContentRecord | null> {
    return this.client.getContent(contentId);
  }

  saveContent(record: ContentRecord): Promise<ContentRecord> {
    return this.client.saveContent(record);
  }
}

function configuredAppsScriptUrl(): string {
  const meta = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
  return String(meta.env?.VITE_DRYWRITE_APPS_SCRIPT_URL || '').trim();
}

function createContentRepository(): ContentRepository {
  const webAppUrl = configuredAppsScriptUrl();
  if (!webAppUrl) return new SampleContentRepository();
  return new AppsScriptContentRepository(createAppsScriptClient({ webAppUrl }));
}

// The frontend never invents a backend endpoint. A preview/production environment must
// explicitly provide VITE_DRYWRITE_APPS_SCRIPT_URL after the corresponding Apps Script
// DRYWRITE_FRONT_API_V1 contract has been installed and runtime-verified.
export const contentRepository: ContentRepository = createContentRepository();
