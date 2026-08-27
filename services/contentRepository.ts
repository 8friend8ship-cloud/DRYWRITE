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
  constructor(private readonly failureReason = 'Backend contract has not returned a verified response.') {}

  async listContent(): Promise<ContentListResult> {
    const cached = readContentCache();
    if (cached?.length) {
      return {
        records: cached,
        source: 'cache',
        integrationStatus: 'BACKEND_ERROR_FALLBACK',
        failureReason: this.failureReason,
      };
    }
    writeContentCache(sampleContent);
    return {
      records: sampleContent,
      source: 'sample',
      integrationStatus: 'BACKEND_ERROR_FALLBACK',
      failureReason: this.failureReason,
    };
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

class ResilientContentRepository implements ContentRepository {
  constructor(
    private readonly primary: ContentRepository,
    private readonly fallbackFactory: (reason: string) => ContentRepository,
  ) {}

  async listContent(): Promise<ContentListResult> {
    try {
      return await this.primary.listContent();
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown Apps Script error';
      return this.fallbackFactory(reason).listContent();
    }
  }

  async getContent(contentId: string): Promise<ContentRecord | null> {
    try {
      return await this.primary.getContent(contentId);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown Apps Script error';
      return this.fallbackFactory(reason).getContent(contentId);
    }
  }

  saveContent(record: ContentRecord): Promise<ContentRecord> {
    return this.primary.saveContent(record);
  }
}

export const DRYWRITE_WEB_APP_URL =
  import.meta.env.VITE_DRYWRITE_WEB_APP_URL ||
  'https://script.google.com/macros/s/AKfycbxNPNmtCEeIjLJuUnfp-sTdEgQOzUUA_2cMkyqCzhaUJcRvYwppBgtSuPjbezWCn2zKrw/exec';

export const contentRepository: ContentRepository = new ResilientContentRepository(
  new AppsScriptContentRepository(createAppsScriptClient({ webAppUrl: DRYWRITE_WEB_APP_URL })),
  (reason) => new SampleContentRepository(reason),
);
