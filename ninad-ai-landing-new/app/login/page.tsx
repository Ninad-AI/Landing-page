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
            </div>
          </div>
    </main>
  );
}
