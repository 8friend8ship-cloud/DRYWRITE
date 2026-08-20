import type { Article } from '../types';

const DEFAULT_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxNPNmtCEeIjLJuUnfp-sTdEgQOzUUA_2cMkyqCzhaUJcRvYwppBgtSuPjbezWCn2zKrw/exec';
const STORAGE_KEY = 'drywriter_articles';

type ApiRecord = {
  contentId: string;
  title: string;
  rawText: string;
  coverImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ApiEnvelope = {
  ok: boolean;
  action: string;
  data?: ApiRecord[];
  error?: { code?: string; message?: string };
};

function webAppUrl(): string {
  const configured = String(import.meta.env.VITE_DRYWRITER_WEBAPP_URL || '').trim();
  return configured || DEFAULT_WEBAPP_URL;
}

function toArticle(record: ApiRecord): Article {
  const dateSource = record.updatedAt || record.createdAt || new Date().toISOString();
  return {
    id: record.contentId,
    date: dateSource.slice(0, 10),
    title: record.title || '제목 없음',
    coverImageUrl: record.coverImageUrl || '',
    rawText: record.rawText || '',
  };
}

export async function loadPublishedDryWriterArticles(): Promise<Article[]> {
  const url = new URL(webAppUrl());
  url.searchParams.set('action', 'LIST_CONTENT');
  url.searchParams.set('pageSize', '50');

  const response = await fetch(url.toString(), {
    method: 'GET',
    redirect: 'follow',
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`DRYWRITER_API_HTTP_${response.status}`);

  const envelope = (await response.json()) as ApiEnvelope;
  if (!envelope.ok || !Array.isArray(envelope.data)) {
    throw new Error(envelope.error?.code || 'DRYWRITER_API_INVALID_RESPONSE');
  }
  return envelope.data.map(toArticle);
}

export async function hydrateDryWriterLocalCache(): Promise<void> {
  try {
    const remote = await loadPublishedDryWriterArticles();
    if (!remote.length) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
  } catch (error) {
    console.warn('DryWriter remote content unavailable; using local fallback.', error);
  }
}
