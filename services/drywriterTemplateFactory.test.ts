import { strict as assert } from 'node:assert';
import { buildDrywriterStageMatrix } from './drywriterTemplateFactory';

const matrix = buildDrywriterStageMatrix({
  appId: 'DRYWRITE',
  requiredFields: ['contentId', 'title', 'rawText', 'summary', 'status', 'language'],
  styleRules: ['dry tone', 'question-led', 'separate verified and unknown'],
});
assert.equal(matrix.length, 7);
assert.equal(matrix[0].stage, 'SEED_NORMALIZE');
assert.equal(matrix[1].stage, 'STORYBOARD_RANDOM');
assert.equal(matrix[5].stage, 'T2_PACKAGE');
assert.equal(matrix[0].inferred, true);
assert.ok(matrix.every((stage) => stage.requiredFields.includes('contentId')));
assert.throws(() => buildDrywriterStageMatrix({ appId: 'DRYWRITE', requiredFields: [], styleRules: [] }), /FRONT_CONTRACT_REQUIRED/);
