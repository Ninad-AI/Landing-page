'use client';

import React from 'react';

export default function InfluencerDashboard() {
  return (
    <div className="animate-fade-in-up delay-100 space-y-6">
      <div className="glass border border-white/15 rounded-2xl p-8">
        <h3 className="font-sans font-bold text-xl text-white mb-2">Influencer Dashboard</h3>
        <p className="text-sm text-white/45 leading-relaxed">
          Knowledge base, voice registration, and provider configuration have been removed from the frontend.
          You can continue to track sessions and bookings from the dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass border border-white/15 rounded-2xl p-6">
          <h4 className="font-sans font-bold text-base text-white mb-2">Session Access</h4>
          <p className="text-sm text-white/50">
            Users can still initiate paid voice sessions and complete post-session feedback.
          </p>
        </div>

        <div className="glass border border-white/15 rounded-2xl p-6">
          <h4 className="font-sans font-bold text-base text-white mb-2">Analytics Visibility</h4>
          <p className="text-sm text-white/50">
            Booking and usage analytics remain available in admin analytics views.
          </p>
        </div>
      </div>
    </div>
  );
}
