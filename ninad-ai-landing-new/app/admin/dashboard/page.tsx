'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { analyticsApi } from '../../lib/api';
import type {
  AnalyticsBookingsResponse,
  AnalyticsDashboardResponse,
  AnalyticsFeedbackResponse,
  AnalyticsInfluencersResponse,
  AnalyticsRecentBooking,
  AnalyticsRecentResponse,
  AnalyticsUsageResponse,
  AnalyticsUsersResponse,
} from '../../lib/types';

function formatNumber(value: number): string {
  return Number.isFinite(value) ? value.toLocaleString('en-IN') : '0';
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatDurationMinutes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0m';
  const totalMinutes = Math.round(value);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function formatDate(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function bookingStatusClass(status?: string): string {
  const normalized = status?.toLowerCase();
  if (normalized === 'active') return 'text-green-300 bg-green-500/15';
  if (normalized === 'expired') return 'text-amber-200 bg-amber-500/15';
  if (normalized === 'completed') return 'text-cyan-200 bg-cyan-500/15';
  return 'text-white/60 bg-white/10';
}

function getApiErrorMessage(error: unknown): string {
  const apiError = error as {
    response?: {
      data?: {
        detail?: string;
        message?: string;
        error?: string;
      };
    };
    message?: string;
  };

  return (
    apiError.response?.data?.detail ||
    apiError.response?.data?.message ||
    apiError.response?.data?.error ||
    (error instanceof Error ? error.message : 'Failed to load admin analytics.')
  );
}

function AdminDashboardContent() {
  const hasLoadedInitiallyRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardResponse | null>(null);
  const [usageData, setUsageData] = useState<AnalyticsUsageResponse | null>(null);
  const [bookingsData, setBookingsData] = useState<AnalyticsBookingsResponse | null>(null);
  const [usersData, setUsersData] = useState<AnalyticsUsersResponse | null>(null);
  const [influencersData, setInfluencersData] = useState<AnalyticsInfluencersResponse | null>(null);
  const [recentData, setRecentData] = useState<AnalyticsRecentResponse | null>(null);
  const [feedbackData, setFeedbackData] = useState<AnalyticsFeedbackResponse | null>(null);

  const loadAnalytics = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setErrorMessage(null);

    try {
      const [dashboard, usage, bookings, users, influencers, recent, feedback] = await Promise.all([
        analyticsApi.dashboard(),
        analyticsApi.usage(),
        analyticsApi.bookings(),
        analyticsApi.users(),
        analyticsApi.influencers(),
        analyticsApi.recent(),
        analyticsApi.feedback(),
      ]);

      setDashboardData(dashboard);
      setUsageData(usage);
      setBookingsData(bookings);
      setUsersData(users);
      setInfluencersData(influencers);
      setRecentData(recent);
      setFeedbackData(feedback);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      if (refresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (hasLoadedInitiallyRef.current) {
      return;
    }

    hasLoadedInitiallyRef.current = true;
    void loadAnalytics();
  }, [loadAnalytics]);

  const recentBookings: AnalyticsRecentBooking[] = useMemo(() => {
    if (recentData?.recent_bookings?.length) {
      return recentData.recent_bookings;
    }
    return bookingsData?.recent_bookings ?? [];
  }, [recentData, bookingsData]);

  const statCards = [
    {
      label: 'Total Sessions',
      value: formatNumber(dashboardData?.total_sessions ?? 0),
      helper: '/analytics/dashboard',
      icon: (
        <svg className="w-5 h-5 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a6 6 0 006-6V7a6 6 0 10-12 0v5a6 6 0 006 6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12a7 7 0 0014 0M12 19v3m-3 0h6" />
        </svg>
      ),
    },
    {
      label: 'Active Users',
      value: formatNumber(usersData?.active_users ?? dashboardData?.active_users ?? 0),
      helper: '/analytics/users',
      icon: (
        <svg className="w-5 h-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19v-1a4 4 0 00-4-4H6a4 4 0 00-4 4v1" />
          <circle cx="8.5" cy="7" r="3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M22 19v-1a4 4 0 00-3-3.87" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 4.13a3 3 0 010 5.74" />
        </svg>
      ),
    },
    {
      label: 'Revenue',
      value: formatCurrency(dashboardData?.revenue ?? bookingsData?.revenue_summary ?? 0),
      helper: '/analytics/bookings',
      icon: (
        <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h9a3 3 0 010 6H9a3 3 0 000 6h8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 4v16" />
        </svg>
      ),
    },
    {
      label: 'Avg Duration',
      value: formatDurationMinutes(dashboardData?.avg_duration ?? 0),
      helper: '/analytics/dashboard',
      icon: (
        <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <circle cx="12" cy="13" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 13V9m0 4l3 2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 2h6" />
        </svg>
      ),
    },
  ];

  if (isLoading) {
    return (
      <main className="relative min-h-screen overflow-x-hidden">
        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 max-w-[1400px] pt-28 sm:pt-32 md:pt-40 pb-16 sm:pb-20 md:pb-24">
          <div className="glass border border-white/10 rounded-2xl p-8 flex items-center gap-4">
            <div className="w-5 h-5 border-2 border-white/25 border-t-white rounded-full animate-spin" />
            <p className="text-white/70 font-medium">Loading admin analytics...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute left-[-24vw] top-[4vw] h-[clamp(260px,52vw,700px)] w-[clamp(260px,52vw,700px)] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(97,37,216,0.5)_0%,transparent_70%)]" />
        <div className="absolute right-[-20vw] top-[22vw] h-[clamp(220px,42vw,500px)] w-[clamp(220px,42vw,500px)] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(0,169,255,0.3)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 max-w-[1400px] pt-28 sm:pt-32 md:pt-40 pb-16 sm:pb-20 md:pb-24">
        {/* Page Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse" />
            <span className="text-xs font-bold text-green-400/80 uppercase tracking-wider">Live</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-sans font-extrabold text-3xl md:text-5xl text-white tracking-tight mb-2">
                Admin Dashboard
              </h1>
              <p className="font-sans text-base text-white/40">
                Integrated backend analytics for sessions, usage, bookings, users, influencers, and feedback.
              </p>
            </div>
            <button
              onClick={() => void loadAnalytics(true)}
              disabled={isRefreshing}
              className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-white/80 text-sm font-semibold transition-colors hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-8 rounded-2xl border border-rose-300/35 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-100">
            {errorMessage}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 animate-fade-in-up delay-100">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="glass border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  {stat.icon}
                </span>
                <span className="text-[10px] font-bold text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                  {stat.helper}
                </span>
              </div>
              <div className="font-sans font-extrabold text-2xl text-white mb-1 tabular-nums">
                {stat.value}
              </div>
              <div className="text-xs text-white/40 font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="glass border border-white/10 rounded-2xl p-6 animate-fade-in-up delay-200">
            <h3 className="font-sans font-bold text-lg text-white mb-5">Usage Summary</h3>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Total Calls</p>
                <p className="text-xl font-extrabold text-white tabular-nums">{formatNumber(usageData?.total_calls ?? 0)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Minutes Used</p>
                <p className="text-xl font-extrabold text-white tabular-nums">{formatNumber(usageData?.minutes_used ?? 0)}</p>
              </div>
            </div>

            <div className="space-y-2">
              {(usageData?.influencer_breakdown ?? []).map((entry, index) => (
                <div key={`${entry.influencer_id || entry.influencer_name || 'row'}-${index}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/3 px-3 py-2">
                  <span className="text-sm text-white/85 font-medium">{entry.influencer_name || entry.influencer_id || 'Influencer'}</span>
                  <span className="text-xs text-white/50 tabular-nums">{formatNumber(entry.calls)} calls • {formatNumber(entry.minutes)} min</span>
                </div>
              ))}
              {(usageData?.influencer_breakdown ?? []).length === 0 && (
                <p className="text-sm text-white/45">No per-influencer usage data available.</p>
              )}
            </div>
          </div>

          <div className="glass border border-white/10 rounded-2xl p-6 animate-fade-in-up delay-300">
            <h3 className="font-sans font-bold text-lg text-white mb-5">Bookings Summary</h3>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Active</p>
                <p className="text-xl font-extrabold text-white tabular-nums">{formatNumber(bookingsData?.active_count ?? 0)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Expired</p>
                <p className="text-xl font-extrabold text-white tabular-nums">{formatNumber(bookingsData?.expired_count ?? 0)}</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Revenue Summary</p>
              <p className="text-xl font-extrabold text-white tabular-nums">{formatCurrency(bookingsData?.revenue_summary ?? 0)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="glass border border-white/10 rounded-2xl p-6 animate-fade-in-up delay-300">
            <h3 className="font-sans font-bold text-lg text-white mb-5">User Growth Trends</h3>
            <div className="space-y-2">
              {(usersData?.growth_trends ?? []).slice(0, 10).map((trend, index) => (
                <div key={`${trend.date}-${index}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/3 px-3 py-2">
                  <span className="text-sm text-white/80">{trend.date}</span>
                  <span className="text-xs text-white/50 tabular-nums">
                    Active: {formatNumber(trend.active_users ?? 0)} • New: {formatNumber(trend.new_users ?? 0)}
                  </span>
                </div>
              ))}
              {(usersData?.growth_trends ?? []).length === 0 && (
                <p className="text-sm text-white/45">No user growth data available.</p>
              )}
            </div>
          </div>

          <div className="glass border border-white/10 rounded-2xl p-6 animate-fade-in-up delay-300">
            <h3 className="font-sans font-bold text-lg text-white mb-5">Feedback Summary</h3>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Overall Avg Rating</p>
                <p className="text-xl font-extrabold text-white tabular-nums">{(feedbackData?.overall_avg_rating ?? 0).toFixed(2)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Total Feedback</p>
                <p className="text-xl font-extrabold text-white tabular-nums">{formatNumber(feedbackData?.total_feedback ?? 0)}</p>
              </div>
            </div>

            <div className="space-y-2">
              {(feedbackData?.influencer_feedback ?? []).map((item, index) => (
                <div key={`${item.influencer_id || item.influencer_name || 'feedback'}-${index}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/3 px-3 py-2">
                  <span className="text-sm text-white/85 font-medium">{item.influencer_name || item.influencer_id || 'Influencer'}</span>
                  <span className="text-xs text-white/50 tabular-nums">{(item.avg_rating ?? 0).toFixed(2)} ★ • {formatNumber(item.total_feedback ?? item.feedback_count ?? 0)} reviews</span>
                </div>
              ))}
              {(feedbackData?.influencer_feedback ?? []).length === 0 && (
                <p className="text-sm text-white/45">No feedback aggregates available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass border border-white/10 rounded-2xl p-6 animate-fade-in-up delay-300">
            <h3 className="font-sans font-bold text-lg text-white mb-5">Influencer Performance</h3>
            <div className="space-y-2">
              {(influencersData?.influencers ?? []).map((item, index) => (
                <div key={`${item.influencer_id || item.influencer_name || 'influencer'}-${index}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/3 px-3 py-2">
                  <span className="text-sm text-white/85 font-medium">{item.influencer_name || item.influencer_id || 'Influencer'}</span>
                  <span className="text-xs text-white/50 tabular-nums">
                    Sessions: {formatNumber(item.sessions ?? item.calls ?? 0)} • Rating: {(item.avg_rating ?? item.ratings ?? 0).toFixed(2)} • {formatCurrency(item.revenue ?? 0)}
                  </span>
                </div>
              ))}
              {(influencersData?.influencers ?? []).length === 0 && (
                <p className="text-sm text-white/45">No influencer performance data available.</p>
              )}
            </div>
          </div>

          <div className="glass border border-white/10 rounded-2xl p-6 animate-fade-in-up delay-300">
            <h3 className="font-sans font-bold text-lg text-white mb-5">Recent Bookings</h3>
            <div className="space-y-2">
              {recentBookings.map((booking, index) => (
                <div key={`${booking.id}-${index}`} className="rounded-xl border border-white/10 bg-white/3 px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-white/85 font-medium">{booking.user_name || 'User'} • {booking.influencer_name || 'Influencer'}</span>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${bookingStatusClass(booking.status)}`}>
                      {booking.status || 'unknown'}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-white/50 tabular-nums">
                    Duration: {formatNumber(booking.duration_minutes ?? 0)} min • Amount: {formatCurrency(booking.amount ?? 0)} • {formatDate(booking.created_at)}
                  </div>
                </div>
              ))}
              {recentBookings.length === 0 && (
                <p className="text-sm text-white/45">No recent bookings available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
