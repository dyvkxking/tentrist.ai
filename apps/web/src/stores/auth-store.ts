"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "admin" | "member" | "viewer";
export type UserType = "client" | "provider";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  userType?: UserType;
}

export interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpiresAt: number | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithWallet: (address: string) => Promise<void>;
  loginWithOAuth: (user: { id: string; email?: string; name?: string; avatar?: string }) => Promise<void>;
  setUserType: (type: UserType) => void;
  logout: () => void;
  clearError: () => void;
  checkSession: () => boolean;
  updateUser: (updates: Partial<User>) => void;
}

// Mock JWT token generation for demo
function generateMockJWT(user: User): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    })
  );
  const signature = btoa("mock-signature");
  return `${header}.${payload}.${signature}`;
}

function decodeMockJWT(token: string): { sub: string; email: string; name: string; role: UserRole; exp: number } | null {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// Mock users database
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "alex@tentrist.ai": {
    password: "demo123",
    user: {
      id: "usr_8a3f2e1c4d",
      email: "alex@tentrist.ai",
      name: "Alex Chen",
      role: "admin",
      avatar: undefined,
    },
  },
  "sarah@tentrist.ai": {
    password: "demo123",
    user: {
      id: "usr_9b4d3e2f5a",
      email: "sarah@tentrist.ai",
      name: "Sarah Kim",
      role: "member",
      avatar: undefined,
    },
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionExpiresAt: null,

      // Login with email/password
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockUser = MOCK_USERS[email.toLowerCase()];

        if (!mockUser || mockUser.password !== password) {
          set({
            isLoading: false,
            error: "Invalid email or password",
          });
          return;
        }

        const token = generateMockJWT(mockUser.user);
        const decoded = decodeMockJWT(token);

        set({
          user: mockUser.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          sessionExpiresAt: decoded?.exp ?? Date.now() + 24 * 60 * 60 * 1000,
        });

        // Store token (in real app, this would go to httpOnly cookie)
        if (typeof window !== "undefined") {
          localStorage.setItem("tentrist_token", token);
        }
      },

      // Login with Web3 wallet
      loginWithWallet: async (address: string) => {
        set({ isLoading: true, error: null });

        // Simulate Web3 auth delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock wallet user creation
        const walletUser: User = {
          id: `usr_${address.slice(2, 10).toLowerCase()}`,
          email: "",
          name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          role: "member",
        };

        const token = generateMockJWT(walletUser);
        const decoded = decodeMockJWT(token);

        set({
          user: walletUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          sessionExpiresAt: decoded?.exp ?? Date.now() + 24 * 60 * 60 * 1000,
        });

        if (typeof window !== "undefined") {
          localStorage.setItem("tentrist_token", token);
        }
      },

      // Login with OAuth (GitHub, Google, Discord)
      loginWithOAuth: async (oauthUser: { id: string; email?: string; name?: string; avatar?: string }) => {
        set({ isLoading: true, error: null });

        // Simulate OAuth delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const user: User = {
          id: oauthUser.id,
          email: oauthUser.email || `${oauthUser.id}@oauth.tentrist.ai`,
          name: oauthUser.name || oauthUser.email?.split('@')[0] || 'OAuth User',
          avatar: oauthUser.avatar,
          role: "member",
        };

        const token = generateMockJWT(user);
        const decoded = decodeMockJWT(token);

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          sessionExpiresAt: decoded?.exp ?? Date.now() + 24 * 60 * 60 * 1000,
        });

        if (typeof window !== "undefined") {
          localStorage.setItem("tentrist_token", token);
        }
      },

      // Set user type (client/provider)
      setUserType: (type) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, userType: type } });
        }
      },

      // Logout
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          sessionExpiresAt: null,
        });

        if (typeof window !== "undefined") {
          localStorage.removeItem("tentrist_token");
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Check if session is valid
      checkSession: () => {
        const { sessionExpiresAt, isAuthenticated } = get();

        if (!isAuthenticated || !sessionExpiresAt) {
          return false;
        }

        const isValid = Date.now() < sessionExpiresAt;

        if (!isValid) {
          get().logout();
        }

        return isValid;
      },

      // Update user profile
      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...updates },
          });
        }
      },
    }),
    {
      name: "tentrist-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionExpiresAt: state.sessionExpiresAt,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);