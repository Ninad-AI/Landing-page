'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../lib/stores';
import { toast } from 'sonner';

/* ── Hardcoded credentials (temporary) ── */
const HARDCODED_USERS = [
  {
    email: 'yash@gmail.com',
    password: 'yash@123',
    user: {
      id: 'user-001',
      email: 'yash@gmail.com',
      name: 'Yash',
      role: 'user' as const,
      avatar_url: '',
      created_at: new Date().toISOString(),
    },
  },
  {
    email: 'admin@gmail.com',
    password: 'admin@123',
    user: {
      id: 'admin-001',
      email: 'admin@gmail.com',
      name: 'Admin',
      role: 'admin' as const,
      avatar_url: '',
      created_at: new Date().toISOString(),
    },
  },
];

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    // Simulate a tiny network delay
    await new Promise((r) => setTimeout(r, 400));

    const match = HARDCODED_USERS.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );

    if (match) {
      login(match.user, `hardcoded-token-${match.user.role}`);
      toast.success(`Welcome back, ${match.user.name}!`);
      router.push('/dashboard');
    } else {
      toast.error('Invalid credentials. Please try again.');
    }

    setLoading(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 sm:px-6 py-20 sm:py-24">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute left-[-24vw] top-[-10vw] h-[clamp(240px,48vw,600px)] w-[clamp(240px,48vw,600px)] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(97,37,216,0.55)_0%,transparent_70%)] animate-glow-drift" />
        <div className="absolute right-[-20vw] bottom-[-8vw] h-[clamp(220px,42vw,500px)] w-[clamp(220px,42vw,500px)] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(0,169,255,0.35)_0%,transparent_70%)] animate-glow-drift-reverse" />
      </div>

      <div className="relative z-10 w-full max-w-md page-enter">
        {/* Glass Card */}
        <div className="glass-card border border-white/15 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-sans font-extrabold text-3xl md:text-4xl text-white tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="font-sans text-sm text-white/50">
              Sign in to your Ninad AI account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-field" style={{ animationDelay: '80ms' }}>
              <label htmlFor="login-email" className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>

            <div className="form-field" style={{ animationDelay: '160ms' }}>
              <label htmlFor="login-password" className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-primary text-white font-sans font-bold text-base transition-all duration-300 hover:bg-primary-light hover:shadow-[0_0_30px_rgba(97,37,216,0.4)] disabled:opacity-50 disabled:cursor-not-allowed btn-primary active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>


          <div className="mt-5">
            <p className="text-center text-sm text-white/50">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-primary-light font-semibold hover:text-white transition-colors duration-300"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
