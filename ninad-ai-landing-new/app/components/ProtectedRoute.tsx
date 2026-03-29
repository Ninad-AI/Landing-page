'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../lib/stores';
import { canAccess } from '../lib/auth';
import type { UserRole } from '../lib/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  fallbackPath = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace(fallbackPath);
      return;
    }

    if (allowedRoles && !canAccess(user?.role, allowedRoles)) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isHydrated, user, allowedRoles, router, fallbackPath]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div
            className="w-10 h-10 rounded-full border-2 border-white/10 border-t-primary animate-spin"
            style={{ animationDuration: '0.8s' }}
          />
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/10 animate-soft-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-white/10 animate-soft-pulse" style={{ animationDelay: '200ms' }} />
            <div className="w-2 h-2 rounded-full bg-white/10 animate-soft-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (allowedRoles && !canAccess(user?.role, allowedRoles)) return null;

  return <div className="page-enter">{children}</div>;
}
