export type AgentReadAction = 'dashboard' | 'mail' | 'schedule' | 'queue';

async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({ ok: false, error: 'Invalid response' }));
  if (!response.ok || payload?.ok === false) throw new Error(payload?.error || `Request failed (${response.status})`);
  return payload as T;
}

export async function readAgentData<T = unknown>(action: AgentReadAction, limit = 50): Promise<T> {
  const query = new URLSearchParams({ action, limit: String(Math.min(Math.max(limit, 1), 200)) });
  const payload = await readJson<{ ok: true; data: T }>(await fetch(`/api/agent-bridge?${query}`, { cache: 'no-store' }));
  return payload.data;
}

export async function createAgentTask(input: {
  taskType: string;
  request: string;
  sourceId?: string;
  priority?: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
  approvalStatus?: 'NOT_REQUIRED' | 'PENDING';
}) {
  return readJson(await fetch('/api/agent-bridge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create_task', ...input }),
  }));
}
