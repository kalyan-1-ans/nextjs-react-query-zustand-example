import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { LoginResponse } from './types';
import { createSelectors } from '@/utils/zustand.helper';

type AuthState = {
  accessToken?: string;
  currentUserId?: string;
  isAuthenticated: boolean;
  actions: {
    loginSuccess: (response: LoginResponse) => void;
    clearAuth: () => void;
  };
};

export const useAuthStore = createSelectors(
  create<AuthState>()(
    persist(
      set => ({
        accessToken: undefined,
        currentUserId: undefined,
        isAuthenticated: false,
        actions: {
          loginSuccess: response => set({ ...response, isAuthenticated: true }),
          clearAuth: () =>
            set({ accessToken: undefined, currentUserId: undefined, isAuthenticated: false }),
        },
      }),
      {
        name: 'demo-auth',
        storage: createJSONStorage(() => sessionStorage),
        skipHydration: true,
        partialize: ({ accessToken, currentUserId, isAuthenticated }) => ({
          accessToken,
          currentUserId,
          isAuthenticated,
        }),
      },
    ),
  ),
);
