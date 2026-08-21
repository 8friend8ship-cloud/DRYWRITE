import { strict as assert } from 'node:assert';
import { checkAllAppTemplatePacks, DRYWRITE_TARGET_APPS } from './appTemplatePackRegistry';

const base = DRYWRITE_TARGET_APPS.map((appId) => ({
  appId,
  requirementId: \`REQ-\${appId}-v1\`,
  seedTemplateId: \`\${appId}-SEED-v0.1\`,
  t1TemplateId: \`\${appId}-T1-v0.1\`,
  t2TemplateId: \`\${appId}-T2-v0.1\`,
  githubContractReady: true,
  appsScriptFunctionReady: true,
  testFixtureReady: true,
}));
assert.deepEqual(checkAllAppTemplatePacks(base), { ok: true, status: 'READY_FOR_PREVIEW', missingAppIds: [] });
const incomplete = base.filter((pack) => pack.appId !== 'INTERIOR');
const result = checkAllAppTemplatePacks(incomplete);
assert.equal(result.ok, false);
assert.equal(result.status, 'HOLD_ALL_APP_PACKS_REQUIRED');
assert.deepEqual(result.missingAppIds, ['INTERIOR']);
