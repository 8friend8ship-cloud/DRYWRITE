import { strict as assert } from 'node:assert';
import { buildDrywriterMvpT2, DRYWRITER_MVP_INPUT } from './drywriterMvpPipeline.ts';

const first = buildDrywriterMvpT2(DRYWRITER_MVP_INPUT);
const second = buildDrywriterMvpT2(DRYWRITER_MVP_INPUT);

assert.deepEqual(first, second);
assert.equal(first.status, 'APPROVED');
assert.equal(first.record.status, 'READY');
assert.equal(first.record.writingSeedId, DRYWRITER_MVP_INPUT.seed.seedId);
assert.equal(first.t1TemplateId, 'DRYWRITE-T1-EDITORIAL-v0.1');
assert.equal(first.t2TemplateId, 'DRYWRITE-T2-PACKAGE-v0.1');
assert.equal(first.unverifiedClaims.length, 0);
assert.equal(first.animationHandoff.status, 'READY');
assert.equal(first.animationHandoff.voice.tone, 'DRY_NEUTRAL');
assert.equal(first.animationHandoff.scenes.length, 3);
assert.match(first.record.rawText, /## 관찰 1/);
assert.match(first.record.rawText, /## 확인된 근거/);
assert.throws(
  () => buildDrywriterMvpT2({ ...DRYWRITER_MVP_INPUT, centralAgentReviewId: '' }),
  /CENTRAL_AGENT_REVIEW_REQUIRED/,
);
assert.throws(
  () => buildDrywriterMvpT2({
    ...DRYWRITER_MVP_INPUT,
    t1: { ...DRYWRITER_MVP_INPUT.t1, observations: ['하나'] },
  }),
  /T1_OBSERVATIONS_MIN_3/,
);
