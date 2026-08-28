'use client';

import React, { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';
import { useAuthStore } from '../lib/stores';
import { useSystemHealthStore } from '../lib/systemHealthStore';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Listen for forced logout events from the API interceptor
  useEffect(() => {
    const handleLogout = () => useAuthStore.getState().logout();
    window.addEventListener('ninad:auth:logout', handleLogout);
    return () => window.removeEventListener('ninad:auth:logout', handleLogout);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nd-bg">
        <div className="w-10 h-10 rounded-full border-2 border-nd-line border-t-nd-accent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const startHealthPolling = useSystemHealthStore((s) => s.startPolling);
  const stopHealthPolling = useSystemHealthStore((s) => s.stopPolling);

  useEffect(() => {
    startHealthPolling();
    return () => stopHealthPolling();
  }, [startHealthPolling, stopHealthPolling]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthHydrator>
        {children}
      </AuthHydrator>
      <Toaster
        position="top-right"
        duration={2500}
        toastOptions={{
          style: {
            background: 'rgba(250, 248, 244, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid #E4DED4',
            color: '#1C1A1F',
            fontFamily: 'var(--font-manrope)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px -20px rgba(28,26,31,0.25)',
          },
        }}
        richColors
      />
    </GoogleOAuthProvider>
  );
}
