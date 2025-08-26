import { create } from 'zustand';

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
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null })
}));
