import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../api/client';

interface User {
  id: string;
  name: string;
  email: string;
  teamId?: string;
  /** @deprecated Use roles instead */
  role: string;
  // RBAC properties
  isSuperAdmin: boolean;
  roles: string[];
  permissions: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshPermissions: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post('/auth/login', { email, password });
          const {
            id,
            name,
            email: userEmail,
            teamId,
            role,
            isSuperAdmin,
            roles,
            permissions,
            accessToken,
            refreshToken,
          } = response.data;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          set({
            user: {
              id,
              name,
              email: userEmail,
              teamId,
              role,
              isSuperAdmin: isSuperAdmin ?? false,
              roles: roles ?? [],
              permissions: permissions ?? [],
            },
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post('/auth/register', { name, email, password });
          const {
            id,
            email: userEmail,
            teamId,
            role,
            isSuperAdmin,
            roles,
            permissions,
            accessToken,
            refreshToken,
          } = response.data;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          set({
            user: {
              id,
              name,
              email: userEmail,
              teamId,
              role,
              isSuperAdmin: isSuperAdmin ?? false,
              roles: roles ?? [],
              permissions: permissions ?? [],
            },
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      clearError: () => set({ error: null }),

      refreshPermissions: async () => {
        const state = get();
        if (!state.isAuthenticated || !state.accessToken) return;

        try {
          const response = await apiClient.get('/permissions/me');
          const { isSuperAdmin, roles, permissions } = response.data;

          set({
            user: state.user
              ? {
                  ...state.user,
                  isSuperAdmin: isSuperAdmin ?? state.user.isSuperAdmin,
                  roles: roles ?? state.user.roles,
                  permissions: permissions ?? state.user.permissions,
                }
              : null,
          });
        } catch (error) {
          console.error('Failed to refresh permissions:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
