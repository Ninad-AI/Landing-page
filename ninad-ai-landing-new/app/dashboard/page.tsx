'use client';

import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuthStore } from '../lib/stores';
import UserDashboard from './UserDashboard';
import InfluencerDashboard from './InfluencerDashboard';
import AdminDashboard from './AdminDashboard';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-nd-bg">
      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 max-w-[1400px] pt-24 sm:pt-32 md:pt-40 pb-16 sm:pb-20 md:pb-24">
        {/* Header */}
        <div className="mb-8 sm:mb-12 animate-nd-up">
          <h1 className="font-display text-2xl sm:text-3xl md:text-5xl text-nd-ink tracking-tight mb-2 sm:mb-3 break-words">
            Welcome, {user.name}
          </h1>
          <p className="font-nd-sans text-sm sm:text-base text-nd-muted">
            {user.role === 'admin' && 'Manage the platform from your admin dashboard.'}
            {user.role === 'influencer' && 'Review your session activity and platform performance.'}
            {user.role === 'user' && 'Start voice sessions and manage your bookings.'}
          </p>
        </div>

        {/* Role-based content */}
        {user.role === 'admin' && <AdminDashboard />}
        {user.role === 'influencer' && <InfluencerDashboard />}
        {user.role === 'user' && <UserDashboard />}
      </div>
    </main>
  );
}
