'use client';

import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../lib/api';
import { useAuthStore } from '../lib/stores';
import type {
  AnalyticsUsageResponse,
  AnalyticsInfluencersResponse,
  AnalyticsFeedbackResponse,
  InfluencerPerformance,
  InfluencerFeedbackAggregate,
} from '../lib/types';

/* ── helpers ─────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  icon,
  accent = 'primary',
  loading = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: 'primary' | 'cyan' | 'amber' | 'emerald';
  loading?: boolean;
}) {
  const ring: Record<string, string> = {
    primary: 'border-primary/25 hover:border-primary/50 hover:shadow-[0_0_28px_rgba(97,37,216,0.18)]',
    cyan: 'border-accent-blue/20 hover:border-accent-blue/45 hover:shadow-[0_0_28px_rgba(0,169,255,0.15)]',
    amber: 'border-amber-500/20 hover:border-amber-400/45 hover:shadow-[0_0_28px_rgba(245,158,11,0.15)]',
    emerald: 'border-emerald-500/20 hover:border-emerald-400/45 hover:shadow-[0_0_28px_rgba(16,185,129,0.15)]',
  };
  const iconBg: Record<string, string> = {
    primary: 'bg-primary/20 text-primary-light',
    cyan: 'bg-accent-blue/15 text-accent-cyan',
    amber: 'bg-amber-500/15 text-amber-300',
    emerald: 'bg-emerald-500/15 text-emerald-300',
  };

  return (
    <div className={`glass border rounded-2xl p-4 sm:p-6 transition-all duration-300 ${ring[accent]}`}>
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center ${iconBg[accent]}`}>
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="space-y-2 mt-1">
          <div className="h-6 w-20 rounded-lg bg-white/10 animate-pulse" />
          <div className="h-3 w-14 rounded bg-white/5 animate-pulse" />
        </div>
      ) : (
        <>
          <p className="font-sans font-extrabold text-xl sm:text-2xl text-white tracking-tight">{value}</p>
          <p className="text-xs sm:text-sm font-semibold text-white/55 mt-1">{label}</p>
          {sub && <p className="text-[10px] sm:text-xs text-white/30 mt-0.5">{sub}</p>}
        </>
      )}
    </div>
  );
}

function StarRating({ rating }: { rating?: number }) {
  const r = rating ?? 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(r) ? 'text-amber-400' : 'text-white/15'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1.5 text-xs text-white/50">{r > 0 ? r.toFixed(1) : '—'}</span>
    </div>
  );
}

/* ── main component ───────────────────────────────────── */
export default function InfluencerDashboard() {
  const user = useAuthStore((s) => s.user);

  const [usage, setUsage] = useState<AnalyticsUsageResponse | null>(null);
  const [influencers, setInfluencers] = useState<AnalyticsInfluencersResponse | null>(null);
  const [feedback, setFeedback] = useState<AnalyticsFeedbackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [u, inf, fb] = await Promise.allSettled([
          analyticsApi.usage(),
          analyticsApi.influencers(),
          analyticsApi.feedback(),
        ]);

        if (cancelled) return;

        if (u.status === 'fulfilled') setUsage(u.value);
        if (inf.status === 'fulfilled') setInfluencers(inf.value);
        if (fb.status === 'fulfilled') setFeedback(fb.value);

        const allFailed = [u, inf, fb].every((r) => r.status === 'rejected');
        if (allFailed) setError('Unable to load analytics. Please try again.');
      } catch {
        if (!cancelled) setError('Unable to load analytics. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, []);

  /* Robust ID matcher: handles "influencer_13" vs "13", "13" vs "13", etc.
     Also falls back to case-insensitive name matching. */
  function matchesMe(
    recordId?: string,
    recordName?: string,
  ): boolean {
    if (!user) return false;
    // Exact ID match
    if (recordId && user.id && recordId === user.id) return true;
    // Strip non-digit prefix (e.g. "influencer_13" → "13")
    if (recordId && user.id) {
      const numericPart = recordId.replace(/^\D+/, '');
      if (numericPart && numericPart === user.id) return true;
      // Also handle user.id having a prefix
      const userNumeric = user.id.replace(/^\D+/, '');
      if (userNumeric && numericPart && numericPart === userNumeric) return true;
    }
    // Case-insensitive name match
    if (recordName && user.name) {
      return recordName.trim().toLowerCase() === user.name.trim().toLowerCase();
    }
    return false;
  }

  /* find this influencer's own record if available */
  const myRecord: InfluencerPerformance | undefined = influencers?.influencers?.find(
    (inf) => matchesMe(inf.influencer_id, inf.influencer_name)
  );
  const myFeedback: InfluencerFeedbackAggregate | undefined = feedback?.influencer_feedback?.find(
    (fb) => matchesMe(fb.influencer_id, fb.influencer_name)
  );

  const totalCalls = myRecord?.calls ?? myRecord?.sessions ?? usage?.total_calls ?? 0;
  const totalMinutes = myRecord?.minutes ?? usage?.minutes_used ?? 0;
  const avgRating = myRecord?.avg_rating ?? myFeedback?.avg_rating;
  const totalFeedback = myFeedback?.total_feedback ?? myFeedback?.feedback_count ?? 0;
  const revenue = myRecord?.revenue;

  return (
    <div className="animate-fade-in-up delay-100 space-y-8">
      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-5 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Calls"
          value={loading ? '—' : totalCalls.toLocaleString()}
          sub="Voice sessions"
          accent="primary"
          loading={loading}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          }
        />
        <StatCard
          label="Minutes Used"
          value={loading ? '—' : `${totalMinutes.toLocaleString()} min`}
          sub="Across all sessions"
          accent="cyan"
          loading={loading}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Avg Rating"
          value={loading ? '—' : (avgRating != null ? avgRating.toFixed(1) + ' ★' : '—')}
          sub={totalFeedback > 0 ? `${totalFeedback} reviews` : 'No reviews yet'}
          accent="amber"
          loading={loading}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
        />
        <StatCard
          label="Revenue"
          value={loading ? '—' : (revenue != null ? `₹${revenue.toLocaleString()}` : '—')}
          sub="Earned from sessions"
          accent="emerald"
          loading={loading}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Influencer Leaderboard + Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Influencer Breakdown */}
        <div className="glass border border-white/15 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-sans font-bold text-base text-white">Creator Performance</h3>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : !myRecord ? (
            <p className="text-sm text-white/30 text-center py-6">No performance data available yet.</p>
          ) : (
            <div className="space-y-4">
              {/* My profile card */}
              <div className="flex items-center gap-4 p-4 rounded-xl border border-primary/35 bg-primary/10">
                <div className="w-12 h-12 rounded-full bg-primary/25 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-white truncate">
                    {myRecord.influencer_name || user?.name || 'You'}
                  </p>
                  <p className="text-xs text-white/45 mt-0.5">
                    {(myRecord.calls ?? myRecord.sessions ?? 0)} calls &bull; {myRecord.minutes ?? 0} min
                  </p>
                </div>
                <StarRating rating={myRecord.avg_rating} />
              </div>

              {/* Stats breakdown */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-xl bg-white/5 border border-white/8 p-2 sm:p-3 text-center">
                  <p className="font-extrabold text-base sm:text-lg text-white">{myRecord.calls ?? myRecord.sessions ?? 0}</p>
                  <p className="text-[10px] sm:text-[11px] text-white/40 mt-0.5">Calls</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/8 p-2 sm:p-3 text-center">
                  <p className="font-extrabold text-base sm:text-lg text-white">{myRecord.minutes ?? 0}</p>
                  <p className="text-[10px] sm:text-[11px] text-white/40 mt-0.5">Minutes</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/8 p-2 sm:p-3 text-center">
                  <p className="font-extrabold text-base sm:text-lg text-white">
                    {myRecord.avg_rating != null ? myRecord.avg_rating.toFixed(1) : '—'}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-white/40 mt-0.5">Avg Rating</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Summary */}
        <div className="glass border border-white/15 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-sans font-bold text-base text-white">Feedback Overview</h3>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Overall */}
              {feedback?.overall_avg_rating != null && (
                <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/8">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Platform Average</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-extrabold text-white">
                      {feedback.overall_avg_rating.toFixed(1)}
                    </span>
                    <div>
                      <StarRating rating={feedback.overall_avg_rating} />
                      <p className="text-xs text-white/35 mt-0.5">
                        {feedback.total_feedback ?? 0} total reviews
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!feedback?.influencer_feedback?.length ? (
                <p className="text-sm text-white/30 text-center py-4">No feedback data available.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {feedback.influencer_feedback.map((fb, i) => {
                    const isMe = fb.influencer_id === user?.id || fb.influencer_name === user?.name;
                    const count = fb.total_feedback ?? fb.feedback_count ?? 0;
                    return (
                      <div
                        key={fb.influencer_id ?? i}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                          isMe
                            ? 'border-amber-500/30 bg-amber-500/8'
                            : 'border-white/5 bg-white/3 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {fb.influencer_name || 'Creator'}
                            {isMe && <span className="ml-1.5 text-[10px] text-amber-400 font-bold">(You)</span>}
                          </p>
                          <p className="text-xs text-white/35">{count} review{count !== 1 ? 's' : ''}</p>
                        </div>
                        <StarRating rating={fb.avg_rating} />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Usage Breakdown from /analytics/usage */}
      {!loading && usage && (
        <div className="glass border border-white/15 rounded-2xl p-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-accent-blue/15 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-sans font-bold text-base text-white">Platform Usage</h3>
            <span className="ml-auto text-[11px] sm:text-xs text-white/30 font-mono whitespace-nowrap">
              {usage.total_calls} calls • {usage.minutes_used} min
            </span>
          </div>

          {(() => {
            const myUsage = usage.influencer_breakdown?.find(
              (row) => matchesMe(row.influencer_id, row.influencer_name)
            );

            if (!myUsage) {
              return <p className="text-sm text-white/30 text-center py-4">No usage data available for your account.</p>;
            }

            const pct = usage.total_calls > 0
              ? ((myUsage.calls / usage.total_calls) * 100).toFixed(1)
              : '0.0';
            const barWidth = Math.max(4, Number(pct) * 2);

            return (
              <div className="space-y-4">
                {/* My usage stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="rounded-xl bg-accent-blue/8 border border-accent-blue/20 p-2.5 sm:p-4 text-center">
                    <p className="font-extrabold text-lg sm:text-xl text-white">{myUsage.calls.toLocaleString()}</p>
                    <p className="text-[10px] sm:text-[11px] text-white/40 mt-0.5">Total Calls</p>
                  </div>
                  <div className="rounded-xl bg-accent-blue/8 border border-accent-blue/20 p-2.5 sm:p-4 text-center">
                    <p className="font-extrabold text-lg sm:text-xl text-white">{myUsage.minutes.toLocaleString()}</p>
                    <p className="text-[10px] sm:text-[11px] text-white/40 mt-0.5">Minutes</p>
                  </div>
                  <div className="rounded-xl bg-accent-blue/8 border border-accent-blue/20 p-2.5 sm:p-4 text-center">
                    <p className="font-extrabold text-lg sm:text-xl text-accent-cyan">{pct}%</p>
                    <p className="text-[10px] sm:text-[11px] text-white/40 mt-0.5">Share</p>
                  </div>
                </div>

                {/* Share bar */}
                <div>
                  <div className="flex justify-between text-xs text-white/35 mb-1.5">
                    <span>Your usage share</span>
                    <span className="font-mono">{pct}% of {usage.total_calls} total calls</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/8 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-cyan transition-all duration-700"
                      style={{ width: `${Math.min(100, Number(pct))}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
