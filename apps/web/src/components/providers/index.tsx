"use client";

import { ThemeProvider } from "./theme-provider";
import { SupabaseAuthProvider } from "./supabase-auth-provider";
import { Web3Providers } from "./web3-providers";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SupabaseAuthProvider>
        <Web3Providers>{children}</Web3Providers>
      </SupabaseAuthProvider>
    </ThemeProvider>
  );
}
