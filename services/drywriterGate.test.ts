import { strict as assert } from 'node:assert';
import { checkDrywriterGate } from './drywriterGate';

const base = {
  personaId: 'DRYWRITER',
  seedId: 'PERSONA-DRYWRITER-FULLBODY-PROVISIONAL-20260821-01',
  templatePackVersion: 'DRYWRITER-DRYWRITE-v0.1',
  frontAppId: 'DRYWRITE',
};

assert.deepEqual(checkDrywriterGate({ ...base, stage: 'SEED' }), { ok: true, status: 'APPROVED' });
assert.equal(checkDrywriterGate({ ...base, stage: 'T1' }).error, 'CENTRAL_AGENT_REVIEW_REQUIRED');
assert.deepEqual(
  checkDrywriterGate({ ...base, stage: 'T1', centralAgentReviewId: 'T1-REVIEW-001' }),
  { ok: true, status: 'APPROVED' },
);
assert.equal(checkDrywriterGate({ ...base, personaId: '', stage: 'SEED' }).error, 'DRYWRITER_GATE_REQUIRED');
