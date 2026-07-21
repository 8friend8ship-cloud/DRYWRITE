const endpoint = process.env.AGENT_CORE_ENDPOINT || process.env.AGENT_MAIL_ENDPOINT;
const token = process.env.AGENT_CORE_TOKEN || process.env.AGENT_MAIL_TOKEN;
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') { res.setHeader('Allow','GET'); return res.status(405).json({ok:false,error:'GET only'}); }
  if (!endpoint || !token) return res.status(500).json({ok:false,error:'AGENT_CORE_ENDPOINT/TOKEN not configured'});
  const appId = String(req.query?.appId || '').trim();
  const query = String(req.query?.query || '').trim();
  if (!appId || !query) return res.status(400).json({ok:false,error:'appId and query are required'});
  const target = new URL(endpoint);
  [['action','front_answer'],['appId',appId],['query',query],['intent',String(req.query?.intent||'')],['locale',String(req.query?.locale||'ko-KR')],['market',String(req.query?.market||'KR')],['sessionId',String(req.query?.sessionId||'')],['token',token]].forEach(([k,v])=>target.searchParams.set(k,v));
  const response = await fetch(target,{cache:'no-store'});
  const text = await response.text();
  res.setHeader('Cache-Control','private, max-age=60');
  res.status(response.status).send(text);
}
