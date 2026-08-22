type LocalChat = {
  source: string;
  sendMessage: (args: { message: string }) => Promise<{ text: string }>;
};

const normalize = (text: string) => String(text || '').replace(/\s+/g, ' ').trim();
const sentences = (text: string) => normalize(text).split(/(?<=[.!?。！？])\s+/).filter(Boolean);

function localTitle(content: string): string {
  const firstHeading = String(content || '').split('\n').find(line => /^#{1,3}\s+/.test(line.trim()));
  if (firstHeading) return firstHeading.replace(/^#{1,3}\s+/, '').trim().slice(0, 70);
  const first = sentences(content)[0] || '건조한작가 기록';
  return first.replace(/["'“”‘’]/g, '').split(' ').filter(Boolean).slice(0, 10).join(' ').slice(0, 70) || '건조한작가 기록';
}

export async function testApiKey(_apiKey: string): Promise<boolean> {
  return true;
}

export async function generateTitle(content: string): Promise<string> {
  return localTitle(content);
}

export async function generateCoverImage(title: string, content: string): Promise<string> {
  const safeTitle = String(title || localTitle(content)).slice(0, 40)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200"><rect width="900" height="1200" fill="#f4f0e8"/><rect x="70" y="70" width="760" height="1060" rx="36" fill="#fffdf7" stroke="#222" stroke-width="4"/><path d="M120 300H780M120 860H780" stroke="#222" stroke-width="3"/><text x="120" y="420" font-family="sans-serif" font-size="54" font-weight="700" fill="#161616">${safeTitle}</text><text x="120" y="940" font-family="sans-serif" font-size="28" fill="#555">DRY WRITER · T2 LOCAL COVER</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function createChat(bookContent: string): LocalChat {
  const source = String(bookContent || '');
  return {
    source,
    async sendMessage({ message }) {
      const queryTerms = normalize(message).toLowerCase().split(/\s+/).filter(term => term.length >= 2);
      const blocks = source.split(/\n\s*\n/).filter(Boolean);
      const ranked = blocks
        .map(block => ({ block, score: queryTerms.reduce((n, term) => n + (block.toLowerCase().includes(term) ? 1 : 0), 0) }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      if (!ranked.length) return { text: '제공된 글 안에서 해당 내용을 찾지 못했습니다.' };
      return { text: ranked.map(item => item.block.trim()).join('\n\n').slice(0, 1800) };
    }
  };
}

export async function sendMessage(chat: LocalChat, message: string): Promise<{ text: string }> {
  return chat.sendMessage({ message });
}
