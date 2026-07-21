const READ_ACTIONS = new Set(['dashboard', 'mail', 'schedule', 'queue']);
const WRITE_ACTIONS = new Set(['create_task', 'mark_reviewed']);

function config() {
  const endpoint = process.env.AGENT_MAIL_ENDPOINT;
  const token = process.env.AGENT_MAIL_TOKEN;
  if (!endpoint || !token) throw new Error('Agent bridge environment is not configured.');
  return { endpoint, token };
}

export default async function handler(req: any, res: any) {
  try {
    const { endpoint, token } = config();

    if (req.method === 'GET') {
      const action = String(req.query?.action || 'dashboard').toLowerCase();
      if (!READ_ACTIONS.has(action)) return res.status(400).json({ ok: false, error: 'Unsupported action' });
      const url = new URL(endpoint);
      url.searchParams.set('action', action);
      url.searchParams.set('limit', String(Math.min(Math.max(Number(req.query?.limit || 50), 1), 200)));
      url.searchParams.set('token', token);
      const response = await fetch(url, { cache: 'no-store' });
      return res.status(response.status).send(await response.text());
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const action = String(body.action || '').toLowerCase();
      if (!WRITE_ACTIONS.has(action)) return res.status(400).json({ ok: false, error: 'Unsupported action' });
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, action, token }),
      });
      return res.status(response.status).send(await response.text());
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : 'Server error' });
  }
}
