import { create } from 'zustand';
import type { User, UserRole } from './types';

// ─── Token helpers ───
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ninad_access_token');
}

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('ninad_user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function persistAuth(user: User, token: string): void {
  localStorage.setItem('ninad_access_token', token);
  localStorage.setItem('ninad_user', JSON.stringify(user));
}

function clearAuth(): void {
  localStorage.removeItem('ninad_access_token');
  localStorage.removeItem('ninad_user');
}

// ─── Auth Store ───
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  hydrate: () => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (...roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false,

  hydrate: () => {
    const user = getStoredUser();
    const token = getStoredToken();
    set({
      user,
      token,
      isAuthenticated: !!user && !!token,
      isHydrated: true,
    });
  },

  login: (user: User, token: string) => {
    persistAuth(user, token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    clearAuth();
    set({ user: null, token: null, isAuthenticated: false });
  },

  hasRole: (role: UserRole) => get().user?.role === role,

  hasAnyRole: (...roles: UserRole[]) => {
    const userRole = get().user?.role;
    return userRole ? roles.includes(userRole) : false;
  },
}));

// ─── UI Store ───
interface UIState {
  voiceChatOpen: boolean;
  voiceChatCreatorId: string | null;
  openVoiceChat: (creatorId: string) => void;
  closeVoiceChat: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  voiceChatOpen: false,
  voiceChatCreatorId: null,

  openVoiceChat: (creatorId: string) =>
    set({ voiceChatOpen: true, voiceChatCreatorId: creatorId }),

  closeVoiceChat: () =>
    set({ voiceChatOpen: false, voiceChatCreatorId: null }),
}));
