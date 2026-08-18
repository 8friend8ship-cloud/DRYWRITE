export type WorkflowStatus =
  | 'TEMPLATE_1_READY'
  | 'CHATGPT_T1_REVIEW_REQUIRED'
  | 'TEMPLATE_2_READY'
  | 'CHATGPT_FINAL_READY';

export interface WorkflowPackage {
  contentId: string;
  appId: 'DRYWRITER';
  createdAt: string;
  sourceText: string;
  template1: {
    topic: string;
    paragraphs: string[];
    keywords: string[];
    persona: string;
    reviewQuestions: string[];
  };
  chatgptT1ReviewRequired: true;
  template2: {
    outline: string[];
    factsToVerify: string[];
    styleRules: string[];
  };
  status: WorkflowStatus;
}

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

export function deriveTitle(rawText: string): string {
  const heading = rawText.split('\n').find(line => line.trim().startsWith('# '));
  if (heading) return normalize(heading.replace(/^#\s+/, '')).slice(0, 80);
  const first = rawText.split(/\n+/).map(normalize).find(Boolean) || '새 글';
  return first.slice(0, 80);
}

function extractKeywords(rawText: string): string[] {
  const words = normalize(rawText)
    .replace(/[^0-9A-Za-z가-힣\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 2);
  const counts = new Map<string, number>();
  words.forEach(word => counts.set(word, (counts.get(word) || 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);
}

export function buildWorkflowPackage(rawText: string): WorkflowPackage {
  const paragraphs = rawText
    .split(/\n\s*\n/)
    .map(normalize)
    .filter(Boolean)
    .slice(0, 24);
  const topic = deriveTitle(rawText);
  const keywords = extractKeywords(rawText);
  return {
    contentId: `DRY-${Date.now()}`,
    appId: 'DRYWRITER',
    createdAt: new Date().toISOString(),
    sourceText: rawText,
    template1: {
      topic,
      paragraphs,
      keywords,
      persona: 'DRYWRITER_PERSONA_LIBRARY_SELECT',
      reviewQuestions: [
        '이 글에 가장 맞는 기존 페르소나는 무엇인가?',
        '갈등·상황·대화가 실제 사람처럼 이어지는가?',
        '과장·AI 티·중복 설명을 제거해야 하는 부분은 어디인가?'
      ]
    },
    chatgptT1ReviewRequired: true,
    template2: {
      outline: paragraphs.map((p, index) => `${index + 1}. ${p.slice(0, 90)}`),
      factsToVerify: ['사실 주장', '수치/날짜', '고유명사', '출처가 필요한 문장'],
      styleRules: ['짧은 문장', '과장 금지', '설교/훈계 금지', '페르소나 일관성', '최종 자연어 요리는 ChatGPT']
    },
    status: 'CHATGPT_T1_REVIEW_REQUIRED'
  };
}

export function saveWorkflowPackage(pkg: WorkflowPackage): void {
  const key = 'drywriter_workflow_queue';
  const previous = JSON.parse(localStorage.getItem(key) || '[]');
  localStorage.setItem(key, JSON.stringify([pkg, ...previous].slice(0, 50)));
}
