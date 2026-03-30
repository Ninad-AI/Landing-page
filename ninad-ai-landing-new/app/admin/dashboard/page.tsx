'use client';

import React from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';



interface RecentBooking {
  id: string;
  userName: string;
  creatorName: string;
  duration: number;
  status: string;
  time: string;
}

interface StatCard {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}



const MOCK_BOOKINGS: RecentBooking[] = [
  { id: '1', userName: 'Arjun K.', creatorName: 'Pawan Kumar', duration: 15, status: 'completed', time: '2 min ago' },
  { id: '2', userName: 'Priya M.', creatorName: 'Pawan Kumar', duration: 30, status: 'active', time: '8 min ago' },
  { id: '3', userName: 'Rahul S.', creatorName: 'Pawan Kumar', duration: 20, status: 'completed', time: '15 min ago' },
  { id: '4', userName: 'Ananya D.', creatorName: 'Pawan Kumar', duration: 60, status: 'completed', time: '32 min ago' },
];

const STATS: StatCard[] = [
  {
    label: 'Total Sessions',
    value: '2,847',
    change: '+12%',
    icon: (
      <svg className="w-5 h-5 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a6 6 0 006-6V7a6 6 0 10-12 0v5a6 6 0 006 6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12a7 7 0 0014 0M12 19v3m-3 0h6" />
      </svg>
    ),
  },
  {
    label: 'Active Users',
    value: '891',
    change: '+8%',
    icon: (
      <svg className="w-5 h-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19v-1a4 4 0 00-4-4H6a4 4 0 00-4 4v1" />
        <circle cx="8.5" cy="7" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 19v-1a4 4 0 00-3-3.87" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 4.13a3 3 0 010 5.74" />
      </svg>
    ),
  },
  {
    label: 'Revenue (₹)',
    value: '4,82,500',
    change: '+23%',
    icon: (
      <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h9a3 3 0 010 6H9a3 3 0 000 6h8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 4v16" />
      </svg>
    ),
  },
  {
    label: 'Avg Duration',
    value: '18m',
    change: '+4%',
    icon: (
      <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="13" r="8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 13V9m0 4l3 2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 2h6" />
      </svg>
    ),
  },
];

function AdminDashboardContent() {

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute left-[-24vw] top-[4vw] h-[clamp(260px,52vw,700px)] w-[clamp(260px,52vw,700px)] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(97,37,216,0.5)_0%,transparent_70%)]" />
        <div className="absolute right-[-20vw] top-[22vw] h-[clamp(220px,42vw,500px)] w-[clamp(220px,42vw,500px)] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(0,169,255,0.3)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 max-w-[1400px] pt-28 sm:pt-32 md:pt-40 pb-16 sm:pb-20 md:pb-24">
        {/* Page Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse" />
            <span className="text-xs font-bold text-green-400/80 uppercase tracking-wider">Live</span>
          </div>
          <h1 className="font-sans font-extrabold text-3xl md:text-5xl text-white tracking-tight mb-2">
            Admin Dashboard
          </h1>
          <p className="font-sans text-base text-white/40">
            Real-time system overview and monitoring
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 animate-fade-in-up delay-100">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="glass border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  {stat.icon}
                </span>
                <span className="text-xs font-bold text-green-400/80 bg-green-500/10 px-2 py-0.5 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div className="font-sans font-extrabold text-2xl text-white mb-1 tabular-nums">
                {stat.value}
              </div>
              <div className="text-xs text-white/40 font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">

          {/* Recent Bookings */}
          <div className="glass border border-white/10 rounded-2xl p-6 animate-fade-in-up delay-300">
            <h3 className="font-sans font-bold text-lg text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Bookings
            </h3>

            <div className="space-y-3">
              {MOCK_BOOKINGS.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary-light">
                      {booking.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{booking.userName}</div>
                      <div className="text-xs text-white/30">
                        {booking.creatorName} • {booking.duration}m
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        booking.status === 'active'
                          ? 'text-green-400 bg-green-500/10'
                          : 'text-white/30 bg-white/5'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <div className="text-[10px] text-white/20 mt-1">{booking.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
