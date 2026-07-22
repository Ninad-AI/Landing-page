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
 * Decode the payload portion of a JWT without verifying the signature.
 * Useful for extracting claims like influencer_id on the frontend.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Extract influencer_id from the JWT payload.
 * Returns undefined if not present or if the token is invalid.
 */
export function getInfluencerIdFromToken(token: string): string | undefined {
  const payload = decodeJwtPayload(token);
  const value = payload?.influencer_id;
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
