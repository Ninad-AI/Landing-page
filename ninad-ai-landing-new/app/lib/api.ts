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
  AnalyticsDashboardResponse,
  AnalyticsUsageResponse,
  AnalyticsBookingsResponse,
  AnalyticsUsersResponse,
  AnalyticsInfluencersResponse,
  AnalyticsRecentResponse,
  AnalyticsFeedbackResponse,
  HealthResponse,
  Creator,
  RazorpayCreateOrderRequest,
  RazorpayCreateOrderResponse,
  RazorpayVerifyPaymentRequest,
  RazorpayVerifyPaymentResponse,
  ActiveBooking,
  UserBooking,
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

function firstNonEmptyString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
      continue;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return undefined;
}

function toFiniteNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number.parseFloat(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

function normalizeBookingRecord(record: Record<string, unknown>): UserBooking | null {
  const id = firstNonEmptyString(record.id, record.booking_id, record.payment_booking_id);
  if (!id) {
    return null;
  }

  const duration = toFiniteNumber(
    record.duration_minutes,
    record.duration,
    record.minutes,
    record.session_duration_minutes
  );
  const amount = toFiniteNumber(record.amount, record.total_amount, record.price, record.cost);

  return {
    id,
    user_id: firstNonEmptyString(record.user_id, record.userId),
    user_name: firstNonEmptyString(record.user_name, record.userName),
    influencer_id: firstNonEmptyString(record.influencer_id, record.influencerId, record.creator_id, record.creatorId),
    influencer_name: firstNonEmptyString(
      record.influencer_name,
      record.influencerName,
      record.creator_name,
      record.creatorName
    ),
    duration_minutes: duration && duration > 0 ? Math.round(duration) : 0,
    amount,
    status: firstNonEmptyString(record.status, record.booking_status, record.state),
    created_at: firstNonEmptyString(record.created_at, record.createdAt, record.booked_at, record.start_time),
    expires_at: firstNonEmptyString(record.expires_at, record.expiry, record.expiresAt, record.ends_at),
  };
}

function normalizeBookings(payload: unknown): UserBooking[] {
  const queue: unknown[] = [payload];
  const visited = new Set<unknown>();
  const bookingsById = new Map<string, UserBooking>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (current == null || visited.has(current)) {
      continue;
    }
    visited.add(current);

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    const record = asRecord(current);
    if (!record) {
      continue;
    }

    queue.push(record.booking, record.active_booking, record.current_booking, record.data, record.result);

    if (Array.isArray(record.bookings)) queue.push(...record.bookings);
    if (Array.isArray(record.items)) queue.push(...record.items);
    if (Array.isArray(record.results)) queue.push(...record.results);
    if (Array.isArray(record.rows)) queue.push(...record.rows);

    const booking = normalizeBookingRecord(record);
    if (booking && !bookingsById.has(booking.id)) {
      bookingsById.set(booking.id, booking);
    }
  }

  return Array.from(bookingsById.values());
}

function isActiveBooking(booking: UserBooking): boolean {
  const inactiveStatuses = new Set(['cancelled', 'canceled', 'completed', 'expired', 'failed']);
  const status = booking.status?.toLowerCase();
  if (!status) {
    return true;
  }
  return !inactiveStatuses.has(status);
}

function toActiveBooking(booking: UserBooking): ActiveBooking {
  return {
    id: booking.id,
    influencer_id: booking.influencer_id,
    duration_minutes: booking.duration_minutes > 0 ? booking.duration_minutes : undefined,
    status: booking.status,
    expires_at: booking.expires_at,
  };
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

const inflightActiveBookingChecks = new Map<string, Promise<ActiveBooking | null>>();

const MY_BOOKINGS_PATH = '/my-bookings';
const FEEDBACK_PATH = '/feedback';

function getRequestPathFromError(err: AxiosError): string {
  const rawUrl = err.config?.url;
  if (!rawUrl) {
    return '';
  }

  try {
    return new URL(rawUrl, API_BASE).pathname;
  } catch {
    return rawUrl;
  }
}

function shouldForceLogoutOnUnauthorized(err: AxiosError): boolean {
  if (err.response?.status !== 401) {
    return false;
  }

  const requestPath = getRequestPathFromError(err);

  // Analytics endpoints can return 401 for role/token mismatch and should not
  // wipe the entire frontend session automatically.
  if (requestPath.startsWith('/analytics/')) {
    return false;
  }

  return true;
}

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
    if (typeof window !== 'undefined' && shouldForceLogoutOnUnauthorized(err)) {
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
    const normalizedEmail = data.email.trim().toLowerCase();

    const loginPayload = await api
      .post('/auth/login', { ...data, email: normalizedEmail })
      .then((r) => r.data);
    return normalizeAuthResponse(loginPayload, { email: normalizedEmail });
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

  getMyBookings: async (): Promise<UserBooking[]> => {
    const response = await api.get(MY_BOOKINGS_PATH);
    return normalizeBookings(response.data);
  },

  getActiveBooking: async (influencerId?: string): Promise<ActiveBooking | null> => {
    const normalizedInfluencerId = influencerId?.trim();
    const requestKey = normalizedInfluencerId || '__all__';

    const existingRequest = inflightActiveBookingChecks.get(requestKey);
    if (existingRequest) {
      return existingRequest;
    }

    const requestPromise = (async (): Promise<ActiveBooking | null> => {
      const bookings = await paymentApi.getMyBookings();
      const matchingBooking = bookings
        .filter(isActiveBooking)
        .find((booking) => !normalizedInfluencerId || !booking.influencer_id || booking.influencer_id === normalizedInfluencerId);

      return matchingBooking ? toActiveBooking(matchingBooking) : null;
    })();

    inflightActiveBookingChecks.set(requestKey, requestPromise);

    try {
      return await requestPromise;
    } finally {
      inflightActiveBookingChecks.delete(requestKey);
    }
  },
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

    const response = await api.post<VoiceSessionFeedbackResponse>(FEEDBACK_PATH, payload);
    return response.data;
  },
};

// ─── Analytics Endpoints ───
export const analyticsApi = {
  dashboard: () =>
    api.get<AnalyticsDashboardResponse>('/analytics/dashboard').then((r) => r.data),

  usage: () =>
    api.get<AnalyticsUsageResponse>('/analytics/usage').then((r) => r.data),

  bookings: () =>
    api.get<AnalyticsBookingsResponse>('/analytics/bookings').then((r) => r.data),

  users: () =>
    api.get<AnalyticsUsersResponse>('/analytics/users').then((r) => r.data),

  influencers: () =>
    api.get<AnalyticsInfluencersResponse>('/analytics/influencers').then((r) => r.data),

  recent: () =>
    api.get<AnalyticsRecentResponse>('/analytics/recent').then((r) => r.data),

  feedback: () =>
    api.get<AnalyticsFeedbackResponse>('/analytics/feedback').then((r) => r.data),
};

// ─── System Diagnostics Endpoint ───
export const systemApi = {
  health: () =>
    api.get<HealthResponse>('/health').then((r) => r.data),
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
