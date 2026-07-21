import React, { useEffect, useState } from 'react';
import App from './App';
import { getDryWritePmfContext } from './services/pmfGateService';

const PmfAwareApp: React.FC = () => {
  const [context, setContext] = useState<any>(null);
  useEffect(() => {
    let active = true;
    getDryWritePmfContext().then(value => {
      if (!active) return;
      setContext(value);
      (window as any).__PMF_CONTEXT__ = value;
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  return <><>{context?.gateResult === 'RESEARCH_REQUIRED' && <div className="px-4 py-2 text-sm bg-amber-50 border-b border-amber-200">고객 검증 {context.stage || 1}차 진행 중: 검증되지 않은 시장성·지불의사를 사실로 단정하지 않습니다.</div>}</><App /></>;
};
export default PmfAwareApp;
