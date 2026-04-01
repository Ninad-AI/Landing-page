const envApiBase = process.env.NEXT_PUBLIC_API_URL?.trim();
const fallbackDevApiBase = process.env.NODE_ENV !== 'production' ? 'http://localhost:8000' : undefined;
const resolvedApiBase = envApiBase || fallbackDevApiBase;

if (!resolvedApiBase) {
  throw new Error('Missing NEXT_PUBLIC_API_URL. Set it in your environment file for production.');
}

export const API_BASE = resolvedApiBase.replace(/\/$/, '');
export const API_WS_BASE = API_BASE.replace(/^http/, 'ws');

export function buildVoiceWsUrl(influencerId: string): string {
  return `${API_WS_BASE}/ws/voice?influencer_id=${encodeURIComponent(influencerId)}`;
}
