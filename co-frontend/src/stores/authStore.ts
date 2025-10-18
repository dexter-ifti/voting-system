import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  role: 'admin' | 'voter' | 'candidate' | 'super_admin' | 'election_admin';
  token: string;
  email?: string;
  walletAddress?: string;
  name?: string;
  permissions?: string[];
}

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  isInitialized: boolean;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isInitialized: false,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
      setInitialized: (initialized) => set({ isInitialized: initialized })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setInitialized(true);
        }
      }
    }
  )
);
