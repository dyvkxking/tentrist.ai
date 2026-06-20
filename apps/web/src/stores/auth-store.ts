"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase";

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
  // UI state only — auth session is managed by SupabaseAuthProvider
  userType: UserType | null;
  error: string | null;

  // Actions
  setUserType: (type: UserType) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Wallet auth — calls the backend Edge Function / API route
export async function loginWithWallet(address: string, signature: string, nonce: string): Promise<{ error: string | null }> {
  try {
    const res = await fetch("/api/v1/auth/wallet/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: address, signature, nonce }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Wallet verification failed" };
    return { error: null };
  } catch (e) {
    return { error: "Network error during wallet verification" };
  }
}

// Password auth via Supabase
export async function loginWithPassword(email: string, password: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { error: null };
}

// Sign out via Supabase
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userType: null,
      error: null,

      setUserType: (type) => set({ userType: type }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "tentrist-auth-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ userType: state.userType }),
    }
  )
);

// Selector hooks
export const useUserType = () => useAuthStore((state) => state.userType);

// Imperative access outside React (for non-hook contexts like API calls)
// Returns the current Supabase session user synchronously from localStorage cache
export async function getCurrentUser() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}
