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
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute left-[-24vw] top-[8vw] h-[clamp(240px,48vw,600px)] w-[clamp(240px,48vw,600px)] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(97,37,216,0.5)_0%,transparent_70%)]" />
        <div className="absolute right-[-20vw] bottom-[6vw] h-[clamp(220px,42vw,500px)] w-[clamp(220px,42vw,500px)] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(0,169,255,0.3)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 max-w-[1400px] pt-28 sm:pt-32 md:pt-40 pb-16 sm:pb-20 md:pb-24">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <h1 className="font-sans font-extrabold text-3xl md:text-5xl text-white tracking-tight mb-3">
            Welcome, {user.name}
          </h1>
          <p className="font-sans text-base text-white/50">
            {user.role === 'admin' && 'Manage the platform from your admin dashboard.'}
            {user.role === 'influencer' && 'Manage your voice AI presence and sessions.'}
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
