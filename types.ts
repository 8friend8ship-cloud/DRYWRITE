export type ContentStatus = 'DRAFT' | 'PROCESSED' | 'READY' | 'ARCHIVED';

export interface ContentRecord {
  contentId: string;
  title: string;
  rawText: string;
  summary: string;
  category: string;
  tags: string[];
  coverImageUrl: string;
  coverPrompt: string;
  sourceId: string;
  templateId: string;
  status: ContentStatus;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export type ContentBlockType = 'h1' | 'h2' | 'h3' | 'p' | 'hr' | 'meta';

export interface ContentBlock {
  type: ContentBlockType;
  content: string;
}

export interface RenderedArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  coverImageUrl: string;
  date: string;
  content: ContentBlock[];
  source: ContentRecord;
}

export interface ContentListResult {
  records: ContentRecord[];
  source: 'server' | 'cache' | 'sample';
  integrationStatus: 'CONNECTED' | 'WAITING_BACKEND_CONTRACT';
}
