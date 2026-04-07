// ─── RBAC Roles ───
export type UserRole = 'user' | 'influencer' | 'admin';

// ─── Auth ───
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ─── Creator / Influencer ───
export interface Creator {
  id: string;
  name: string;
  role: string;
  image_url: string;
  handle: string;
  status: 'active' | 'inactive';
  bio?: string;
  followers?: number;
  following?: number;
  voice_id?: string;
}

// ─── Session ───
export interface Session {
  id: string;
  user_id: string;
  influencer_id: string;
  duration_minutes: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  ended_at?: string;
}

export interface SessionCreateRequest {
  influencer_id: string;
  duration_minutes: number;
}

export interface SessionResult {
  request_id: string;
  status: string;
  result?: Record<string, unknown>;
}

// ─── Payment ───
export interface CheckoutRequest {
  session_id: string;
  amount: number;
  currency: string;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export type AllowedDurationMinutes = 3 | 5 | 10 | 15 | 20 | 30;

export interface RazorpayCreateOrderRequest {
  duration_minutes: AllowedDurationMinutes;
  influencer_id: string;
  provider_name?: string;
}

export interface RazorpayCreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status?: string;
  key_id: string;
}

export interface RazorpayVerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayVerifyPaymentResponse {
  success?: boolean;
  message?: string;
  booking_id?: string;
}

export type FeedbackStars = 1 | 2 | 3 | 4 | 5;

export interface VoiceSessionFeedbackRequest {
  user_id: string | number;
  influencer_id: string;
  rating: FeedbackStars;
  comment?: string | null;
}

export interface VoiceSessionFeedbackResponse {
  success?: boolean;
  message?: string;
}

// ─── Voice ───
export interface VoiceRegistration {
  name: string;
  voice_sample_url: string;
  provider: string;
}

// ─── Provider Config ───
export interface ProviderConfig {
  provider: string;
  api_key: string;
  config: Record<string, unknown>;
}

// ─── Knowledge Base ───
export interface KnowledgeEntry {
  id?: string;
  influencer_id: string;
  content: string;
  category: string;
}

// ─── Analytics ───
export interface UsageAnalytics {
  total_sessions: number;
  total_minutes: number;
  active_users: number;
  avg_session_duration: number;
  daily_usage: DailyUsage[];
  provider_breakdown: ProviderBreakdown[];
}

export interface DailyUsage {
  date: string;
  sessions: number;
  minutes: number;
}

export interface ProviderBreakdown {
  provider: string;
  sessions: number;
  percentage: number;
}

export interface BookingAnalytics {
  total_bookings: number;
  revenue: number;
  conversion_rate: number;
  daily_bookings: DailyBooking[];
  top_creators: TopCreator[];
}

export interface DailyBooking {
  date: string;
  bookings: number;
  revenue: number;
}

export interface TopCreator {
  name: string;
  bookings: number;
  revenue: number;
}

// ─── API ───
export interface ApiError {
  message: string;
  status: number;
  detail?: string;
}
