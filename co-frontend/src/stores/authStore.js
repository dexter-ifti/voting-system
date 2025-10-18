import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useAuthStore = create()(persist((set) => ({
    user: null,
    isInitialized: false,
    setUser: (user) => set({ user }),
    logout: () => set({ user: null }),
    setInitialized: (initialized) => set({ isInitialized: initialized })
}), {
    name: 'auth-storage',
    partialize: (state) => ({ user: state.user }),
    onRehydrateStorage: () => (state) => {
        if (state) {
            state.setInitialized(true);
        }
    }
}));
