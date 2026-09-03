const CANONICAL_WRITER_URL = 'https://script.google.com/macros/s/AKfycbxNPNmtCEeIjLJuUnfp-sTdEgQOzUUA_2cMkyqCzhaUJcRvYwppBgtSuPjbezWCn2zKrw/exec';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const url = new URL(CANONICAL_WRITER_URL);
    url.searchParams.set('action', 'HEALTH');
    url.searchParams.set('probe', 'DRYWRITE_FRONT_API_V1');
    const upstream = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'Accept': 'application/json,text/plain;q=0.9,*/*;q=0.1' },
    });
    const text = await upstream.text();
    let parsed = null;
    try { parsed = JSON.parse(text); } catch {}
    const contractVersion = parsed && typeof parsed === 'object' ? parsed.contractVersion || null : null;
    const action = parsed && typeof parsed === 'object' ? parsed.action || null : null;
    const envelopeOk = Boolean(parsed && typeof parsed === 'object' && parsed.ok === true);
    const contractOk = contractVersion === 'DRYWRITE_FRONT_API_V1';
    res.status(200).json({
      ok: envelopeOk && contractOk,
      probe: 'CANONICAL_WRITER_HEALTH',
      upstreamStatus: upstream.status,
      upstreamContentType: upstream.headers.get('content-type'),
      envelopeOk,
      contractOk,
      contractVersion,
      action,
      responseKind: parsed ? 'JSON' : 'NON_JSON',
      bodyPreview: parsed ? undefined : text.slice(0, 180),
    });
  } catch (error) {
    res.status(200).json({
      ok: false,
      probe: 'CANONICAL_WRITER_HEALTH',
      error: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
    });
  } finally {
    clearTimeout(timeout);
  }
}
