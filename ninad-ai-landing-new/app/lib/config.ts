const DEFAULT_LOCAL_API_BASE = 'http://localhost:8000';

const envApiBase = process.env.NEXT_PUBLIC_API_URL?.trim();
const envLocalApiBase = process.env.NEXT_PUBLIC_LOCAL_API_URL?.trim();
const useLocalApi = process.env.NEXT_PUBLIC_USE_LOCAL_API === 'true';
const envPaymentApiBase = process.env.NEXT_PUBLIC_PAYMENT_API_URL?.trim();

// Priority: localhost toggle > explicit API URL from .env.local.
const resolvedApiBase = useLocalApi
  ? envLocalApiBase || DEFAULT_LOCAL_API_BASE
  : envApiBase;

if (!resolvedApiBase) {
  throw new Error('Missing NEXT_PUBLIC_API_URL in .env.local.');
}

export const API_BASE = resolvedApiBase.replace(/\/$/, '');
export const API_WS_BASE = API_BASE.replace(/^http/, 'ws');
export const PAYMENT_API_BASE = (envPaymentApiBase || API_BASE).replace(/\/$/, '');
export const RAZORPAY_PUBLIC_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || '';

export function buildVoiceWsUrl(influencerId: string): string {
  return `${API_WS_BASE}/ws/voice?influencer_id=${encodeURIComponent(influencerId)}`;
}
