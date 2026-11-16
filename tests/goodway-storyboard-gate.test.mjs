import test from 'node:test';
import assert from 'node:assert/strict';
import { URL } from 'node:url';
import { readFileSync } from 'node:fs';
import { GOODWAY_STORYBOARD_PROFILE, planGoodwayLongreadT2 } from '../services/goodwayStoryboardGate.mjs';

const candidate = (props={}) => ({
  profileId:'GOODWAY_LONGREAD_T2_OVERLAY_V1',
  sourceId:'QRES-VERIFIED-EXAMPLE',
  masterContentId:'DRYMASTER-EXAMPLE-001',
  masterHash:'sha256-example-only',
  revision:'1',
  writerPreset:'series_c',
  privacyStatus:'PASS_HUMAN_REVIEW',
  sourceRights:'VERIFIED_ORIGINAL_OR_LICENSED',
  writerQa:'PASS',
  masterApproval:'APPROVED',
  factualQa:'PASS',
  bonSeomgimQa:'PASS',
  harmonyCircleQa:'PASS',
  rightRelationshipQa:'PASS',
  ...props,
});

test('optional T2 preserves original DryWriter and existing reader, not active publish', () => {
  const c=JSON.parse(readFileSync(new URL('../config/front-template-contract-v2.json', import.meta.url),'utf8'));
  assert.equal(c.writerT1Template,'PTPL-DRYWRITER-BASE-V2');
  assert.equal(c.t2Template,'T2_DRYWRITE_FRONT_READER_V2');
  assert.equal(c.optionalT2Storyboard.profileId,GOODWAY_STORYBOARD_PROFILE.id);
  assert.equal(c.optionalT2Storyboard.autoPublish,false);
  assert.equal(c.optionalT2Storyboard.runtimeStatus,'SPEC_ONLY_BOUND_APPS_SCRIPT_ACK_PENDING');
});

test('missing optional profile does not rewrite prior T1 flow',()=>{
  assert.equal(planGoodwayLongreadT2(candidate({profileId:''})).status,'SKIP_NO_GOODWAY_PROFILE');
});
test('unknown and random combined series presets remain blocked',()=>{
  assert.equal(planGoodwayLongreadT2(candidate({writerPreset:'A+B+C'})).status,'HOLD_PRESET');
});
test('Keep personal data without manual review never reaches layout',()=>{
  const result=planGoodwayLongreadT2(candidate({privacyStatus:'AUTO_REGEX_ONLY',secret:'sk-proj-NOTPRINTED'}));
  assert.equal(result.status,'HOLD_PRIVACY');
  assert.equal(JSON.stringify(result).includes('sk-proj'),false);
});
test('missing rights/QA/factual evidence all block without publishing',()=>{
  assert.equal(planGoodwayLongreadT2(candidate({sourceRights:'UNKNOWN'})).status,'HOLD_RIGHTS');
  assert.equal(planGoodwayLongreadT2(candidate({writerQa:'HOLD'})).status,'HOLD_MASTER_QA');
  assert.equal(planGoodwayLongreadT2(candidate({rightRelationshipQa:'HOLD'})).status,'HOLD_EDITORIAL_QA');
  assert.equal(planGoodwayLongreadT2(candidate({masterContentId:''})).status,'HOLD_SOURCE_LINEAGE');
});
test('Bible R16 seven-plus-one remains separate and unchanged',()=>{
  assert.equal(planGoodwayLongreadT2(candidate({chapterProfile:'R16_DEVOTION_7_PLUS_1'})).status,'HOLD_SEPARATE_DEVOTIONAL');
});
test('all prior approvals yield T2 review only, never public',()=>{
  const r=planGoodwayLongreadT2(candidate());
  assert.equal(r.status,'T2_STORYBOARD_REVIEW_ONLY');
  assert.equal(r.publicYn,'N');
  assert.equal(r.publicationAction,'NONE');
  assert.equal(r.originalMasterMutation,'FORBIDDEN');
  assert.equal(r.beats.length,7);
  assert.equal(r.creatorApproval,'REQUIRED_FOR_EXACT_RENDERED_ARTICLE');
});
