'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../lib/stores';
import { authApi } from '../lib/api';
import TermsAgreement from '../components/auth/TermsAgreement';
import { toast } from 'sonner';

function getAuthErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as { response?: { data?: { detail?: string; message?: string } } };
  return apiError.response?.data?.detail || apiError.response?.data?.message || fallback;
}

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!acceptedTerms) {
      toast.error('Please review and accept the Terms & Conditions to continue.');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'user',
      });

      login(response.user, response.tokens.access_token);
      toast.success(`Welcome to Ninad AI, ${response.user.name}!`);
      router.push('/dashboard');
    } catch (error) {
      toast.error(getAuthErrorMessage(error, 'Could not create account. Please try again.'));
    } finally {
      setLoading(false);
    }
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
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-11"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="tap-sm absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <TermsAgreement
              checked={acceptedTerms}
              onCheckedChange={setAcceptedTerms}
              className="pt-1"
            />

            <button
              type="submit"
              disabled={loading || !acceptedTerms}
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
