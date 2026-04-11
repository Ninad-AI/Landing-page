'use client';

import { useSystemHealthStore } from '../lib/systemHealthStore';

const DEFAULT_PROVIDER = 'deepgram';
const MAX_SLOTS = 45;

export interface SlotStatus {
  /** Whether the health check has completed at least once */
  isLoaded: boolean;
  /** Whether we're currently fetching */
  isChecking: boolean;
  /** Number of currently active sessions on the provider */
  activeSessions: number;
  /** Number of reserved (pending) slots */
  reservedSessions: number;
  /** Max sessions allowed on the provider */
  maxSlots: number;
  /** Number of slots currently available for new users */
  availableSlots: number;
  /** Whether slots are full and payment should be blocked */
  isFull: boolean;
  /** Error message if health check fails */
  error: string | null;
  /** Manually trigger a refresh (e.g. after a slot frees) */
  refresh: () => Promise<void>;
}

/**
 * Reads provider capacity from the global health store.
 * Polling is started once at app root and runs every 10 seconds.
 */
export function useSlotAvailability(
  provider: string = DEFAULT_PROVIDER,
): SlotStatus {
  const isLoaded = useSystemHealthStore((s) => s.isLoaded);
  const isChecking = useSystemHealthStore((s) => s.isChecking);
  const error = useSystemHealthStore((s) => s.error);
  const providers = useSystemHealthStore((s) => s.providers);
  const refresh = useSystemHealthStore((s) => s.refresh);

  const providerHealth = providers?.[provider] ?? null;

  const activeSessions = providerHealth?.active ?? 0;
  const reservedSessions = providerHealth?.reserved ?? 0;
  const maxSlots = providerHealth?.limit ?? MAX_SLOTS;
  const availableSlots = providerHealth?.available ?? (maxSlots - activeSessions - reservedSessions);
  const isFull = availableSlots <= 0;

  return {
    isLoaded,
    isChecking,
    activeSessions,
    reservedSessions,
    maxSlots,
    availableSlots,
    isFull,
    error,
    refresh,
  };
}
