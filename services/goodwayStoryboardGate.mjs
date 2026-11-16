/**
 * Existing writer/master → GOODWAY long-read T2 storyboard decision only.
 * Invoked by the existing approved runner after bound-script ACK, never a new trigger.
 * No API, publishing, cache write or manuscript rewriting is performed here.
 */
export const GOODWAY_STORYBOARD_PROFILE = Object.freeze({
  id: 'GOODWAY_LONGREAD_T2_OVERLAY_V1',
  kind: 'T2_PRESENTATION_ONLY',
  legacyDryMaster: 'DRY_ARCHIVE_MASTER_V2',
  referencePersona: 'PTPL-EDITORIAL-CURIOSITY-NOTE-V1',
  referenceStyleSeed: 'WS_WRITE_EDITORIAL_CURIOSITY_V1',
  readerDesireSeed: 'WS_WRITE_READER_DESIRE_V1',
  sceneBeats: Object.freeze([
    'REAL_READER_QUESTION', 'VISIBLE_SCENE', 'TESTED_CONTRADICTION',
    'HISTORY_CONTEXT_AND_MULTI_POV', 'EVIDENCE_AND_COUNTEREVIDENCE',
    'COST_CHOICE_SMALL_APPLICATION', 'OPEN_ENDING_READER_QUESTION',
  ]),
  scripture: 'DEVOTION_ONLY_PRESERVE_7_PLUS_1',
  publication: 'DISABLED_UNTIL_SEPARATE_MANUAL_PUBLISH',
});

const PRESETS = new Set(['series_a','series_b','series_c','series_d','Custom']);

/**
 * Only inspect stable IDs and explicit prior gate receipts.
 * Do not pass sensitive raw Keep text, private metadata, secrets or API URLs.
 *
 * @returns {object} A REVIEW_ONLY plan with source pointers, never publish clearance.
 */
export function planGoodwayLongreadT2(candidate = {}) {
  const blocked = (status, reason) => Object.freeze({
    status, reason, publicYn: 'N', publicationAction: 'NONE', sourceMaterialCopied: false,
  });
  if (candidate.profileId !== GOODWAY_STORYBOARD_PROFILE.id) {
    return blocked('SKIP_NO_GOODWAY_PROFILE', 'The original T1/T2 flow remains unchanged');
  }
  if (!candidate.sourceId || !candidate.masterContentId || !candidate.masterHash || !candidate.revision) {
    return blocked('HOLD_SOURCE_LINEAGE', 'Missing canonical source/master/version receipt');
  }
  if (!PRESETS.has(candidate.writerPreset)) {
    return blocked('HOLD_PRESET', 'Do not randomize or silently rewrite legacy A/B/C/D/Custom');
  }
  if (candidate.chapterProfile === 'R16_DEVOTION_7_PLUS_1') {
    return blocked('HOLD_SEPARATE_DEVOTIONAL', 'R16 seven-plus-one original must use its own approval gate');
  }
  if (candidate.privacyStatus !== 'PASS_HUMAN_REVIEW') {
    return blocked('HOLD_PRIVACY', 'No raw Keep notes, credentials or contextual personal identifiers');
  }
  if (candidate.sourceRights !== 'VERIFIED_ORIGINAL_OR_LICENSED') {
    return blocked('HOLD_RIGHTS', 'LongBlack/other proprietary text is never copied or reproduced');
  }
  if (candidate.writerQa !== 'PASS' || candidate.masterApproval !== 'APPROVED') {
    return blocked('HOLD_MASTER_QA', 'Original Dry Writer T1 master is not finally approved');
  }
  if (candidate.factualQa !== 'PASS' || candidate.bonSeomgimQa !== 'PASS' ||
      candidate.harmonyCircleQa !== 'PASS' || candidate.rightRelationshipQa !== 'PASS') {
    return blocked('HOLD_EDITORIAL_QA', 'Evidence, service, reader journey and ethics required');
  }
  const plan = {
    status:'T2_STORYBOARD_REVIEW_ONLY',
    publicYn:'N',
    publicationAction:'NONE',
    sourceMaterialCopied:false,
    profileId: GOODWAY_STORYBOARD_PROFILE.id,
    sourceId: candidate.sourceId,
    masterContentId: candidate.masterContentId,
    masterHash: candidate.masterHash,
    revision: candidate.revision,
    writerPreset: candidate.writerPreset,
    originalMasterMutation:'FORBIDDEN',
    platformMasterRegeneration:'FORBIDDEN',
    beats:[...GOODWAY_STORYBOARD_PROFILE.sceneBeats],
    creatorApproval:'REQUIRED_FOR_EXACT_RENDERED_ARTICLE',
    providerPublicationReceipt:'REQUIRED_SEPARATELY',
  };
  return Object.freeze(plan);
}
