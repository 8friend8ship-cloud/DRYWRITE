const CANONICAL_WRITER_URL = 'https://script.google.com/macros/s/AKfycbxNPNmtCEeIjLJuUnfp-sTdEgQOzUUA_2cMkyqCzhaUJcRvYwppBgtSuPjbezWCn2zKrw/exec';
const ALLOWED_ACTIONS = new Set(['LIST_CONTENT', 'GET_CONTENT', 'HEALTH']);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: { code: 'METHOD_NOT_ALLOWED' } });
    return;
  }

  const action = String(req.query?.action || '').trim();
  if (!ALLOWED_ACTIONS.has(action)) {
    res.status(400).json({ ok: false, error: { code: 'ACTION_NOT_ALLOWED' } });
    return;
  }

  const upstreamUrl = new URL(CANONICAL_WRITER_URL);
  upstreamUrl.searchParams.set('action', action);
  if (action === 'LIST_CONTENT') {
    upstreamUrl.searchParams.set('pageSize', String(req.query?.pageSize || '100'));
  }
  if (action === 'GET_CONTENT') {
    upstreamUrl.searchParams.set('contentId', String(req.query?.contentId || ''));
  }
  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: { Accept: 'application/json,text/plain;q=0.9,*/*;q=0.1' },
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.send(text);
  } catch (error) {
    res.status(502).json({
      ok: false,
      error: { code: 'UPSTREAM_UNAVAILABLE', message: error instanceof Error ? error.name : 'UNKNOWN_ERROR' },
    });
  }
}
