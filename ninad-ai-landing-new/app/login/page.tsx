'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '../lib/stores';
import { authApi } from '../lib/api';
import { toast } from 'sonner';

function getAuthErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as { response?: { data?: { detail?: string; message?: string } } };
  return apiError.response?.data?.detail || apiError.response?.data?.message || fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);

  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast.error('Google Sign-In failed: no credential received.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.googleSignIn({ id_token: idToken });
      login(response.user, response.tokens.access_token);
      toast.success(`Welcome, ${response.user.name}!`);
      router.push(redirectTo);
    } catch (error) {
      toast.error(getAuthErrorMessage(error, 'Sign-in failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google Sign-In was cancelled or failed. Please try again.');
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
            {/* Ninad AI icon */}
            <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-[0_0_30px_rgba(97,37,216,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-primary-light" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            </div>

            <h1 className="font-sans font-extrabold text-3xl md:text-4xl text-white tracking-tight mb-2">
              Welcome to Ninad AI
            </h1>
            <p className="font-sans text-sm text-white/50">
              Sign in to access your personalized AI voice experience
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-7">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30 font-sans uppercase tracking-wider">Continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google Sign-In Button */}
          <div className="flex flex-col items-center gap-4">
            {loading ? (
              <div className="w-full py-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
                <span className="font-sans text-sm text-white/60">Signing you in…</span>
              </div>
            ) : (
              <div className="w-full flex justify-center [&>div]:!w-full [&_div[role=button]]:!w-full [&_div[role=button]]:!max-w-none">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  size="large"
                  shape="rectangular"
                  text="continue_with"
                  width="400"
                  logo_alignment="left"
                  useOneTap={false}
                />
              </div>
            )}

            {/* Privacy note */}
            <p className="text-center text-xs text-white/25 font-sans leading-relaxed px-2">
              By continuing, you agree to Ninad AI&apos;s{' '}
              <a href="/terms-and-conditions" className="text-white/40 hover:text-white/70 transition-colors underline underline-offset-2">
                Terms of Service
              </a>
              . Your Google account info is used only to authenticate you.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="mt-8 pt-6 border-t border-white/8">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '🔒', label: 'Secure' },
                { icon: '⚡', label: 'Instant' },
                { icon: '🎙️', label: 'AI Voice' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 py-2 rounded-xl bg-white/3 border border-white/5">
                  <span className="text-xl">{icon}</span>
                  <span className="text-xs font-sans text-white/40 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
