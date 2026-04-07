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
  RazorpayCreateOrderRequest,
  RazorpayCreateOrderResponse,
  RazorpayVerifyPaymentRequest,
  RazorpayVerifyPaymentResponse,
  VoiceSessionFeedbackRequest,
  VoiceSessionFeedbackResponse,
} from './types';
import { API_BASE, PAYMENT_API_BASE, buildVoiceWsUrl } from './config';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function toDisplayName(email: string): string {
  const localPart = email.split('@')[0] || 'user';
  return localPart
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function normalizeRole(role: unknown): 'user' | 'influencer' | 'admin' {
  const normalized = typeof role === 'string' ? role.toLowerCase() : '';
  if (normalized === 'admin' || normalized === 'influencer' || normalized === 'user') {
    return normalized;
  }
  return 'user';
}

function normalizeAuthResponse(
  payload: unknown,
  fallback: { email: string; name?: string; role?: string }
): AuthResponse {
  const root = asRecord(payload) ?? {};
  const userObj = asRecord(root.user);
  const tokensObj = asRecord(root.tokens);

  const accessToken =
    (typeof tokensObj?.access_token === 'string' ? tokensObj.access_token : undefined) ||
    (typeof root.access_token === 'string' ? root.access_token : undefined);

  if (!accessToken) {
    throw new Error('Authentication succeeded but access token is missing in response.');
  }

  const tokenType =
    (typeof tokensObj?.token_type === 'string' ? tokensObj.token_type : undefined) ||
    (typeof root.token_type === 'string' ? root.token_type : undefined) ||
    'bearer';

  const email =
    (typeof userObj?.email === 'string' ? userObj.email : undefined) ||
    (typeof root.email === 'string' ? root.email : undefined) ||
    fallback.email;

  const idValue =
    (typeof userObj?.id === 'number' || typeof userObj?.id === 'string' ? userObj.id : undefined) ||
    (typeof root.user_id === 'number' || typeof root.user_id === 'string' ? root.user_id : undefined) ||
    (typeof root.id === 'number' || typeof root.id === 'string' ? root.id : undefined) ||
    email;

  const name =
    (typeof userObj?.name === 'string' ? userObj.name : undefined) ||
    (typeof root.name === 'string' ? root.name : undefined) ||
    fallback.name ||
    toDisplayName(email);

  const role = normalizeRole(userObj?.role ?? root.role ?? fallback.role);

  const createdAt =
    (typeof userObj?.created_at === 'string' ? userObj.created_at : undefined) ||
    new Date().toISOString();

  const avatarUrl =
    (typeof userObj?.avatar_url === 'string' ? userObj.avatar_url : undefined) ||
    '';

  return {
    user: {
      id: String(idValue),
      email,
      name,
      role,
      avatar_url: avatarUrl,
      created_at: createdAt,
    },
    tokens: {
      access_token: accessToken,
      token_type: tokenType,
    },
  };
}

// ─── Base Axios Instance ───
export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

const paymentApiClient = axios.create({
  baseURL: PAYMENT_API_BASE,
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

paymentApiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
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
  register: async (data: RegisterRequest) => {
    const registerPayload = await api.post('/auth/register', data).then((r) => r.data);

    // Some backends return metadata only on register and omit tokens.
    try {
      return normalizeAuthResponse(registerPayload, {
        email: data.email,
        name: data.name,
        role: data.role,
      });
    } catch {
      const loginPayload = await api
        .post('/auth/login', { email: data.email, password: data.password })
        .then((r) => r.data);

      return normalizeAuthResponse(loginPayload, {
        email: data.email,
        name: data.name,
        role: data.role,
      });
    }
  },

  login: async (data: LoginRequest) => {
    const loginPayload = await api.post('/auth/login', data).then((r) => r.data);
    return normalizeAuthResponse(loginPayload, { email: data.email });
  },
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

  createRazorpayOrder: (data: RazorpayCreateOrderRequest) =>
    paymentApiClient
      .post<RazorpayCreateOrderResponse>('/payment/create-order', data)
      .then((r) => r.data),

  verifyRazorpayPayment: (data: RazorpayVerifyPaymentRequest) =>
    paymentApiClient
      .post<RazorpayVerifyPaymentResponse>('/payment/verify-payment', data)
      .then((r) => r.data),
};

export const feedbackApi = {
  submitVoiceSessionFeedback: async (data: VoiceSessionFeedbackRequest) => {
    const parsedUserId =
      typeof data.user_id === 'number'
        ? data.user_id
        : Number.parseInt(String(data.user_id), 10);

    if (!Number.isInteger(parsedUserId)) {
      throw new Error('Feedback submission failed: user_id must be a numeric value.');
    }

    const payload = {
      user_id: parsedUserId,
      influencer_id: data.influencer_id,
      rating: data.rating,
      comment: data.comment ?? null,
    };

    const preferredPath = process.env.NEXT_PUBLIC_FEEDBACK_API_PATH?.trim();
    const candidatePaths = [
      preferredPath,
      '/feedback',
      '/feedback/',
      '/feedback/voice-session',
      '/feedback/voice-session/',
      '/api/feedback',
      '/api/feedback/',
    ].filter((path, index, arr): path is string => !!path && arr.indexOf(path) === index);

    let lastError: unknown;

    for (const path of candidatePaths) {
      try {
        const response = await api.post<VoiceSessionFeedbackResponse>(path, payload);
        return response.data;
      } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 404) {
          throw error;
        }
        lastError = error;
      }
    }

    throw lastError ?? new Error('Unable to submit feedback: endpoint not found.');
  },
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
  return buildVoiceWsUrl(influencerId);
}
