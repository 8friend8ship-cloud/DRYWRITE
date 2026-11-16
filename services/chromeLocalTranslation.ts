import type { ContentBlock } from '../types';

export type LocalArticleTranslation = {
  title: string;
  blocks: ContentBlock[];
  language: string;
  status: 'ON_DEVICE_TRANSLATED';
};

type TranslatorInstance = {
  translate: (text: string) => Promise<string>;
  destroy?: () => void;
};
type TranslatorAPI = {
  availability: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<string>;
  create: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<TranslatorInstance>;
};

function getBrowserTranslator(): TranslatorAPI | null {
  const scoped = globalThis as typeof globalThis & { Translator?: TranslatorAPI };
  const api = scoped.Translator;
  return api && typeof api.availability === 'function' && typeof api.create === 'function' ? api : null;
}

function canonicalLanguage(input: string): string {
  const code = String(input || '').trim().replaceAll('_', '-');
  if (!/^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/.test(code)) throw new Error('INVALID_LANGUAGE_TAG');
  try { return Intl.getCanonicalLocales(code)[0]; }
  catch { throw new Error('INVALID_LANGUAGE_TAG'); }
}

/**
 * Only allowed on direct user action for public, already approved articles.
 * Chrome Translator availability is on-device, but may download model packs.
 * Never treat fallback Chrome page translation as an API callable from JS.
 */
export async function translatePublicArticleOnDevice(input: {
  title: string;
  blocks: ContentBlock[];
  sourceLanguage: string;
  targetLanguage: string;
  approvedPublicSource: boolean;
}): Promise<LocalArticleTranslation> {
  if (!input.approvedPublicSource) throw new Error('PUBLIC_APPROVAL_REQUIRED');
  const sourceLanguage = canonicalLanguage(input.sourceLanguage);
  const targetLanguage = canonicalLanguage(input.targetLanguage);
  if (sourceLanguage === targetLanguage) throw new Error('SAME_LANGUAGE');
  if (!input.title || input.blocks.length > 240 ||
      [input.title, ...input.blocks.map(block => block.content)].join('').length > 60000)
    throw new Error('TRANSLATION_LIMIT_REVIEW');
  const browser = getBrowserTranslator();
  if (!browser) throw new Error('CHROME_TRANSLATOR_UNAVAILABLE');
  const options = {
    sourceLanguage: sourceLanguage.split('-')[0],
    targetLanguage: targetLanguage.split('-')[0],
  };
  const availability = await browser.availability(options);
  if (availability === 'unavailable') throw new Error('LANGUAGE_PAIR_UNAVAILABLE');
  if (!['available','downloadable','downloading'].includes(availability))
    throw new Error('TRANSLATION_AVAILABILITY_UNKNOWN');
  // No automatic creation or model download at page load. Called by translation button only.
  let translator: TranslatorInstance | undefined;
  try {
    translator = await browser.create(options);
    const title = await translator.translate(input.title);
    const blocks: ContentBlock[] = [];
    for (const block of input.blocks) {
      if (block.type === 'hr' || !block.content.trim()) {
        blocks.push(block);
      } else {
        blocks.push({ ...block, content: await translator.translate(block.content) });
      }
    }
    return { title, blocks, language: targetLanguage, status: 'ON_DEVICE_TRANSLATED' };
  } finally {
    translator?.destroy?.();
  }
}

export const GOOGLE_CHROME_TRANSLATE_HELP =
  'https://support.google.com/chrome/answer/173424?hl=ko';
