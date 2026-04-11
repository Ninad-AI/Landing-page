'use client';

import { create } from 'zustand';
import { systemApi } from './api';
import type { ProviderHealth } from './types';

export const HEALTH_POLL_INTERVAL_SECONDS = 10;
const HEALTH_POLL_INTERVAL_MS = HEALTH_POLL_INTERVAL_SECONDS * 1000;

let healthPollTimer: ReturnType<typeof setInterval> | null = null;

interface SystemHealthState {
  isLoaded: boolean;
  isChecking: boolean;
  error: string | null;
  providers: Record<string, ProviderHealth>;
  lastUpdatedAt: number | null;
  refresh: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

export const useSystemHealthStore = create<SystemHealthState>((set, get) => ({
  isLoaded: false,
  isChecking: false,
  error: null,
  providers: {},
  lastUpdatedAt: null,

  refresh: async () => {
    set({ isChecking: true });

    try {
      const data = await systemApi.health();
      set({
        providers: data.providers ?? {},
        error: null,
        isLoaded: true,
        lastUpdatedAt: Date.now(),
      });
    } catch {
      set({
        error: 'Unable to check system health.',
        isLoaded: true,
      });
    } finally {
      set({ isChecking: false });
    }
  },

  startPolling: () => {
    if (healthPollTimer) return;

    void get().refresh();
    healthPollTimer = setInterval(() => {
      void get().refresh();
    }, HEALTH_POLL_INTERVAL_MS);
  },

  stopPolling: () => {
    if (!healthPollTimer) return;

    clearInterval(healthPollTimer);
    healthPollTimer = null;
  },
}));
