import type { ContentRecord } from '../types';

const CACHE_KEY = 'drywriter_content_cache_v1';

export function readContentCache(): ContentRecord[] | null {
  try {
    const value = localStorage.getItem(CACHE_KEY);
    return value ? JSON.parse(value) as ContentRecord[] : null;
  } catch {
    return null;
  }
}

export function writeContentCache(records: ContentRecord[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(records));
  } catch {
    // Cache failure must not block rendering server or sample data.
  }
}
