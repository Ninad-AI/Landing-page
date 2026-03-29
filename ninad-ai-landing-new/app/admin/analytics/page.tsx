'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// ─── Mock Data ───
const USAGE_DAILY = [
  { date: 'Mar 1', sessions: 42, minutes: 630 },
  { date: 'Mar 5', sessions: 58, minutes: 870 },
  { date: 'Mar 8', sessions: 35, minutes: 525 },
  { date: 'Mar 12', sessions: 71, minutes: 1065 },
  { date: 'Mar 15', sessions: 89, minutes: 1335 },
  { date: 'Mar 18', sessions: 63, minutes: 945 },
  { date: 'Mar 20', sessions: 95, minutes: 1425 },
  { date: 'Mar 22', sessions: 78, minutes: 1170 },
  { date: 'Mar 25', sessions: 112, minutes: 1680 },
  { date: 'Mar 28', sessions: 104, minutes: 1560 },
];



const BOOKING_DAILY = [
  { date: 'Mar 1', bookings: 12, revenue: 14800 },
  { date: 'Mar 5', bookings: 18, revenue: 22400 },
  { date: 'Mar 8', bookings: 9, revenue: 11200 },
  { date: 'Mar 12', bookings: 24, revenue: 31600 },
  { date: 'Mar 15', bookings: 31, revenue: 42800 },
  { date: 'Mar 18', bookings: 22, revenue: 28400 },
  { date: 'Mar 20', bookings: 38, revenue: 51200 },
  { date: 'Mar 22', bookings: 27, revenue: 35600 },
  { date: 'Mar 25', bookings: 45, revenue: 62400 },
  { date: 'Mar 28', bookings: 41, revenue: 55800 },
];

const TOP_CREATORS = [
  { name: 'Pawan Kumar', bookings: 847, revenue: 254100 },
  { name: 'Creator B', bookings: 412, revenue: 123600 },
  { name: 'Creator C', bookings: 298, revenue: 89400 },
];



type Tab = 'usage' | 'bookings';

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

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute h-[700px] w-[700px] left-[-200px] top-[50px] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(97,37,216,0.5)_0%,transparent_70%)]" />
        <div className="absolute h-[500px] w-[500px] right-[-150px] bottom-[100px] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(0,169,255,0.3)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20 max-w-[1400px] pt-32 md:pt-40 pb-24">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="font-sans font-extrabold text-3xl md:text-5xl text-white tracking-tight mb-2">
            Analytics
          </h1>
          <p className="font-sans text-base text-white/40">
            Platform usage metrics and booking insights
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-10 animate-fade-in-up delay-100">
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
              {[
                { label: 'Total Sessions', value: '2,847' },
                { label: 'Total Minutes', value: '42,705' },
                { label: 'Active Users', value: '891' },
                { label: 'Avg Duration', value: '18m 12s' },
              ].map((stat) => (
                <div key={stat.label} className="glass border border-white/10 rounded-2xl p-5">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1">{stat.label}</div>
                  <div className="font-sans font-extrabold text-2xl text-white tabular-nums">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Sessions Over Time */}
            <div className="glass border border-white/10 rounded-2xl p-6">
              <h3 className="font-sans font-bold text-lg text-white mb-6">Sessions Over Time</h3>
              <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={USAGE_DAILY}>
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
              {[
                { label: 'Total Bookings', value: '1,557' },
                { label: 'Revenue', value: '₹4,82,500' },
                { label: 'Conversion Rate', value: '34.2%' },
              ].map((stat) => (
                <div key={stat.label} className="glass border border-white/10 rounded-2xl p-5">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1">{stat.label}</div>
                  <div className="font-sans font-extrabold text-2xl text-white tabular-nums">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            <div className="glass border border-white/10 rounded-2xl p-6">
              <h3 className="font-sans font-bold text-lg text-white mb-6">Revenue Over Time</h3>
              <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={BOOKING_DAILY}>
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
                    <AreaChart data={BOOKING_DAILY}>
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
                  {TOP_CREATORS.map((creator, i) => (
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
