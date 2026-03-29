import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SessionCreateRequest,
  Session,
  SessionResult,
  CheckoutRequest,
  CheckoutResponse,
  VoiceRegistration,
  ProviderConfig,
  KnowledgeEntry,
  UsageAnalytics,
  BookingAnalytics,
  Creator,
} from './types';

// ─── Base Axios Instance ───
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request Interceptor: Attach JWT ───
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ninad_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Response Interceptor: Handle 401 ───
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('ninad_access_token');
      localStorage.removeItem('ninad_user');
      window.dispatchEvent(new CustomEvent('ninad:auth:logout'));
    }
    return Promise.reject(err);
  }
);

// ─── Auth Endpoints ───
export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),
};

// ─── Session Endpoints ───
export const sessionApi = {
  create: (data: SessionCreateRequest) =>
    api.post<Session>('/session', data).then((r) => r.data),

  getResult: (requestId: string) =>
    api.get<SessionResult>(`/result/${requestId}`).then((r) => r.data),
};

// ─── Payment Endpoints ───
export const paymentApi = {
  createCheckout: (data: CheckoutRequest) =>
    api.post<CheckoutResponse>('/payment/create-checkout', data).then((r) => r.data),
};

// ─── Voice Endpoints ───
export const voiceApi = {
  register: (data: VoiceRegistration) =>
    api.post('/voices', data).then((r) => r.data),
};

// ─── Provider Config Endpoints ───
export const providerApi = {
  save: (data: ProviderConfig) =>
    api.post('/provider-config', data).then((r) => r.data),
};

// ─── Knowledge Base Endpoints ───
export const knowledgeApi = {
  save: (data: KnowledgeEntry) =>
    api.post('/knowledge', data).then((r) => r.data),
};

// ─── Analytics Endpoints ───
export const analyticsApi = {
  usage: () =>
    api.get<UsageAnalytics>('/analytics/usage').then((r) => r.data),

  bookings: () =>
    api.get<BookingAnalytics>('/analytics/bookings').then((r) => r.data),
};

// ─── Creators Endpoint (public) ───
export const creatorsApi = {
  list: () =>
    api.get<Creator[]>('/creators').then((r) => r.data),
};

// ─── WebSocket URL builder ───
export function getVoiceWsUrl(influencerId: string): string {
  const wsBase = API_BASE.replace(/^http/, 'ws');
  return `${wsBase}/ws/voice?influencer_id=${encodeURIComponent(influencerId)}`;
}
