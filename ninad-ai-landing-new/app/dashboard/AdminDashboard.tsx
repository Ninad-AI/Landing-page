'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
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
      title: 'Analytics',
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up delay-100">
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
  );
}
