const DRYWRITE_FACTORY_ADAPTER_VERSION = 'DRYWRITE_FACTORY_ADAPTER_V1_20260823';
const DRYWRITE_FACTORY_MASTER_ID = '1C_CznU1Uo7dk-gKay3-oH8wFxutsGMlz27RSrbdVQwI';
const DRYWRITE_FACTORY_APP_ID = 'APP_DRYWRITE';
const DRYWRITE_FACTORY_TARGET_ID = 'FPC_DRYWRITE_20260823';
const DRYWRITE_FACTORY_STAGE_HANDLERS = ['runDryWriterQueensCollectionTrigger','runDryWriterSeedTrigger','runDryWriterFirstTemplateTrigger'];
const DRYWRITE_FACTORY_API_WINDOWS = [9,13,17,21];

function runDryWriteBackdataFactoryControl10m() {
  return runDryWriteFactoryAdapter_({runStages:true});
}

function checkDryWriteBackdataFactoryAdapter() {
  return runDryWriteFactoryAdapter_({runStages:false,healthOnly:true});
}

function runDryWriteApiAbQaControl() {
  const now = new Date();
  const hour = Number(Utilities.formatDate(now,'Asia/Seoul','H'));
  if (DRYWRITE_FACTORY_API_WINDOWS.indexOf(hour) < 0) return {ok:true,skipped:true,reason:'OUTSIDE_API_AB_WINDOW',hourKst:hour,version:DRYWRITE_FACTORY_ADAPTER_VERSION};
  const props = PropertiesService.getScriptProperties();
  const key = 'DRYWRITE_API_AB_' + Utilities.formatDate(now,'Asia/Seoul','yyyyMMdd') + '_' + hour;
  if (props.getProperty(key) === 'Y') return {ok:true,skipped:true,reason:'WINDOW_ALREADY_RUN',hourKst:hour,version:DRYWRITE_FACTORY_ADAPTER_VERSION};
  const result = {ok:false,degraded:true,appId:DRYWRITE_FACTORY_APP_ID,hourKst:hour,error:'API_EXECUTOR_NOT_MAPPED',decision:'COMPARE_OWN_PIPELINE_FIRST_THEN_MAP_APPROVED_API',version:DRYWRITE_FACTORY_ADAPTER_VERSION};
  appendDryWriteFactoryQa_(result, now);
  props.setProperty(key,'Y');
  return result;
}

function runDryWriteFactoryAdapter_(options) {
  options = options || {};
  const now = new Date();
  const props = PropertiesService.getScriptProperties();
  const bucket = Utilities.formatDate(now,'Asia/Seoul','yyyyMMddHHmm').slice(0,11);
  const gateKey = 'DRYWRITE_FACTORY_BUCKET';
  if (!options.healthOnly && props.getProperty(gateKey) === bucket) return {ok:true,skipped:true,reason:'SAME_10M_BUCKET',bucket:bucket,version:DRYWRITE_FACTORY_ADAPTER_VERSION};
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return {ok:false,reason:'LOCK_BUSY',bucket:bucket,version:DRYWRITE_FACTORY_ADAPTER_VERSION};
  try {
    const central = SpreadsheetApp.openById(DRYWRITE_FACTORY_MASTER_ID);
    const target = readDryWriteFactoryTarget_(central);
    const handlers = inspectDryWriteFactoryHandlers_();
    const stages = [];
    if (options.runStages) {
      DRYWRITE_FACTORY_STAGE_HANDLERS.forEach(function(name){
        const fn = globalThis[name];
        if (typeof fn !== 'function') { stages.push({handler:name,ok:false,skipped:true,reason:'HANDLER_NOT_SYNCED'}); return; }
        try { stages.push({handler:name,ok:true,result:fn()}); }
        catch (err) { stages.push({handler:name,ok:false,error:String(err && err.message || err)}); }
      });
    }
    const triggers = ScriptApp.getProjectTriggers().map(function(t){return t.getHandlerFunction();});
    const duplicateFactoryTriggers = triggers.filter(function(n){return n === 'runDryWriteBackdataFactoryControl10m';}).length;
    const out = {ok:true,appId:DRYWRITE_FACTORY_APP_ID,target:target,handlers:handlers,stages:stages,duplicateFactoryTriggers:duplicateFactoryTriggers,bucket:bucket,checkedAt:now.toISOString(),version:DRYWRITE_FACTORY_ADAPTER_VERSION};
    markDryWriteFactoryRuntime_(central,out);
    if (!options.healthOnly) props.setProperty(gateKey,bucket);
    props.setProperty('DRYWRITE_FACTORY_LAST_RESULT',JSON.stringify(out).slice(0,8000));
    return out;
  } finally { lock.releaseLock(); }
}

function inspectDryWriteFactoryHandlers_() {
  return DRYWRITE_FACTORY_STAGE_HANDLERS.map(function(name){return {handler:name,present:typeof globalThis[name] === 'function'};});
}

function readDryWriteFactoryTarget_(central) {
  const sh = central.getSheetByName('66_FACTORY_PRODUCTION_CONTROL');
  if (!sh || sh.getLastRow() < 2) return {found:false};
  const rows = sh.getRange(2,1,sh.getLastRow()-1,26).getDisplayValues();
  for (let i=rows.length-1;i>=0;i--) if (String(rows[i][0]) === DRYWRITE_FACTORY_TARGET_ID) return {found:true,queens:Number(rows[i][5]||0),seed:Number(rows[i][6]||0),t1:Number(rows[i][7]||0),t2:Number(rows[i][8]||0),assets:Number(rows[i][9]||0),qualityGate:String(rows[i][18]||''),status:String(rows[i][24]||'')};
  return {found:false};
}

function markDryWriteFactoryRuntime_(central,out) {
  const sh = central.getSheetByName('66_FACTORY_PRODUCTION_CONTROL');
  if (!sh || sh.getLastRow() < 2) return;
  const rows = sh.getRange(2,1,sh.getLastRow()-1,26).getDisplayValues();
  for (let i=rows.length-1;i>=0;i--) if (String(rows[i][0]) === DRYWRITE_FACTORY_TARGET_ID) {
    const row=i+2;
    const missing=out.handlers.filter(function(h){return !h.present;}).map(function(h){return h.handler;});
    sh.getRange(row,25).setValue(missing.length ? 'BOUND_ADAPTER_PARTIAL_HANDLER_SYNC_REQUIRED' : 'BOUND_ADAPTER_EXECUTED_RUNTIME_X2_REQUIRED');
    sh.getRange(row,26).setValue('LAST_ADAPTER='+out.checkedAt+';MISSING='+missing.join('|')+';DUP_FACTORY_TRIGGERS='+out.duplicateFactoryTriggers);
    return;
  }
}

function appendDryWriteFactoryQa_(result,now) {
  const sh = SpreadsheetApp.openById(DRYWRITE_FACTORY_MASTER_ID).getSheetByName('67_FACTORY_QA_AB_LOG');
  if (!sh) return;
  const runId='QA_DRYWRITE_'+Utilities.formatDate(now,'Asia/Seoul','yyyyMMdd_HH00');
  sh.appendRow([runId,Utilities.formatDate(now,'Asia/Seoul','yyyy-MM-dd HH:mm:ss')+' KST',DRYWRITE_FACTORY_APP_ID,'FRONT_FIXTURE_PENDING','OWN_CACHE_QUEENS_SEED_T1_T2','APPROVED_API_ON','','','','','','','','','','','','','',result.error,'','API_EXECUTOR_MAPPING_REQUIRED','DRYWRITE_FACTORY_ADAPTER_V1','PENDING']);
}
