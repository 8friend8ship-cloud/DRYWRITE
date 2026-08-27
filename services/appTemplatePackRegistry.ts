export const DRYWRITE_TARGET_APPS = [
  'DRYWRITE', 'ANALYZER', 'INTERIOR', 'TRAVEL', 'SHORTS', 'BIBLE365', 'KFOOD', 'SECURITIES',
] as const;

export type DrywriteTargetApp = typeof DRYWRITE_TARGET_APPS[number];

export interface AppTemplatePackReadiness {
  appId: DrywriteTargetApp;
  requirementId: string;
  seedTemplateId: string;
  t1TemplateId: string;
  t2TemplateId: string;
  githubContractReady: boolean;
  appsScriptFunctionReady: boolean;
  testFixtureReady: boolean;
}

export interface DeploymentGateResult {
  ok: boolean;
  status: 'READY_FOR_PREVIEW' | 'HOLD_ALL_APP_PACKS_REQUIRED';
  missingAppIds: DrywriteTargetApp[];
}

export function checkAllAppTemplatePacks(packs: AppTemplatePackReadiness[]): DeploymentGateResult {
  const byApp = new Map(packs.map((pack) => [pack.appId, pack]));
  const missingAppIds = DRYWRITE_TARGET_APPS.filter((appId) => {
    const pack = byApp.get(appId);
    return !pack || !pack.requirementId || !pack.seedTemplateId || !pack.t1TemplateId || !pack.t2TemplateId ||
      !pack.githubContractReady || !pack.appsScriptFunctionReady || !pack.testFixtureReady;
  });
  return missingAppIds.length === 0
    ? { ok: true, status: 'READY_FOR_PREVIEW', missingAppIds: [] }
    : { ok: false, status: 'HOLD_ALL_APP_PACKS_REQUIRED', missingAppIds };
}
