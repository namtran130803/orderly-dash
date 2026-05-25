import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  id: number;
  name: string;
  phone: string;
  createdAt: string;
};

export type UserRole = {
  id: number;
  name: string;
  code: string;
  permissions: { code: string; name: string }[];
};

type AuthState = {
  token: string | null;
  user: User | null;
  roles: UserRole[];
  permissions: string[];
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setRoles: (roles: UserRole[]) => void;
  clearPermissions: () => void;
  logout: () => void;
  isAuthenticated: () => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      roles: [],
      permissions: [],
      setToken: (token) => set({ token, roles: [], permissions: [] }),
      setUser: (user) => set({ user }),
      setRoles: (roles) =>
        set({
          roles,
          permissions: [
            ...new Set(
              roles.flatMap((role) =>
                role.permissions.map((permission) => permission.code),
              ),
            ),
          ],
        }),
      clearPermissions: () => set({ roles: [], permissions: [] }),
      logout: () => set({ token: null, user: null, roles: [], permissions: [] }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
    }
  )
);
