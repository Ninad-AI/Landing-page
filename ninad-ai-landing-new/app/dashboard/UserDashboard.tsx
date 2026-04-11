'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { paymentApi } from '../lib/api';
import type { UserBooking } from '../lib/types';

function formatDate(value?: string): string {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function bookingStatusClass(status?: string): string {
  const normalized = status?.toLowerCase();
  if (normalized === 'active' || normalized === 'pending') return 'text-emerald-200 bg-emerald-500/15';
  if (normalized === 'completed') return 'text-cyan-200 bg-cyan-500/15';
  if (normalized === 'expired') return 'text-amber-200 bg-amber-500/15';
  if (normalized === 'cancelled') return 'text-rose-200 bg-rose-500/15';
  return 'text-white/70 bg-white/10';
}

function StatPill({
  label,
  value,
  accent = 'default',
}: {
  label: string;
  value: string | number;
  accent?: 'primary' | 'cyan' | 'amber' | 'default';
}) {
  const colors: Record<string, string> = {
    primary: 'bg-primary/15 border-primary/25 text-primary-light',
    cyan: 'bg-accent-blue/12 border-accent-blue/25 text-accent-cyan',
    amber: 'bg-amber-500/12 border-amber-400/25 text-amber-300',
    default: 'bg-white/5 border-white/10 text-white/70',
  };
  return (
    <div className={`rounded-xl border px-3 py-2.5 sm:px-4 sm:py-3 ${colors[accent]}`}>
      <p className="font-extrabold text-lg sm:text-xl tracking-tight truncate">{value}</p>
      <p className="text-[10px] sm:text-xs opacity-70 mt-0.5 truncate">{label}</p>
    </div>
  );
}

export default function UserDashboard() {
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadBookings = async () => {
      setIsLoadingBookings(true);
      setBookingsError(null);

      try {
        const data = await paymentApi.getMyBookings();
        if (!cancelled) {
          setBookings(data);
        }
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to load bookings right now.';
        setBookingsError(message);
      } finally {
        if (!cancelled) {
          setIsLoadingBookings(false);
        }
      }
    };

    void loadBookings();

    return () => {
      cancelled = true;
    };
  }, []);

  const recentBookings = useMemo(() => bookings.slice(0, 6), [bookings]);

  /* ── derived stats ───────────────────────────────────────── */
  const totalBookings = bookings.length;
  const totalMinutes = useMemo(
    () => bookings.reduce((acc, b) => acc + (b.duration_minutes ?? 0), 0),
    [bookings]
  );
  const completedCount = useMemo(
    () => bookings.filter((b) => b.status?.toLowerCase() === 'completed').length,
    [bookings]
  );

  return (
    <div className="space-y-8 animate-fade-in-up delay-100">
      {/* Quick-stats row (shown once bookings load) */}
      {!isLoadingBookings && !bookingsError && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatPill label="Total Sessions" value={totalBookings} accent="primary" />
          <StatPill label="Minutes Booked" value={`${totalMinutes} min`} accent="cyan" />
          <StatPill label="Completed" value={completedCount} accent="default" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Voice Session */}
        <div className="glass border border-white/15 rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <svg className="w-6 h-6 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-sans font-bold text-lg text-white">Start Voice Session</h3>
              <p className="text-sm text-white/40">Talk to your favourite creators</p>
            </div>
          </div>
          <Link
            href="/creators"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-sans font-bold text-sm transition-all duration-300 hover:bg-primary-light hover:shadow-[0_0_20px_rgba(97,37,216,0.4)] btn-primary"
          >
            Browse Creators
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* My Bookings */}
        <div className="glass border border-white/15 rounded-2xl p-8 hover:border-accent-blue/30 transition-all duration-300 group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent-blue/15 flex items-center justify-center group-hover:bg-accent-blue/25 transition-colors">
              <svg className="w-6 h-6 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-sans font-bold text-lg text-white">My Bookings</h3>
              <p className="text-sm text-white/40">View your session history</p>
            </div>
          </div>

          <div className="space-y-3">
            {isLoadingBookings && (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 rounded-lg bg-white/5 animate-pulse" />
                ))}
              </>
            )}

            {!isLoadingBookings && bookingsError && (
              <p className="text-xs text-rose-200 text-center py-4">{bookingsError}</p>
            )}

            {!isLoadingBookings && !bookingsError && recentBookings.map((booking) => (
              <div key={booking.id} className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{booking.influencer_name || 'Creator'}</div>
                    <div className="text-xs text-white/35 mt-1">
                      {booking.duration_minutes} min
                      {booking.amount != null && ` • ₹${booking.amount}`}
                      {' • '}
                      {formatDate(booking.created_at)}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full shrink-0 ${bookingStatusClass(booking.status)}`}>
                    {booking.status || 'unknown'}
                  </span>
                </div>
              </div>
            ))}

            {!isLoadingBookings && !bookingsError && recentBookings.length === 0 && (
              <p className="text-xs text-white/25 text-center pt-2">No bookings found yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
