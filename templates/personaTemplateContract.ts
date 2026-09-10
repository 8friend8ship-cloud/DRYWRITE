import type { ContentRecord } from '../types';

/**
 * DRYWRITE persona template contract.
 *
 * Source of truth is the Writer factory, not this browser bundle:
 * 66_WRITING_FORMAT_QUEENS -> 67_WRITING_STYLE_SEED ->
 * 68_PERSONA_T1_TEMPLATE -> FORM_PERSONA_DRY_DEVOTIONAL_V2.
 *
 * This module only validates/renders backend-selected pointers. It must never
 * regenerate canonical prose or silently substitute a different persona/form.
 */
export const PERSONA_WRITING_CONTRACT = Object.freeze({
  version: 'PERSONA_WRITING_CONTRACT_V2',
  queensSheet: '66_WRITING_FORMAT_QUEENS',
  seedSheet: '67_WRITING_STYLE_SEED',
  personaTemplateSheet: '68_PERSONA_T1_TEMPLATE',
  defaultBibleForm: 'FORM_PERSONA_DRY_DEVOTIONAL_V2',
  defaultBiblePersona: 'P-BIBLE365-DRY-001',
});

export interface PersonaTemplateLineage {
  personaId: string;
  personaTemplateId: string;
  formId: string;
  writingSeedId?: string;
  learningLanguagePackId?: string;
  voicePackId?: string;
}

export function getPersonaTemplateLineage(record: ContentRecord): PersonaTemplateLineage | null {
  if (!record.personaId || !record.personaTemplateId || !record.formId) return null;

  return {
    personaId: record.personaId,
    personaTemplateId: record.personaTemplateId,
    formId: record.formId,
    writingSeedId: record.writingSeedId,
    learningLanguagePackId: record.learningLanguagePackId,
    voicePackId: record.voicePackId,
  };
}

export function isBible365PersonaV2(record: ContentRecord): boolean {
  return (
    record.formId === PERSONA_WRITING_CONTRACT.defaultBibleForm &&
    record.personaId === PERSONA_WRITING_CONTRACT.defaultBiblePersona
  );
}
