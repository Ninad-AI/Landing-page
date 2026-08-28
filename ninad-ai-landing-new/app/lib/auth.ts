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
