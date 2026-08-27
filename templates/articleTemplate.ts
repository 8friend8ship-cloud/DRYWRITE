import type { ContentRecord, RenderedArticle } from '../types';
import { parseContent } from './contentParser';

export function renderArticle(record: ContentRecord): RenderedArticle {
  return {
    id: record.contentId,
    title: record.title,
    summary: record.summary,
    category: record.category,
    tags: record.tags,
    coverImageUrl: record.coverImageUrl,
    date: record.createdAt.slice(0, 10),
    content: parseContent(record.rawText),
    source: record,
  };
}
