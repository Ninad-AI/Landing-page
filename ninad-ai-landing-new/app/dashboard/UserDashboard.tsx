'use client';

import React from 'react';
import Link from 'next/link';

export default function UserDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up delay-100">
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

        {/* Placeholder bookings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-white">P</div>
              <div>
                <div className="text-sm font-semibold text-white">Pawan Kumar</div>
                <div className="text-xs text-white/30">15 min session</div>
              </div>
            </div>
            <span className="text-xs font-bold text-green-400/80 px-2 py-1 rounded-full bg-green-500/10">Completed</span>
          </div>
          <p className="text-xs text-white/25 text-center pt-2">
            No more sessions to display
          </p>
        </div>
      </div>
    </div>
  );
}
