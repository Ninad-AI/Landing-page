'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { analyticsApi, adminApi } from '../../lib/api';
import type {
  AnalyticsBookingsResponse,
  AnalyticsDashboardResponse,
  AnalyticsFeedbackResponse,
  AnalyticsInfluencersResponse,
  AnalyticsRecentBooking,
  AnalyticsRecentResponse,
  AnalyticsUsageResponse,
  AnalyticsUsersResponse,
  InfluencerUsageDetail,
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
  if (normalized === 'active') return 'text-emerald-700 bg-emerald-50';
  if (normalized === 'expired') return 'text-amber-700 bg-amber-50';
  if (normalized === 'completed') return 'text-blue-700 bg-blue-50';
  return 'text-nd-muted bg-nd-panel';
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

  // ── Promote Influencer form state ──
  const [promoteUserId, setPromoteUserId] = useState('');
  const [promoteInfluencerId, setPromoteInfluencerId] = useState('');
  const [promoting, setPromoting] = useState(false);
  const [promoteResult, setPromoteResult] = useState<string | null>(null);
  const [promoteError, setPromoteError] = useState<string | null>(null);

  // ── Influencer drill-down state ──
  const [selectedInfId, setSelectedInfId] = useState<string | null>(null);
  const [infDetail, setInfDetail] = useState<InfluencerUsageDetail | null>(null);
  const [infDetailLoading, setInfDetailLoading] = useState(false);
  const [infDetailError, setInfDetailError] = useState<string | null>(null);

  const handleInfClick = async (influencerId: string) => {
    setSelectedInfId(influencerId);
    setInfDetailLoading(true);
    setInfDetailError(null);
    setInfDetail(null);
    try {
      const detail = await analyticsApi.influencerUsage(influencerId);
      setInfDetail(detail);
    } catch {
      setInfDetailError('Failed to load influencer details.');
    } finally {
      setInfDetailLoading(false);
    }
  };

  const handleInfBack = () => {
    setSelectedInfId(null);
    setInfDetail(null);
    setInfDetailError(null);
  };

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoteResult(null);
    setPromoteError(null);
    const userIdNum = Number.parseInt(promoteUserId, 10);
    if (!Number.isInteger(userIdNum) || !promoteInfluencerId.trim()) {
      setPromoteError('Please enter a valid numeric user_id and non-empty influencer_id.');
      return;
    }
    setPromoting(true);
    try {
      const res = await adminApi.promoteToInfluencer({
        user_id: userIdNum,
        influencer_id: promoteInfluencerId.trim(),
      });
      setPromoteResult(`User #${res.user_id} (${res.email}) promoted to influencer with ID "${res.influencer_id}".`);
      setPromoteUserId('');
      setPromoteInfluencerId('');
    } catch (error) {
      const msg = getApiErrorMessage(error);
      setPromoteError(msg);
    } finally {
      setPromoting(false);
    }
  };

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
        <svg className="w-5 h-5 text-nd-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
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
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
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
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
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
        <svg className="w-5 h-5 text-nd-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <circle cx="12" cy="13" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 13V9m0 4l3 2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 2h6" />
        </svg>
      ),
    },
  ];

  if (isLoading) {
    return (
      <main className="relative min-h-screen overflow-x-hidden bg-nd-bg">
        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 max-w-[1400px] pt-28 sm:pt-32 md:pt-40 pb-16 sm:pb-20 md:pb-24">
          <div className="bg-white border border-nd-line rounded-2xl p-8 flex items-center gap-4">
            <div className="w-5 h-5 border-2 border-nd-line border-t-nd-accent rounded-full animate-spin" />
            <p className="text-nd-muted font-medium">Loading admin analytics...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-nd-bg">
      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 max-w-[1400px] pt-28 sm:pt-32 md:pt-40 pb-16 sm:pb-20 md:pb-24">
        {/* Page Header */}
        <div className="mb-10 animate-nd-up">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Live</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-5xl text-nd-ink tracking-tight mb-2">
                Admin Dashboard
              </h1>
              <p className="font-nd-sans text-base text-nd-dim">
                Integrated backend analytics for sessions, usage, bookings, users, influencers, and feedback.
              </p>
            </div>
            <button
              onClick={() => void loadAnalytics(true)}
              disabled={isRefreshing}
              className="px-4 py-2 rounded-xl border border-nd-line bg-white text-nd-muted text-sm font-semibold transition-colors hover:bg-nd-panel disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 animate-nd-up">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-nd-line rounded-2xl p-5 hover:border-nd-accent/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-9 h-9 rounded-xl bg-nd-panel border border-nd-line-soft flex items-center justify-center">
                  {stat.icon}
                </span>
                <span className="text-[10px] font-bold text-nd-dim bg-nd-panel px-2 py-0.5 rounded-full">
                  {stat.helper}
                </span>
              </div>
              <div className="font-nd-sans font-extrabold text-2xl text-nd-ink mb-1 tabular-nums">
                {stat.value}
              </div>
              <div className="text-xs text-nd-dim font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Promote Influencer */}
        <div className="bg-white border border-nd-line rounded-2xl p-6 animate-nd-up mb-6">
          <h3 className="font-nd-sans font-bold text-lg text-nd-ink mb-5">Promote to Influencer</h3>
          <form onSubmit={handlePromote} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs text-nd-dim font-semibold mb-1.5">User ID</label>
              <input
                type="number"
                value={promoteUserId}
                onChange={(e) => setPromoteUserId(e.target.value)}
                placeholder="e.g. 45"
                className="w-full rounded-xl border border-nd-line bg-nd-panel px-4 py-2.5 text-sm text-nd-ink placeholder:text-nd-dim outline-none focus:border-nd-accent focus:bg-white transition-all"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs text-nd-dim font-semibold mb-1.5">Influencer ID</label>
              <input
                type="text"
                value={promoteInfluencerId}
                onChange={(e) => setPromoteInfluencerId(e.target.value)}
                placeholder="e.g. priya_m"
                className="w-full rounded-xl border border-nd-line bg-nd-panel px-4 py-2.5 text-sm text-nd-ink placeholder:text-nd-dim outline-none focus:border-nd-accent focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={promoting}
              className="px-5 py-2.5 rounded-xl bg-nd-ink text-nd-bg text-sm font-bold transition-all hover:bg-[#302C36] disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
            >
              {promoting ? 'Promoting...' : 'Promote'}
            </button>
          </form>
          {promoteResult && (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
              {promoteResult}
            </div>
          )}
          {promoteError && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {promoteError}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border border-nd-line rounded-2xl p-6 animate-nd-up">
            <h3 className="font-nd-sans font-bold text-lg text-nd-ink mb-5">Usage Summary</h3>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="rounded-xl border border-nd-line-soft bg-nd-panel px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-nd-dim font-bold mb-1">Total Calls</p>
                <p className="text-xl font-extrabold text-nd-ink tabular-nums">{formatNumber(usageData?.total_calls ?? 0)}</p>
              </div>
              <div className="rounded-xl border border-nd-line-soft bg-nd-panel px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-nd-dim font-bold mb-1">Minutes Used</p>
                <p className="text-xl font-extrabold text-nd-ink tabular-nums">{formatNumber(usageData?.minutes_used ?? 0)}</p>
              </div>
            </div>

            <div className="space-y-2">
              {(usageData?.influencer_breakdown ?? []).map((entry, index) => (
                <div key={`${entry.influencer_id || entry.influencer_name || 'row'}-${index}`} className="flex items-center justify-between rounded-xl border border-nd-line-soft bg-white px-3 py-2">
                  <span className="text-sm text-nd-ink font-medium">{entry.influencer_name || entry.influencer_id || 'Influencer'}</span>
                  <span className="text-xs text-nd-dim tabular-nums">{formatNumber(entry.calls)} calls • {formatNumber(entry.minutes)} min</span>
                </div>
              ))}
              {(usageData?.influencer_breakdown ?? []).length === 0 && (
                <p className="text-sm text-nd-dim">No per-influencer usage data available.</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-nd-line rounded-2xl p-6 animate-nd-up">
            <h3 className="font-nd-sans font-bold text-lg text-nd-ink mb-5">Bookings Summary</h3>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="rounded-xl border border-nd-line-soft bg-nd-panel px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-nd-dim font-bold mb-1">Active</p>
                <p className="text-xl font-extrabold text-nd-ink tabular-nums">{formatNumber(bookingsData?.active_count ?? 0)}</p>
              </div>
              <div className="rounded-xl border border-nd-line-soft bg-nd-panel px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-nd-dim font-bold mb-1">Expired</p>
                <p className="text-xl font-extrabold text-nd-ink tabular-nums">{formatNumber(bookingsData?.expired_count ?? 0)}</p>
              </div>
            </div>
            <div className="rounded-xl border border-nd-line-soft bg-nd-panel px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-nd-dim font-bold mb-1">Revenue Summary</p>
              <p className="text-xl font-extrabold text-nd-ink tabular-nums">{formatCurrency(bookingsData?.revenue_summary ?? 0)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border border-nd-line rounded-2xl p-6 animate-nd-up">
            <h3 className="font-nd-sans font-bold text-lg text-nd-ink mb-5">User Growth Trends</h3>
            <div className="space-y-2">
              {(usersData?.growth_trends ?? []).slice(0, 10).map((trend, index) => (
                <div key={`${trend.date}-${index}`} className="flex items-center justify-between rounded-xl border border-nd-line-soft bg-white px-3 py-2">
                  <span className="text-sm text-nd-ink">{trend.date}</span>
                  <span className="text-xs text-nd-dim tabular-nums">
                    Active: {formatNumber(trend.active_users ?? 0)} • New: {formatNumber(trend.new_users ?? 0)}
                  </span>
                </div>
              ))}
              {(usersData?.growth_trends ?? []).length === 0 && (
                <p className="text-sm text-nd-dim">No user growth data available.</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-nd-line rounded-2xl p-6 animate-nd-up">
            <h3 className="font-nd-sans font-bold text-lg text-nd-ink mb-5">Feedback Summary</h3>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="rounded-xl border border-nd-line-soft bg-nd-panel px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-nd-dim font-bold mb-1">Overall Avg Rating</p>
                <p className="text-xl font-extrabold text-nd-ink tabular-nums">{(feedbackData?.overall_avg_rating ?? 0).toFixed(2)}</p>
              </div>
              <div className="rounded-xl border border-nd-line-soft bg-nd-panel px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-nd-dim font-bold mb-1">Total Feedback</p>
                <p className="text-xl font-extrabold text-nd-ink tabular-nums">{formatNumber(feedbackData?.total_feedback ?? 0)}</p>
              </div>
            </div>

            <div className="space-y-2">
              {(feedbackData?.influencer_feedback ?? []).map((item, index) => (
                <div key={`${item.influencer_id || item.influencer_name || 'feedback'}-${index}`} className="flex items-center justify-between rounded-xl border border-nd-line-soft bg-white px-3 py-2">
                  <span className="text-sm text-nd-ink font-medium">{item.influencer_name || item.influencer_id || 'Influencer'}</span>
                  <span className="text-xs text-nd-dim tabular-nums">{(item.avg_rating ?? 0).toFixed(2)} ★ • {formatNumber(item.total_feedback ?? item.feedback_count ?? 0)} reviews</span>
                </div>
              ))}
              {(feedbackData?.influencer_feedback ?? []).length === 0 && (
                <p className="text-sm text-nd-dim">No feedback aggregates available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-nd-line rounded-2xl p-6 animate-nd-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-nd-sans font-bold text-lg text-nd-ink">
                {selectedInfId ? `Influencer: ${infDetail?.influencer_name || selectedInfId}` : 'Influencer Performance'}
              </h3>
              {selectedInfId && (
                <button onClick={handleInfBack} className="text-xs text-nd-dim hover:text-nd-ink transition-colors underline underline-offset-2 cursor-pointer">Back</button>
              )}
            </div>

            {selectedInfId ? (
              infDetailLoading ? (
                <div className="flex items-center gap-3 py-6">
                  <div className="w-4 h-4 border-2 border-nd-line border-t-nd-accent rounded-full animate-spin" />
                  <p className="text-sm text-nd-dim">Loading details...</p>
                </div>
              ) : infDetailError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{infDetailError}</div>
              ) : infDetail ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-nd-panel border border-nd-line-soft p-3 text-center">
                      <p className="text-lg font-extrabold text-nd-ink">{infDetail.total_sessions}</p>
                      <p className="text-[10px] text-nd-dim">Sessions</p>
                    </div>
                    <div className="rounded-xl bg-nd-panel border border-nd-line-soft p-3 text-center">
                      <p className="text-lg font-extrabold text-nd-ink">{infDetail.total_minutes} min</p>
                      <p className="text-[10px] text-nd-dim">Minutes</p>
                    </div>
                    <div className="rounded-xl bg-nd-panel border border-nd-line-soft p-3 text-center">
                      <p className="text-lg font-extrabold text-nd-ink">₹{(infDetail.total_revenue ?? 0).toLocaleString()}</p>
                      <p className="text-[10px] text-nd-dim">Revenue</p>
                    </div>
                    <div className="rounded-xl bg-nd-panel border border-nd-line-soft p-3 text-center">
                      <p className="text-lg font-extrabold text-nd-ink">{infDetail.avg_rating?.toFixed(1) ?? '—'}</p>
                      <p className="text-[10px] text-nd-dim">Rating</p>
                    </div>
                  </div>
                  {infDetail.daily_usage?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-nd-dim font-semibold">Daily Usage</p>
                      {infDetail.daily_usage.slice(0, 7).map((day, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-nd-panel px-3 py-1.5 text-xs">
                          <span className="text-nd-muted">{day.date}</span>
                          <span className="text-nd-dim">{day.sessions} sessions / {day.minutes} min</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null
            ) : (
              <div className="space-y-2">
                {(influencersData?.influencers ?? []).map((item, index) => (
                  <button
                    key={`${item.influencer_id || item.influencer_name || 'influencer'}-${index}`}
                    onClick={() => item.influencer_id && handleInfClick(item.influencer_id)}
                    disabled={!item.influencer_id}
                    className="w-full flex items-center justify-between rounded-xl border border-nd-line-soft bg-white px-3 py-2 hover:bg-nd-panel hover:border-nd-accent/30 transition-all text-left cursor-pointer disabled:cursor-default"
                  >
                    <span className="text-sm text-nd-ink font-medium">{item.influencer_name || item.influencer_id || 'Influencer'}</span>
                    <span className="text-xs text-nd-dim tabular-nums">
                      Sessions: {formatNumber(item.sessions ?? item.calls ?? 0)} • Rating: {(item.avg_rating ?? item.ratings ?? 0).toFixed(2)} • {formatCurrency(item.revenue ?? 0)}
                    </span>
                  </button>
                ))}
                {(influencersData?.influencers ?? []).length === 0 && (
                  <p className="text-sm text-nd-dim">No influencer performance data available.</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-white border border-nd-line rounded-2xl p-6 animate-nd-up">
            <h3 className="font-nd-sans font-bold text-lg text-nd-ink mb-5">Recent Bookings</h3>
            <div className="space-y-2">
              {recentBookings.map((booking, index) => (
                <div key={`${booking.id}-${index}`} className="rounded-xl border border-nd-line-soft bg-white px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-nd-ink font-medium">{booking.user_name || 'User'} • {booking.influencer_name || 'Influencer'}</span>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${bookingStatusClass(booking.status)}`}>
                      {booking.status || 'unknown'}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-nd-dim tabular-nums">
                    Duration: {formatNumber(booking.duration_minutes ?? 0)} min • Amount: {formatCurrency(booking.amount ?? 0)} • {formatDate(booking.created_at)}
                  </div>
                </div>
              ))}
              {recentBookings.length === 0 && (
                <p className="text-sm text-nd-dim">No recent bookings available.</p>
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
