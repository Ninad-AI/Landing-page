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
    primary: 'border-nd-line hover:border-nd-accent/40',
    cyan: 'border-nd-line hover:border-blue-300',
    amber: 'border-nd-line hover:border-amber-300',
    emerald: 'border-nd-line hover:border-emerald-300',
  };
  const iconBg: Record<string, string> = {
    primary: 'bg-nd-tint text-nd-accent',
    cyan: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className={`bg-white border rounded-2xl p-4 sm:p-6 transition-all duration-300 ${ring[accent]}`}>
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center ${iconBg[accent]}`}>
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="space-y-2 mt-1">
          <div className="h-6 w-20 rounded-lg bg-nd-panel animate-pulse" />
          <div className="h-3 w-14 rounded bg-nd-panel animate-pulse" />
        </div>
      ) : (
        <>
          <p className="font-nd-sans font-extrabold text-xl sm:text-2xl text-nd-ink tracking-tight">{value}</p>
          <p className="text-xs sm:text-sm font-semibold text-nd-muted mt-1">{label}</p>
          {sub && <p className="text-[10px] sm:text-xs text-nd-dim mt-0.5">{sub}</p>}
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
          className={`w-3.5 h-3.5 ${i <= Math.round(r) ? 'text-amber-400' : 'text-nd-line'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1.5 text-xs text-nd-dim">{r > 0 ? r.toFixed(1) : '—'}</span>
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

  /* Match a record against the logged-in influencer.
     Prefers user.influencer_id from the auth response.
     Falls back to legacy matching by user.id and name for backward compat. */
  function matchesMe(
    recordId?: string,
    recordName?: string,
  ): boolean {
    if (!user) return false;
    if (user.influencer_id && recordId && recordId === user.influencer_id) return true;
    if (recordId && user.id && recordId === user.id) return true;
    if (recordId && user.id) {
      const numericPart = recordId.replace(/^\D+/, '');
      if (numericPart && numericPart === user.id) return true;
      const userNumeric = user.id.replace(/^\D+/, '');
      if (userNumeric && numericPart && numericPart === userNumeric) return true;
    }
    if (recordName && user.name) {
      return recordName.trim().toLowerCase() === user.name.trim().toLowerCase();
    }
    return false;
  }

  /* find this influencer's own record.
     Backend now filters data for influencers, so there will usually be just one match. */
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
    <div className="animate-nd-up space-y-8">
      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Your Calls"
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
          label="Your Minutes"
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
          label="Your Rating"
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
          label="Your Revenue"
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
        <div className="bg-white border border-nd-line rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-nd-tint flex items-center justify-center">
              <svg className="w-4 h-4 text-nd-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-nd-sans font-bold text-base text-nd-ink">Your Performance</h3>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-nd-panel animate-pulse" />
              ))}
            </div>
          ) : !myRecord ? (
            <p className="text-sm text-nd-dim text-center py-6">No performance data available yet.</p>
          ) : (
            <div className="space-y-4">
              {/* My profile card */}
              <div className="flex items-center gap-4 p-4 rounded-xl border border-nd-accent/25 bg-nd-tint">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-nd-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-nd-ink truncate">
                    {myRecord.influencer_name || user?.name || 'You'}
                  </p>
                  <p className="text-xs text-nd-muted mt-0.5">
                    {(myRecord.calls ?? myRecord.sessions ?? 0)} calls &bull; {myRecord.minutes ?? 0} min
                  </p>
                </div>
                <StarRating rating={myRecord.avg_rating} />
              </div>

              {/* Stats breakdown */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-xl bg-nd-panel border border-nd-line-soft p-2 sm:p-3 text-center">
                  <p className="font-extrabold text-base sm:text-lg text-nd-ink">{myRecord.calls ?? myRecord.sessions ?? 0}</p>
                  <p className="text-[10px] sm:text-[11px] text-nd-dim mt-0.5">Calls</p>
                </div>
                <div className="rounded-xl bg-nd-panel border border-nd-line-soft p-2 sm:p-3 text-center">
                  <p className="font-extrabold text-base sm:text-lg text-nd-ink">{myRecord.minutes ?? 0}</p>
                  <p className="text-[10px] sm:text-[11px] text-nd-dim mt-0.5">Minutes</p>
                </div>
                <div className="rounded-xl bg-nd-panel border border-nd-line-soft p-2 sm:p-3 text-center">
                  <p className="font-extrabold text-base sm:text-lg text-nd-ink">
                    {myRecord.avg_rating != null ? myRecord.avg_rating.toFixed(1) : '—'}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-nd-dim mt-0.5">Avg Rating</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Summary — personal view */}
        <div className="bg-white border border-nd-line rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-nd-sans font-bold text-base text-nd-ink">Your Feedback</h3>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-nd-panel animate-pulse" />
              ))}
            </div>
          ) : myFeedback ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl border border-amber-200 bg-amber-50">
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-nd-ink">{myFeedback.avg_rating?.toFixed(1) ?? '—'}</p>
                  <p className="text-[10px] text-nd-dim mt-0.5">avg rating</p>
                </div>
                <div className="flex-1">
                  <StarRating rating={myFeedback.avg_rating} />
                  <p className="text-xs text-nd-muted mt-1">
                    {(myFeedback.total_feedback ?? myFeedback.feedback_count ?? 0)} review{(myFeedback.total_feedback ?? myFeedback.feedback_count ?? 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          ) : !feedback?.influencer_feedback?.length && feedback?.overall_avg_rating != null ? (
            <div className="p-4 rounded-xl bg-nd-panel border border-nd-line-soft text-center">
              <p className="text-xs text-nd-dim uppercase tracking-wider mb-1">Platform Average</p>
              <p className="text-3xl font-extrabold text-nd-ink">{feedback.overall_avg_rating.toFixed(1)}</p>
              <StarRating rating={feedback.overall_avg_rating} />
            </div>
          ) : (
            <p className="text-sm text-nd-dim text-center py-6">No feedback data available yet.</p>
          )}
        </div>
      </div>

      {/* Usage Breakdown from /analytics/usage — personal view */}
      {!loading && usage && (
        <div className="bg-white border border-nd-line rounded-2xl p-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-nd-sans font-bold text-base text-nd-ink">Your Usage</h3>
          </div>

          {(() => {
            const myUsage = usage.influencer_breakdown?.find(
              (row) => matchesMe(row.influencer_id, row.influencer_name)
            );

            if (!myUsage) {
              return <p className="text-sm text-nd-dim text-center py-4">No usage data available for your account.</p>;
            }

            return (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-center">
                  <p className="font-extrabold text-xl sm:text-2xl text-nd-ink">{myUsage.calls.toLocaleString()}</p>
                  <p className="text-[10px] sm:text-xs text-nd-dim mt-1">Total Calls</p>
                </div>
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-center">
                  <p className="font-extrabold text-xl sm:text-2xl text-nd-ink">{myUsage.minutes.toLocaleString()}</p>
                  <p className="text-[10px] sm:text-xs text-nd-dim mt-1">Minutes</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
