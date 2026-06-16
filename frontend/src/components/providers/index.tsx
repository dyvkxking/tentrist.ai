"use client";

import { Web3Providers } from "./web3-providers";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Web3Providers>{children}</Web3Providers>
    </ThemeProvider>
  );
}
