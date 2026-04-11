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
      className="rounded-xl px-4 py-3 shadow-xl border border-white/10"
      style={{
        background: 'rgba(15, 10, 30, 0.9)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <p className="text-xs text-white/50 mb-1 font-semibold">{label}</p>
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
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute left-[-24vw] top-[4vw] h-[clamp(260px,52vw,700px)] w-[clamp(260px,52vw,700px)] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(97,37,216,0.5)_0%,transparent_70%)]" />
        <div className="absolute right-[-20vw] bottom-[6vw] h-[clamp(220px,42vw,500px)] w-[clamp(220px,42vw,500px)] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(0,169,255,0.3)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 max-w-[1400px] pt-28 sm:pt-32 md:pt-40 pb-16 sm:pb-20 md:pb-24">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="font-sans font-extrabold text-3xl md:text-5xl text-white tracking-tight mb-2">
            Analytics
          </h1>
          <p className="font-sans text-base text-white/40">
            Platform usage metrics and booking insights
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/25 bg-rose-500/10 px-5 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-8 sm:mb-10 animate-fade-in-up delay-100 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('usage')}
            className={`px-6 py-2.5 rounded-xl font-sans font-bold text-sm transition-all duration-300 cursor-pointer ${
              activeTab === 'usage'
                ? 'bg-primary/20 text-primary-light border border-primary/30'
                : 'bg-white/5 text-white/50 border border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            Usage
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-2.5 rounded-xl font-sans font-bold text-sm transition-all duration-300 cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-primary/20 text-primary-light border border-primary/30'
                : 'bg-white/5 text-white/50 border border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            Bookings
          </button>
        </div>

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="space-y-6 animate-fade-in-up delay-200">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {usageStats.map((stat) => (
                <div key={stat.label} className="glass border border-white/10 rounded-2xl p-5">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1">{stat.label}</div>
                  <div className="font-sans font-extrabold text-2xl text-white tabular-nums">
                    {isLoading ? '—' : stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Sessions Over Time */}
            <div className="glass border border-white/10 rounded-2xl p-6">
              <h3 className="font-sans font-bold text-lg text-white mb-6">Sessions Over Time</h3>
              <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={usageDaily}>
                    <defs>
                      <linearGradient id="gradientSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6125d8" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6125d8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradientMinutes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00a9ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00a9ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      stroke="#6125d8"
                      strokeWidth={2}
                      fill="url(#gradientSessions)"
                      dot={{ fill: '#6125d8', strokeWidth: 0, r: 3 }}
                      activeDot={{ r: 5, stroke: '#6125d8', strokeWidth: 2, fill: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>


          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-fade-in-up delay-200">
            {/* Booking Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {bookingStats.map((stat) => (
                <div key={stat.label} className="glass border border-white/10 rounded-2xl p-5">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1">{stat.label}</div>
                  <div className="font-sans font-extrabold text-2xl text-white tabular-nums">
                    {isLoading ? '—' : stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            <div className="glass border border-white/10 rounded-2xl p-6">
              <h3 className="font-sans font-bold text-lg text-white mb-6">Revenue Over Time</h3>
              <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingDaily}>
                    <defs>
                      <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9968fa" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#6125d8" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="url(#gradientRevenue)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bookings Chart + Top Creators  */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass border border-white/10 rounded-2xl p-6">
                <h3 className="font-sans font-bold text-lg text-white mb-6">Daily Bookings</h3>
                <div className="w-full h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={bookingDaily}>
                      <defs>
                        <linearGradient id="gradientBookings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00a9ff" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#00a9ff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="bookings"
                        stroke="#00a9ff"
                        strokeWidth={2}
                        fill="url(#gradientBookings)"
                        dot={{ fill: '#00a9ff', strokeWidth: 0, r: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass border border-white/10 rounded-2xl p-6">
                <h3 className="font-sans font-bold text-lg text-white mb-6">Top Creators</h3>
                <div className="space-y-4">
                  {topCreators.map((creator, i) => (
                    <div key={creator.name} className="flex items-center gap-4 p-3 rounded-xl bg-white/3 border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light">
                        #{i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-sans font-semibold text-sm text-white">{creator.name}</div>
                        <div className="text-xs text-white/30">
                          {creator.bookings} bookings
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-sans font-bold text-sm text-white">
                          ₹{(creator.revenue / 1000).toFixed(1)}k
                        </div>
                        <div className="text-[10px] text-white/25">revenue</div>
                      </div>
                    </div>
                  ))}
                  {!isLoading && topCreators.length === 0 && (
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/45">
                      No creator analytics available yet.
                    </div>
                  )}
                </div>
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
