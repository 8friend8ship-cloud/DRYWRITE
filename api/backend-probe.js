const CANONICAL_WRITER_URL = 'https://script.google.com/macros/s/AKfycbxNPNmtCEeIjLJuUnfp-sTdEgQOzUUA_2cMkyqCzhaUJcRvYwppBgtSuPjbezWCn2zKrw/exec';
const CONTRACT = 'DRYWRITE_FRONT_API_V1';

async function callWriter(action, probe) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const url = new URL(CANONICAL_WRITER_URL);
    url.searchParams.set('action', action);
    url.searchParams.set('probe', probe);
    if (action === 'LIST_CONTENT') url.searchParams.set('pageSize', '2');
    const upstream = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { Accept: 'application/json,text/plain;q=0.9,*/*;q=0.1' },
    });
    const text = await upstream.text();
    let parsed = null;
    try { parsed = JSON.parse(text); } catch {}
    const envelopeOk = Boolean(parsed && typeof parsed === 'object' && parsed.ok === true);
    const contractVersion = parsed && typeof parsed === 'object' ? parsed.contractVersion || null : null;
    const contractOk = contractVersion === CONTRACT;
    const data = parsed && Array.isArray(parsed.data) ? parsed.data : [];
    return {
      ok: upstream.status === 200 && envelopeOk && contractOk && parsed.action === action,
      action,
      upstreamStatus: upstream.status,
      upstreamContentType: upstream.headers.get('content-type'),
      envelopeOk,
      contractOk,
      contractVersion,
      responseAction: parsed && parsed.action || null,
      requestId: parsed && parsed.requestId || null,
      itemCount: action === 'LIST_CONTENT' ? data.length : undefined,
      contentIds: action === 'LIST_CONTENT' ? data.slice(0, 2).map(item => item && item.contentId).filter(Boolean) : undefined,
      errorCode: parsed && parsed.error && parsed.error.code || null,
      responseKind: parsed ? 'JSON' : 'NON_JSON',
      bodyPreview: parsed ? undefined : text.slice(0, 180),
    };
  } catch (error) {
    return { ok: false, action, error: error instanceof Error ? error.name : 'UNKNOWN_ERROR' };
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const [health1, health2, list1, list2] = await Promise.all([
    callWriter('HEALTH', 'FORCED_X2_HEALTH_1'),
    callWriter('HEALTH', 'FORCED_X2_HEALTH_2'),
    callWriter('LIST_CONTENT', 'FORCED_X2_LIST_1'),
    callWriter('LIST_CONTENT', 'FORCED_X2_LIST_2'),
  ]);
  const checks = [health1, health2, list1, list2];
  res.status(200).json({
    ok: checks.every(check => check.ok),
    probe: 'DRYWRITE_CANONICAL_FORCED_X2',
    contractVersion: CONTRACT,
    checks,
    passed: checks.filter(check => check.ok).length,
    total: checks.length,
  });
}
