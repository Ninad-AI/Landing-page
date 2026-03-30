'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../lib/stores';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    // Hardcoded mock registration — creates a user role account
    const mockUser = {
      id: `user-${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      role: 'user' as const,
      avatar_url: '',
      created_at: new Date().toISOString(),
    };

    login(mockUser, `hardcoded-token-user`);
    toast.success(`Welcome to Ninad AI, ${mockUser.name}!`);
    router.push('/dashboard');
    setLoading(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 sm:px-6 py-20 sm:py-24">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute right-[-24vw] top-[-10vw] h-[clamp(240px,48vw,600px)] w-[clamp(240px,48vw,600px)] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(97,37,216,0.55)_0%,transparent_70%)] animate-glow-drift" />
        <div className="absolute left-[-20vw] bottom-[-8vw] h-[clamp(220px,42vw,500px)] w-[clamp(220px,42vw,500px)] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(0,169,255,0.35)_0%,transparent_70%)] animate-glow-drift-reverse" />
      </div>

      <div className="relative z-10 w-full max-w-md page-enter">
        {/* Glass Card */}
        <div className="glass-card border border-white/15 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-sans font-extrabold text-3xl md:text-4xl text-white tracking-tight mb-2">
              Create Account
            </h1>
            <p className="font-sans text-sm text-white/50">
              Join Ninad AI and start your voice journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-field" style={{ animationDelay: '80ms' }}>
              <label htmlFor="register-name" className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="input-field"
                required
              />
            </div>

            <div className="form-field" style={{ animationDelay: '160ms' }}>
              <label htmlFor="register-email" className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>

            <div className="form-field" style={{ animationDelay: '240ms' }}>
              <label htmlFor="register-password" className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
                minLength={6}
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-white/50">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary-light font-semibold hover:text-white transition-colors duration-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
