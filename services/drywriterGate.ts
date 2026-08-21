export const DRYWRITER_TEMPLATE_PACK_VERSION = 'DRYWRITER-PACK-v0.1';
export const DRYWRITER_PERSONA_ID = 'DRYWRITER';

export type DrywriterStage = 'SEED' | 'T1' | 'T2';

export interface DrywriterGateInput {
  personaId: string;
  seedId: string;
  templatePackVersion: string;
  frontAppId: string;
  stage: DrywriterStage;
  centralAgentReviewId?: string;
}

export interface DrywriterGateResult {
  ok: boolean;
  status: 'APPROVED' | 'HOLD';
  error?: 'DRYWRITER_GATE_REQUIRED' | 'CENTRAL_AGENT_REVIEW_REQUIRED';
}

export function checkDrywriterGate(input: DrywriterGateInput): DrywriterGateResult {
  if (input.personaId !== DRYWRITER_PERSONA_ID ||
      !input.seedId.trim() ||
      !input.templatePackVersion.trim() ||
      !input.frontAppId.trim()) {
    return { ok: false, status: 'HOLD', error: 'DRYWRITER_GATE_REQUIRED' };
  }
  if ((input.stage === 'T1' || input.stage === 'T2') && !input.centralAgentReviewId?.trim()) {
    return { ok: false, status: 'HOLD', error: 'CENTRAL_AGENT_REVIEW_REQUIRED' };
  }
  return { ok: true, status: 'APPROVED' };
}
