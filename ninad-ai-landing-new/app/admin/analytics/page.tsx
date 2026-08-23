'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { analyticsApi } from '../../lib/api';
import type {
  AnalyticsBookingsResponse,
  AnalyticsDashboardResponse,
  AnalyticsInfluencersResponse,
  AnalyticsRecentBooking,
  AnalyticsUsageResponse,
  AnalyticsUsersResponse,
  InfluencerUsageDetail,
} from '../../lib/types';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type Tab = 'usage' | 'bookings';
type UsageDailyPoint = { date: string; sessions: number; minutes: number };
type BookingDailyPoint = { date: string; bookings: number; revenue: number };

function toDayKey(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function toDisplayDate(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function buildDailyAnalytics(recentBookings: AnalyticsRecentBooking[]): {
  usageDaily: UsageDailyPoint[];
  bookingDaily: BookingDailyPoint[];
} {
  const byDay = new Map<string, { date: string; sessions: number; minutes: number; bookings: number; revenue: number }>();

  for (const booking of recentBookings) {
    const sourceDate = booking.created_at || booking.expires_at;
    const dayKey = toDayKey(sourceDate);
    const date = toDisplayDate(sourceDate);

    if (!dayKey || !date) continue;

    const existing = byDay.get(dayKey) ?? {
      date,
      sessions: 0,
      minutes: 0,
      bookings: 0,
      revenue: 0,
    };

    existing.sessions += 1;
    existing.bookings += 1;
    existing.minutes += Math.max(0, booking.duration_minutes ?? 0);
    existing.revenue += Math.max(0, booking.amount ?? 0);

    byDay.set(dayKey, existing);
  }

  const rows = [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, value]) => value);

  return {
    usageDaily: rows.map((row) => ({
      date: row.date,
      sessions: row.sessions,
      minutes: row.minutes,
    })),
    bookingDaily: rows.map((row) => ({
      date: row.date,
      bookings: row.bookings,
      revenue: row.revenue,
    })),
  };
}

// ─── Custom Tooltip ───
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-xl border border-nd-line"
      style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <p className="text-xs text-nd-dim mb-1 font-semibold">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
}

function AnalyticsContent() {
  const [activeTab, setActiveTab] = useState<Tab>('usage');
  const [dashboard, setDashboard] = useState<AnalyticsDashboardResponse | null>(null);
  const [usage, setUsage] = useState<AnalyticsUsageResponse | null>(null);
  const [bookings, setBookings] = useState<AnalyticsBookingsResponse | null>(null);
  const [users, setUsers] = useState<AnalyticsUsersResponse | null>(null);
  const [influencers, setInfluencers] = useState<AnalyticsInfluencersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedInfluencerId, setSelectedInfluencerId] = useState<string | null>(null);
  const [influencerDetail, setInfluencerDetail] = useState<InfluencerUsageDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const handleCreatorClick = async (influencerId: string) => {
    setSelectedInfluencerId(influencerId);
    setDetailLoading(true);
    setDetailError(null);
    setInfluencerDetail(null);
    try {
      const detail = await analyticsApi.influencerUsage(influencerId);
      setInfluencerDetail(detail);
    } catch {
      setDetailError('Failed to load influencer details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBackToAll = () => {
    setSelectedInfluencerId(null);
    setInfluencerDetail(null);
    setDetailError(null);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [dashResult, usageResult, bookingsResult, usersResult, influencersResult] = await Promise.allSettled([
          analyticsApi.dashboard(),
          analyticsApi.usage(),
          analyticsApi.bookings(),
          analyticsApi.users(),
          analyticsApi.influencers(),
        ]);

        if (cancelled) return;

        if (dashResult.status === 'fulfilled') setDashboard(dashResult.value);
        if (usageResult.status === 'fulfilled') setUsage(usageResult.value);
        if (bookingsResult.status === 'fulfilled') setBookings(bookingsResult.value);
        if (usersResult.status === 'fulfilled') setUsers(usersResult.value);
        if (influencersResult.status === 'fulfilled') setInfluencers(influencersResult.value);

        const allFailed =
          dashResult.status === 'rejected' &&
          usageResult.status === 'rejected' &&
          bookingsResult.status === 'rejected' &&
          usersResult.status === 'rejected' &&
          influencersResult.status === 'rejected';

        if (allFailed) {
          setError('Unable to load analytics data right now.');
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load analytics data right now.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const { usageDaily, bookingDaily } = useMemo(
    () => buildDailyAnalytics(bookings?.recent_bookings ?? []),
    [bookings?.recent_bookings]
  );

  const topCreators = useMemo(() => {
    const rows = influencers?.influencers ?? [];

    return rows
      .map((creator) => ({
        influencer_id: creator.influencer_id || '',
        name: creator.influencer_name || 'Creator',
        bookings: creator.calls ?? creator.sessions ?? 0,
        revenue: creator.revenue ?? 0,
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
  }, [influencers]);

  const totalSessions = dashboard?.total_sessions ?? usage?.total_calls ?? 0;
  const totalMinutes = usage?.minutes_used ?? 0;
  const activeUsers = dashboard?.active_users ?? users?.active_users ?? 0;
  const avgDuration =
    dashboard?.avg_duration != null && Number.isFinite(dashboard.avg_duration)
      ? `${dashboard.avg_duration.toFixed(1)}m`
      : '—';

  const totalBookings = (bookings?.active_count ?? 0) + (bookings?.expired_count ?? 0);
  const totalRevenue = bookings?.revenue_summary ?? dashboard?.revenue ?? 0;
  const conversionRate =
    totalBookings > 0 ? `${(((bookings?.active_count ?? 0) / totalBookings) * 100).toFixed(1)}%` : '0.0%';

  const usageStats = [
    { label: 'Total Sessions', value: totalSessions.toLocaleString() },
    { label: 'Total Minutes', value: totalMinutes.toLocaleString() },
    { label: 'Active Users', value: activeUsers.toLocaleString() },
    { label: 'Avg Duration', value: avgDuration },
  ];

  const bookingStats = [
    { label: 'Total Bookings', value: totalBookings.toLocaleString() },
    { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}` },
    { label: 'Conversion Rate', value: conversionRate },
  ];

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-nd-bg">
      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 max-w-[1400px] pt-28 sm:pt-32 md:pt-40 pb-16 sm:pb-20 md:pb-24">
        {/* Page Header */}
        <div className="mb-8 animate-nd-up">
          <h1 className="font-display text-3xl md:text-5xl text-nd-ink tracking-tight mb-2">
            Analytics
          </h1>
          <p className="font-nd-sans text-base text-nd-dim">
            Platform usage metrics and booking insights
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-8 sm:mb-10 animate-nd-up overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('usage')}
            className={`px-6 py-2.5 rounded-xl font-nd-sans font-bold text-sm transition-all duration-300 cursor-pointer ${
              activeTab === 'usage'
                ? 'bg-nd-tint text-nd-accent-dark border border-nd-accent/30'
                : 'bg-white text-nd-dim border border-nd-line hover:text-nd-ink hover:border-nd-accent/30'
            }`}
          >
            Usage
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-2.5 rounded-xl font-nd-sans font-bold text-sm transition-all duration-300 cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-nd-tint text-nd-accent-dark border border-nd-accent/30'
                : 'bg-white text-nd-dim border border-nd-line hover:text-nd-ink hover:border-nd-accent/30'
            }`}
          >
            Bookings
          </button>
        </div>

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="space-y-6 animate-nd-up">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {usageStats.map((stat) => (
                <div key={stat.label} className="bg-white border border-nd-line rounded-2xl p-5">
                  <div className="text-[10px] text-nd-dim uppercase tracking-wider font-bold mb-1">{stat.label}</div>
                  <div className="font-nd-sans font-extrabold text-2xl text-nd-ink tabular-nums">
                    {isLoading ? '—' : stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Sessions Over Time */}
            <div className="bg-white border border-nd-line rounded-2xl p-6">
              <h3 className="font-nd-sans font-bold text-lg text-nd-ink mb-6">Sessions Over Time</h3>
              <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={usageDaily}>
                    <defs>
                      <linearGradient id="gradientSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6B4BA8" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6B4BA8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradientMinutes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9E3DA" />
                    <XAxis dataKey="date" tick={{ fill: '#918B99', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#918B99', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      stroke="#6B4BA8"
                      strokeWidth={2}
                      fill="url(#gradientSessions)"
                      dot={{ fill: '#6B4BA8', strokeWidth: 0, r: 3 }}
                      activeDot={{ r: 5, stroke: '#6B4BA8', strokeWidth: 2, fill: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>


          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-nd-up">
            {/* Booking Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {bookingStats.map((stat) => (
                <div key={stat.label} className="bg-white border border-nd-line rounded-2xl p-5">
                  <div className="text-[10px] text-nd-dim uppercase tracking-wider font-bold mb-1">{stat.label}</div>
                  <div className="font-nd-sans font-extrabold text-2xl text-nd-ink tabular-nums">
                    {isLoading ? '—' : stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            <div className="bg-white border border-nd-line rounded-2xl p-6">
              <h3 className="font-nd-sans font-bold text-lg text-nd-ink mb-6">Revenue Over Time</h3>
              <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingDaily}>
                    <defs>
                      <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8E76BE" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#6B4BA8" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9E3DA" />
                    <XAxis dataKey="date" tick={{ fill: '#918B99', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#918B99', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="url(#gradientRevenue)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bookings Chart + Top Creators  */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-nd-line rounded-2xl p-6">
                <h3 className="font-nd-sans font-bold text-lg text-nd-ink mb-6">Daily Bookings</h3>
                <div className="w-full h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={bookingDaily}>
                      <defs>
                        <linearGradient id="gradientBookings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E9E3DA" />
                      <XAxis dataKey="date" tick={{ fill: '#918B99', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#918B99', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="bookings"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fill="url(#gradientBookings)"
                        dot={{ fill: '#3B82F6', strokeWidth: 0, r: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-nd-line rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-nd-sans font-bold text-lg text-nd-ink">
                    {selectedInfluencerId ? `Creator: ${influencerDetail?.influencer_name || selectedInfluencerId}` : 'Top Creators'}
                  </h3>
                  {selectedInfluencerId && (
                    <button
                      onClick={handleBackToAll}
                      className="text-xs text-nd-dim hover:text-nd-ink transition-colors underline underline-offset-2 cursor-pointer"
                    >
                      Back to all
                    </button>
                  )}
                </div>

                {/* Drill-down detail view */}
                {selectedInfluencerId ? (
                  detailLoading ? (
                    <div className="flex items-center gap-3 py-6">
                      <div className="w-4 h-4 border-2 border-nd-line border-t-nd-accent rounded-full animate-spin" />
                      <p className="text-sm text-nd-dim">Loading influencer details...</p>
                    </div>
                  ) : detailError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{detailError}</div>
                  ) : influencerDetail ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-nd-panel border border-nd-line-soft p-3 text-center">
                          <p className="text-lg font-extrabold text-nd-ink">{influencerDetail.total_sessions}</p>
                          <p className="text-[10px] text-nd-dim">Sessions</p>
                        </div>
                        <div className="rounded-xl bg-nd-panel border border-nd-line-soft p-3 text-center">
                          <p className="text-lg font-extrabold text-nd-ink">{influencerDetail.total_minutes} min</p>
                          <p className="text-[10px] text-nd-dim">Minutes</p>
                        </div>
                        <div className="rounded-xl bg-nd-panel border border-nd-line-soft p-3 text-center">
                          <p className="text-lg font-extrabold text-nd-ink">₹{(influencerDetail.total_revenue ?? 0).toLocaleString()}</p>
                          <p className="text-[10px] text-nd-dim">Revenue</p>
                        </div>
                        <div className="rounded-xl bg-nd-panel border border-nd-line-soft p-3 text-center">
                          <p className="text-lg font-extrabold text-nd-ink">{influencerDetail.avg_rating?.toFixed(1) ?? '—'}</p>
                          <p className="text-[10px] text-nd-dim">Rating</p>
                        </div>
                      </div>
                      {influencerDetail.daily_usage?.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-nd-dim font-semibold">Daily Usage</p>
                          {influencerDetail.daily_usage.slice(0, 7).map((day, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg bg-nd-panel px-3 py-1.5 text-xs">
                              <span className="text-nd-muted">{day.date}</span>
                              <span className="text-nd-dim">{day.sessions} sessions / {day.minutes} min</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {influencerDetail.recent_bookings?.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-nd-dim font-semibold">Recent Bookings</p>
                          {influencerDetail.recent_bookings.slice(0, 5).map((b, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg bg-nd-panel px-3 py-1.5 text-xs">
                              <span className="text-nd-muted">{b.user_name || 'User'}</span>
                              <span className="text-nd-dim">{b.duration_minutes} min • {b.status}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null
                ) : (
                  /* Default top creators list */
                  <div className="space-y-4">
                    {topCreators.map((creator, i) => (
                      <button
                        key={creator.influencer_id || `creator-${i}`}
                        onClick={() => creator.influencer_id && handleCreatorClick(creator.influencer_id)}
                        disabled={!creator.influencer_id}
                        className="w-full flex items-center gap-4 p-3 rounded-xl bg-white border border-nd-line-soft hover:bg-nd-panel hover:border-nd-accent/30 transition-all text-left cursor-pointer disabled:cursor-default"
                      >
                        <div className="w-10 h-10 rounded-full bg-nd-tint flex items-center justify-center text-sm font-bold text-nd-accent shrink-0">
                          #{i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-nd-sans font-semibold text-sm text-nd-ink truncate">{creator.name}</div>
                          <div className="text-xs text-nd-dim">
                            {creator.bookings} bookings
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-nd-sans font-bold text-sm text-nd-ink">
                            ₹{(creator.revenue / 1000).toFixed(1)}k
                          </div>
                          <div className="text-[10px] text-nd-dim">revenue</div>
                        </div>
                      </button>
                    ))}
                    {!isLoading && topCreators.length === 0 && (
                      <div className="rounded-xl border border-nd-line bg-nd-panel px-4 py-3 text-sm text-nd-dim">
                        No creator analytics available yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}
