const DEFAULT_LOCAL_API_BASE = 'http://localhost:8000';

const envApiBase = process.env.NEXT_PUBLIC_API_URL?.trim();
const envLocalApiBase = process.env.NEXT_PUBLIC_LOCAL_API_URL?.trim();
const useLocalApi = process.env.NEXT_PUBLIC_USE_LOCAL_API === 'true';

// Priority: localhost toggle > explicit API URL from .env.local.
const resolvedApiBase = useLocalApi
  ? envLocalApiBase || DEFAULT_LOCAL_API_BASE
  : envApiBase;

if (!resolvedApiBase) {
  throw new Error('Missing NEXT_PUBLIC_API_URL in .env.local.');
}

export const API_BASE = resolvedApiBase.replace(/\/$/, '');
export const API_WS_BASE = API_BASE.replace(/^http/, 'ws');
export const RAZORPAY_PUBLIC_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || '';

// Secondary backend for select creators' voice sessions (e.g. api-ninad-2.duckdns.org)
const NINAD_2_API_BASE = process.env.NEXT_PUBLIC_NINAD_2_API_URL?.trim()?.replace(/\/$/, '') || '';
// NOTE: Beauty Khan temporarily removed from the frontend. Re-enable by uncommenting 'beauty_khan' below.
const NINAD_2_CREATOR_INFLUENCER_IDS = new Set([/* 'beauty_khan', */ 'sona_dey']);

export function buildVoiceWsUrl(influencerId: string): string {
  return `${API_WS_BASE}/ws/voice?influencer_id=${encodeURIComponent(influencerId)}`;
}

export function buildCreatorVoiceWsUrl(influencerId: string): string {
  if (NINAD_2_API_BASE && NINAD_2_CREATOR_INFLUENCER_IDS.has(influencerId)) {
    const ninad2WsBase = NINAD_2_API_BASE.replace(/^http/, 'ws');
    return `${ninad2WsBase}/ws/voice?influencer_id=${encodeURIComponent(influencerId)}`;
  }
  return buildVoiceWsUrl(influencerId);
}
