import type { UserRole } from './types';

/**
 * RBAC permission check.
 * `admin` implicitly has access to everything.
 */
export function canAccess(userRole: UserRole | undefined, allowed: UserRole[]): boolean {
  if (!userRole) return false;
  if (userRole === 'admin') return true;
  return allowed.includes(userRole);
}

/**
 * Decode JWT payload without verification (client-side only).
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Check if a JWT is expired (with optional grace period in seconds).
 */
export function isTokenExpired(token: string, graceSec = 30): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - graceSec <= now;
}

/**
 * Get a user-friendly role label for display.
 */
export function roleBadgeLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    user: 'User',
    influencer: 'Creator',
    admin: 'Admin',
  };
  return labels[role] || role;
}

/**
 * Get badge color classes for each role (matching Ninad AI design).
 */
export function roleBadgeClasses(role: UserRole): string {
  const styles: Record<UserRole, string> = {
    user: 'bg-accent-blue/20 text-accent-cyan border-accent-blue/30',
    influencer: 'bg-primary/20 text-primary-light border-primary/30',
    admin: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };
  return styles[role] || '';
}
