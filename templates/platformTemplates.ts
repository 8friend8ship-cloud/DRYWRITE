export interface PlatformTemplateDefinition {
  templateId: string;
  label: string;
  description: string;
  showCover: boolean;
  showSummary: boolean;
  showTags: boolean;
}

export const platformTemplates: Record<string, PlatformTemplateDefinition> = {
  'article-editorial-v1': {
    templateId: 'article-editorial-v1',
    label: 'Editorial Article',
    description: 'Long-form article with cover, metadata, headings and readable content sections.',
    showCover: true,
    showSummary: true,
    showTags: true,
  },
};
