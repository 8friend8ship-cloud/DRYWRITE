export type DrywriterStage = 'SEED_NORMALIZE' | 'STORYBOARD_RANDOM' | 'T1_ARTICLE' | 'T1_MEDIA_META' | 'T1_REVIEW_REFORM' | 'T2_PACKAGE' | 'ANIMATION_HANDOFF';

export interface FrontContract {
  appId: string;
  requiredFields: string[];
  optionalFields?: string[];
  styleRules: string[];
}

export interface TemplateStage {
  templateId: string;
  stage: DrywriterStage;
  requiredFields: string[];
  optionalFields: string[];
  styleRules: string[];
  storyboardRole: string;
  inferred: boolean;
}

const stageRoles: Record<DrywriterStage, string> = {
  SEED_NORMALIZE: 'select source, persona angle, evidence bucket',
  STORYBOARD_RANDOM: 'randomize hook, order, chapter beats, tension',
  T1_ARTICLE: 'expand storyboard into article sections',
  T1_MEDIA_META: 'choose optional cover/meta only when front requires',
  T1_REVIEW_REFORM: 'rewrite weak order, tone, or evidence before T2',
  T2_PACKAGE: 'assemble exact frontend payload and delivery metadata',
  ANIMATION_HANDOFF: 'map approved beats to scene, voice, motion, and assets',
};

export function buildDrywriterStageMatrix(contract: FrontContract): TemplateStage[] {
  if (!contract.appId.trim() || contract.requiredFields.length === 0) throw new Error('FRONT_CONTRACT_REQUIRED');
  const required = [...new Set(contract.requiredFields.map((field) => field.trim()).filter(Boolean))];
  const optional = [...new Set((contract.optionalFields ?? []).map((field) => field.trim()).filter(Boolean))];
  const inferred = !contract.optionalFields;
  return (Object.keys(stageRoles) as DrywriterStage[]).map((stage) => ({
    templateId: `DRYWRITE-${stage}-${contract.appId}-v0.1`,
    stage,
    requiredFields: required,
    optionalFields: optional,
    styleRules: contract.styleRules,
    storyboardRole: stageRoles[stage],
    inferred,
  }));
}
