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
  influencer_id?: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface GoogleSignInRequest {
  id_token: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ─── Payment ───
export type AllowedDurationMinutes = 1 | 3 | 5 | 10 | 15;

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
  status?: string;
  success?: boolean;
  message?: string;
  booking_id?: number | string;
}

export interface ActiveBooking {
  id: string;
  influencer_id?: string;
  duration_minutes?: number;
  status?: string;
  expires_at?: string;
}

export interface BookingInfluencer {
  influencer_id?: string;
  name?: string;
  avatar_url?: string;
  short_bio?: string;
}

export interface UserBooking {
  id: string;
  user_id?: string;
  user_name?: string;
  influencer_id?: string;
  influencer_name?: string;
  /** Nested influencer object returned by the new /my-bookings API */
  influencer?: BookingInfluencer;
  provider_name?: string;
  duration_minutes: number;
  /** Amount in paise (₹1 = 100 paise) */
  amount_paise?: number;
  /** Legacy amount field (may be in rupees depending on API version) */
  amount?: number;
  status?: string;
  created_at?: string;
  expires_at?: string;
  /** Seconds remaining in the booking window */
  remaining_seconds?: number;
  remaining_minutes?: number;
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

// ─── Analytics ───
export interface DailyUsage {
  date: string;
  sessions: number;
  minutes: number;
}

export interface AnalyticsDashboardResponse {
  total_sessions: number;
  active_users: number;
  revenue: number;
  avg_duration: number;
}

export interface InfluencerUsageBreakdown {
  influencer_id?: string;
  influencer_name?: string;
  calls: number;
  minutes: number;
}

export interface AnalyticsUsageResponse {
  total_calls: number;
  minutes_used: number;
  influencer_breakdown: InfluencerUsageBreakdown[];
}

export interface AnalyticsRecentBooking {
  id: string;
  user_name?: string;
  influencer_name?: string;
  duration_minutes?: number;
  status?: string;
  amount?: number;
  created_at?: string;
  expires_at?: string;
}

export interface AnalyticsBookingsResponse {
  active_count: number;
  expired_count: number;
  revenue_summary: number;
  recent_bookings: AnalyticsRecentBooking[];
}

export interface UserGrowthTrend {
  date: string;
  active_users?: number;
  new_users?: number;
  total_users?: number;
}

export interface AnalyticsUsersResponse {
  active_users: number;
  growth_trends: UserGrowthTrend[];
}

export interface InfluencerPerformance {
  influencer_id?: string;
  influencer_name?: string;
  sessions?: number;
  calls?: number;
  minutes?: number;
  ratings?: number;
  avg_rating?: number;
  revenue?: number;
}

export interface AnalyticsInfluencersResponse {
  influencers: InfluencerPerformance[];
}

export interface InfluencerUsageDetail {
  influencer_id: string;
  influencer_name?: string;
  total_sessions: number;
  total_minutes: number;
  total_revenue: number;
  avg_rating?: number;
  total_feedback?: number;
  daily_usage: DailyUsage[];
  recent_bookings: AnalyticsRecentBooking[];
}

export interface AnalyticsRecentResponse {
  recent_bookings: AnalyticsRecentBooking[];
}

export interface InfluencerFeedbackAggregate {
  influencer_id?: string;
  influencer_name?: string;
  avg_rating?: number;
  total_feedback?: number;
  feedback_count?: number;
}

export interface AnalyticsFeedbackResponse {
  overall_avg_rating?: number;
  total_feedback?: number;
  influencer_feedback: InfluencerFeedbackAggregate[];
}

export interface ProviderHealth {
  active: number;
  reserved: number;
  limit: number;
  available: number;
}

export interface HealthResponse {
  status?: string;
  message?: string;
  redis?: string;
  providers?: Record<string, ProviderHealth>;
  streaming_only?: boolean;
  supported_providers?: string[];
  total_capacity?: number;
  total_active_sessions?: number;
  total_reserved?: number;
  warnings?: string[] | null;
  [key: string]: unknown;
}

// ─── Creator Applications ───
export interface CreatorApplicationRequest {
  name: string;
  social_handle: string;
  known_for: string;
}

export interface CreatorApplicationResponse {
  status: string;
  application_id: number;
}
