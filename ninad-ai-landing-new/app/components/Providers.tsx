'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuthStore } from '../lib/stores';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-primary animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrator>
        {children}
      </AuthHydrator>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 10, 30, 0.85)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            fontFamily: 'var(--font-inter)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.5)',
          },
        }}
        richColors
      />
    </QueryClientProvider>
  );
}
