
export type ContentBlockType = 'h1' | 'h2' | 'h3' | 'p' | 'hr' | 'meta';

export interface ContentBlock {
  type: ContentBlockType;
  content: string;
}

export interface Article {
  id: string;
  date: string;
  title: string;
  coverImageUrl: string;
  rawText: string;
}
