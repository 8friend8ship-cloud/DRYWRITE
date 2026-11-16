/**
 * GOODWAY WRITE global speech metadata contract v1.
 * Pure functions only: no microphone, model calls, remote requests, audio data,
 * credentials, note text, transcript or public publishing.
 * A browser-generated JSON is NEVER an authorization or provider ACK.
 */
export const GOODWAY_VOICE_CONTRACT_VERSION = 'GOODWAY_GLOBAL_VOICE_JSON_MCP_V1_20261116';

export const LOCALES = Object.freeze([
  { code: 'ko-KR', label: '한국어' }, { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' }, { code: 'ja-JP', label: '日本語' },
  { code: 'zh-CN', label: '简体中文' }, { code: 'zh-TW', label: '繁體中文' },
  { code: 'es-ES', label: 'Español' }, { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' }, { code: 'pt-BR', label: 'Português' },
  { code: 'vi-VN', label: 'Tiếng Việt' }, { code: 'id-ID', label: 'Bahasa Indonesia' },
  { code: 'th-TH', label: 'ไทย' }, { code: 'hi-IN', label: 'हिन्दी' },
  { code: 'ar-SA', label: 'العربية' }, { code: 'ru-RU', label: 'Русский' }
]);

const DEFAULT_LOCALES = Object.freeze(Object.fromEntries(LOCALES.map(locale => [
  locale.code.split('-')[0].toLowerCase(), locale.code,
])));

export function normalizeSpeechLocale(language) {
  const input = String(language || '').trim().replaceAll('_', '-');
  if (!/^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/.test(input)) return 'und';
  const primary = input.split('-')[0].toLowerCase();
  const matching = LOCALES.find(item => item.code.toLowerCase() === input.toLowerCase());
  if (matching) return matching.code;
  if (input.includes('-')) {
    try { return Intl.getCanonicalLocales(input)[0] || 'und'; }
    catch { return 'und'; }
  }
  if (DEFAULT_LOCALES[primary]) return DEFAULT_LOCALES[primary];
  try { return Intl.getCanonicalLocales(input)[0] || 'und'; }
  catch { return 'und'; }
}

export function sameSpeechLanguage(a, b) {
  const left = normalizeSpeechLocale(a);
  const right = normalizeSpeechLocale(b);
  return left !== 'und' && right !== 'und' && left.split('-')[0] === right.split('-')[0];
}

export function speechChunks(text, maxChars = 230) {
  const input = String(text || '').replace(/\s+/g, ' ').trim();
  if (!input) return [];
  if (!Number.isInteger(maxChars) || maxChars < 80 || maxChars > 450) throw new Error('CHUNK_LIMIT_INVALID');
  const chunks = [];
  let remaining = input;
  while (remaining.length) {
    if (remaining.length <= maxChars) {
      chunks.push(remaining);
      break;
    }
    const fragment = remaining.slice(0, maxChars + 1);
    const search = fragment.slice(Math.floor(maxChars * .55), maxChars);
    const boundary = Math.max(search.lastIndexOf('. '), search.lastIndexOf('! '),
      search.lastIndexOf('? '), search.lastIndexOf('。'), search.lastIndexOf(' '));
    const at = boundary < 0 ? maxChars : Math.floor(maxChars * .55) + boundary + 1;
    const piece = remaining.slice(0, at).trim();
    if (!piece) throw new Error('CHUNK_EMPTY_INTERNAL');
    chunks.push(piece);
    remaining = remaining.slice(at).trim();
    if (chunks.length > 5000) throw new Error('CHUNK_COUNT_EXCESS');
  }
  return chunks;
}

export function makeGlobalVoiceRequest(input) {
  const basic = {
    schemaVersion: GOODWAY_VOICE_CONTRACT_VERSION,
    appId: 'APP_DRYWRITE',
    purposeDirectiveId: 'GOODWHY_SION_RIGHT_RELATIONSHIP_PURPOSE_V1_20261116',
    action: 'VOICE_PACK_PREPARE',
    execution: 'MANUAL_ONLY',
    publishedAudio: false,
    microphoneEnabled: false,
    transmittedArticleText: false,
    attachedAudioBytes: 0,
    providerAck: 'NOT_OBTAINED',
    creatorVoiceRights: 'NOT_INFERRED',
    mcpAdapterStatus: 'NOT_WIRED',
  };
  const blocked = (reason) => ({ ...basic, status: reason, serverMustRevalidate: true });
  const contentId = String(input?.contentId || '');
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(contentId)) return blocked('HOLD_INVALID_PUBLIC_CONTENT_ID');
  if (input?.source !== 'PUBLIC_SERVER_READ') return blocked('HOLD_APPROVED_PUBLIC_SOURCE_REQUIRED');
  const locale = normalizeSpeechLocale(input?.language);
  const requestedLocale = normalizeSpeechLocale(input?.requestedLanguage);
  if (!sameSpeechLanguage(locale, requestedLocale)) return blocked('HOLD_TRANSLATED_ARTICLE_REQUIRED');
  if (input?.provider !== 'BROWSER_WEBSPEECH') {
    return blocked(input?.provider === 'SION_LOCAL_VOICE'
      ? 'HOLD_SION_LOCAL_LICENSED_SERVICE_AND_CONSENT'
      : input?.provider === 'GEMINI_LIVE' ? 'HOLD_GEMINI_LIVE_AUTH_TIER_AND_EPHEMERAL_TOKEN'
        : 'HOLD_UNSUPPORTED_VOICE_PROVIDER');
  }
  const voiceName = String(input?.voiceName || '').trim();
  if (!voiceName || voiceName.length > 100 || /[<>{}\r\n]/.test(voiceName))
    return blocked('HOLD_DEVICE_VOICE_NOT_SELECTED');
  const revision = String(input?.sourceRevision || '').trim();
  if (!/^[A-Za-z0-9:._+-]{1,90}$/.test(revision)) return blocked('HOLD_SOURCE_REVISION_REQUIRED');
  return {
    ...basic,
    contentId,
    sourceRevision: revision,
    sourceLanguage: locale,
    requestedLanguage: requestedLocale,
    provider: 'BROWSER_WEBSPEECH',
    voicePackId: 'DEVICE_VOICE_USER_SELECTED',
    voiceName,
    status: 'PREVIEW_ONLY_NOT_A_JOB',
    sourceTextAccess: 'CURRENT_PUBLIC_ARTICLE_BROWSER_MEMORY_ONLY',
    sourceTextStored: false,
    translationPerformed: false,
    serverMustRevalidate: true,
    requestId: ['VOICE_PREVIEW',contentId,revision,requestedLocale].join('_'),
    publishApproval: 'NOT_REQUESTED',
  };
}
