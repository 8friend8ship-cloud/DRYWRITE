import type { ContentRecord } from '../types';
import { checkDrywriterGate } from './drywriterGate.ts';

export interface DrywriterMvpInput {
  seed: {
    seedId: string;
    sourceLabel: string;
    coreQuestion: string;
    verifiedEvidence: string[];
    prohibitedInferences: string[];
  };
  t1: {
    title: string;
    problem: string;
    observations: string[];
    conclusionQuestion: string;
  };
  centralAgentReviewId: string;
}

export interface DrywriterAnimationHandoff {
  status: 'READY';
  voice: { language: 'ko-KR'; tone: 'DRY_NEUTRAL'; pace: 'MEDIUM' };
  scenes: Array<{ sceneId: string; beat: string; motion: 'SLOW_PUSH' | 'STATIC_HOLD' | 'TEXT_REVEAL'; assetRole: string }>;
}

export interface DrywriterMvpProof {
  status: 'APPROVED';
  personaId: 'DRYWRITER';
  packVersion: 'DRYWRITER-DRYWRITE-v0.1';
  seedId: string;
  t1TemplateId: 'DRYWRITE-T1-EDITORIAL-v0.1';
  t2TemplateId: 'DRYWRITE-T2-PACKAGE-v0.1';
  centralAgentReviewId: string;
  corrections: string[];
  unverifiedClaims: string[];
  record: ContentRecord;
  animationHandoff: DrywriterAnimationHandoff;
}

function required(value: string, code: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(code);
  return normalized;
}

export function buildDrywriterMvpT2(input: DrywriterMvpInput): DrywriterMvpProof {
  const seedId = required(input.seed.seedId, 'SEED_ID_REQUIRED');
  const reviewId = required(input.centralAgentReviewId, 'CENTRAL_AGENT_REVIEW_REQUIRED');
  const gate = checkDrywriterGate({
    personaId: 'DRYWRITER',
    seedId,
    templatePackVersion: 'DRYWRITER-DRYWRITE-v0.1',
    frontAppId: 'DRYWRITE',
    stage: 'T2',
    centralAgentReviewId: reviewId,
  });
  if (!gate.ok) throw new Error(gate.error || 'DRYWRITER_GATE_REQUIRED');

  const title = required(input.t1.title, 'T1_TITLE_REQUIRED');
  const observations = input.t1.observations.map((value) => value.trim()).filter(Boolean);
  const evidence = input.seed.verifiedEvidence.map((value) => value.trim()).filter(Boolean);
  if (observations.length < 3) throw new Error('T1_OBSERVATIONS_MIN_3');
  if (evidence.length === 0) throw new Error('VERIFIED_EVIDENCE_REQUIRED');

  const rawText = [
    `# ${title}`,
    '',
    '**건조한작가 | DRYWRITE | DRYWRITER-DRYWRITE-v0.1**',
    '',
    required(input.t1.problem, 'T1_PROBLEM_REQUIRED'),
    '',
    '## 관찰 1',
    observations[0],
    '',
    '## 관찰 2',
    observations[1],
    '',
    '## 관찰 3',
    observations[2],
    '',
    '## 확인된 근거',
    ...evidence.map((item) => `- ${item}`),
    '',
    '## 남는 질문',
    required(input.t1.conclusionQuestion, 'T1_CONCLUSION_QUESTION_REQUIRED'),
  ].join('\n');

  const record: ContentRecord = {
    contentId: 'MVP_DRYWRITE_T2_20260821_01',
    title: `[MVP T2] ${title}`,
    rawText,
    summary: 'Queens 자료를 하나의 질문으로 좁히고, 검증된 근거만 남긴 DRYWRITE 2차 패키지입니다.',
    category: 'MVP_TEST',
    tags: ['DRYWRITER', 'SEED', 'T1', 'T2'],
    coverImageUrl: '/covers/content-design.svg',
    coverPrompt: 'Dry editorial writing desk, evidence cards, neutral navy palette, no text.',
    sourceId: input.seed.sourceLabel,
    templateId: 'DRYWRITE-T2-PACKAGE-v0.1',
    personaId: 'DRYWRITER',
    personaTemplateId: 'DRYWRITE-T1-EDITORIAL-v0.1',
    formId: 'EDITORIAL_LONGFORM',
    writingSeedId: seedId,
    voicePackId: 'DRYWRITER-KO-NEUTRAL-v0.1',
    status: 'READY',
    language: 'ko',
    createdAt: '2026-08-21T00:00:00+09:00',
    updatedAt: '2026-08-21T00:00:00+09:00',
  };

  return {
    status: 'APPROVED',
    personaId: 'DRYWRITER',
    packVersion: 'DRYWRITER-DRYWRITE-v0.1',
    seedId,
    t1TemplateId: 'DRYWRITE-T1-EDITORIAL-v0.1',
    t2TemplateId: 'DRYWRITE-T2-PACKAGE-v0.1',
    centralAgentReviewId: reviewId,
    corrections: [
      '핵심 질문을 하나로 고정',
      '관찰을 세 단계로 분리',
      '검증된 근거와 미확인 추론을 분리',
    ],
    unverifiedClaims: [],
    record,
    animationHandoff: {
      status: 'READY',
      voice: { language: 'ko-KR', tone: 'DRY_NEUTRAL', pace: 'MEDIUM' },
      scenes: [
        { sceneId: 'SCENE_01', beat: input.seed.coreQuestion, motion: 'SLOW_PUSH', assetRole: 'PERSONA_FULLBODY' },
        { sceneId: 'SCENE_02', beat: observations[0], motion: 'TEXT_REVEAL', assetRole: 'EVIDENCE_CARDS' },
        { sceneId: 'SCENE_03', beat: input.t1.conclusionQuestion, motion: 'STATIC_HOLD', assetRole: 'QUESTION_CARD' },
      ],
    },
  };
}

export const DRYWRITER_MVP_INPUT: DrywriterMvpInput = {
  seed: {
    seedId: 'SEED_DRYWRITE_MVP_20260821_01',
    sourceLabel: 'QUEENS_TEST_COLLECTION_01',
    coreQuestion: '자료가 많아질수록 독자가 이해해야 할 질문은 무엇인가?',
    verifiedEvidence: [
      '테스트 입력은 Queens 수집 후보, Seed 규칙, DRYWRITE T1 구조를 사용한다.',
      'T2 생성 전 중앙 에이전트 검토 ID를 필수로 확인한다.',
    ],
    prohibitedInferences: ['출처 없는 수치', '확인되지 않은 인과관계'],
  },
  t1: {
    title: '정보가 많을수록, 하나의 질문이 필요하다',
    problem: '자료를 많이 모으는 일과 독자가 이해할 글을 만드는 일은 같지 않다.',
    observations: [
      '먼저 독자가 답을 얻어야 할 질문을 하나로 좁힌다.',
      'Queens 자료 가운데 그 질문을 확인하는 근거만 남긴다.',
      '나머지 자료는 버리지 않고 다음 Seed 후보로 분리한다.',
    ],
    conclusionQuestion: '이 글에서 독자가 끝까지 가져가야 할 한 문장은 무엇인가?',
  },
  centralAgentReviewId: 'CENTRAL_REVIEW_DRYWRITE_MVP_20260821_01',
};
