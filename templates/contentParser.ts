import type { ContentBlock } from '../types';

export function parseContent(rawText: string): ContentBlock[] {
  return rawText
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith('### ')) return { type: 'h3', content: block.slice(4) };
      if (block.startsWith('## ')) return { type: 'h2', content: block.slice(3) };
      if (block.startsWith('# ')) return { type: 'h1', content: block.slice(2) };
      if (block.startsWith('---')) return { type: 'hr', content: '' };
      if (block.startsWith('**')) return { type: 'meta', content: block.replace(/\*\*/g, '') };
      return { type: 'p', content: block };
    });
}
