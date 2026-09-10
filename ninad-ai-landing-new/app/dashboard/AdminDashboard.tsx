'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { analyticsApi } from '../lib/api';
import type { AnalyticsDashboardResponse, AnalyticsBookingsResponse } from '../lib/types';

export default function AdminDashboard() {
  const [dash, setDash] = useState<AnalyticsDashboardResponse | null>(null);
  const [bookings, setBookings] = useState<AnalyticsBookingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [d, b] = await Promise.allSettled([
          analyticsApi.dashboard(),
          analyticsApi.bookings(),
        ]);
        if (cancelled) return;

        if (d.status === 'fulfilled') setDash(d.value);
        if (b.status === 'fulfilled') setBookings(b.value);

        const allFailed = d.status === 'rejected' && b.status === 'rejected';
        if (allFailed) setError('Unable to load analytics. Check network or permissions.');
      } catch {
        if (!cancelled) setError('Unable to load analytics.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, []);

  const stats = [
    {
      label: 'Total Sessions',
      value: dash?.total_sessions,
      icon: (
        <svg className="w-5 h-5 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      iconBg: 'bg-primary/20',
    },
    {
      label: 'Active Users',
      value: dash?.active_users,
      icon: (
        <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      iconBg: 'bg-emerald-500/15',
    },
    {
      label: 'Revenue',
      value: dash?.revenue != null ? `₹${dash.revenue.toLocaleString()}` : undefined,
      icon: (
        <svg className="w-5 h-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-accent-blue/15',
    },
    {
      label: 'Avg Duration',
      value: dash?.avg_duration != null ? `${dash.avg_duration.toFixed(1)} min` : undefined,
      icon: (
        <svg className="w-5 h-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-amber-500/15',
    },
    {
      label: 'Active Bookings',
      value: bookings?.active_count,
      icon: (
        <svg className="w-5 h-5 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      iconBg: 'bg-violet-500/15',
    },
    {
      label: 'Booking Revenue',
      value: bookings?.revenue_summary != null ? `₹${bookings.revenue_summary.toLocaleString()}` : undefined,
      icon: (
        <svg className="w-5 h-5 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      iconBg: 'bg-rose-500/15',
    },
  ];

  const adminLinks = [
    {
      href: '/admin/dashboard',
      title: 'Admin Dashboard',
      desc: 'Live provider load, recent bookings, system overview',
      icon: (
        <svg className="w-6 h-6 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      glow: 'hover:border-primary/40 hover:shadow-[0_0_30px_rgba(97,37,216,0.15)]',
    },
    {
      href: '/admin/analytics',
      title: 'Full Analytics',
      desc: 'Usage metrics, booking analytics, revenue charts',
      icon: (
        <svg className="w-6 h-6 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      glow: 'hover:border-accent-blue/40 hover:shadow-[0_0_30px_rgba(0,169,255,0.15)]',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up delay-100">
      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-5 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Live Stats Grid */}
      <div>
        <p className="text-xs uppercase tracking-widest text-white/30 font-semibold mb-4">
          Live Platform Stats
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass border border-white/10 rounded-2xl p-4 sm:p-5 hover:border-white/20 transition-all duration-300"
            >
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${s.iconBg} flex items-center justify-center mb-2 sm:mb-3`}>
                {s.icon}
              </div>
              {loading ? (
                <div className="h-7 w-16 sm:w-20 rounded-lg bg-white/10 animate-pulse mt-1" />
              ) : (
                <p className="font-sans font-extrabold text-lg sm:text-xl text-white tracking-tight">
                  {s.value ?? '—'}
                </p>
              )}
              <p className="text-[10px] sm:text-xs text-white/40 font-semibold mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Links */}
      <div>
        <p className="text-xs uppercase tracking-widest text-white/30 font-semibold mb-4">
          Admin Tools
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`glass border border-white/15 rounded-2xl p-8 transition-all duration-300 group ${item.glow}`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-sans font-bold text-lg text-white">{item.title}</h3>
                  <p className="text-sm text-white/40">{item.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-white/30 font-semibold uppercase tracking-wider group-hover:text-white/60 transition-colors">
                Open
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
