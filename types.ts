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
  /** Backend-selected persona. DRYWRITE renders it; the browser does not invent one. */
  personaId?: string;
  /** Row/id from the canonical persona T1 template registry. */
  personaTemplateId?: string;
  /** Canonical writing form selected after Queens/Seed analysis. */
  formId?: string;
  /** Seed lineage used to select the form/persona behavior. */
  writingSeedId?: string;
  /** Learning-language pack pointer; heavy translated content remains backend/local-pack owned. */
  learningLanguagePackId?: string;
  /** Voice-language pack pointer; actual device voice is resolved locally at runtime. */
  voicePackId?: string;
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
  integrationStatus: 'CONNECTED' | 'WAITING_BACKEND_CONTRACT' | 'BACKEND_ERROR_FALLBACK';
  failureReason?: string;
}
