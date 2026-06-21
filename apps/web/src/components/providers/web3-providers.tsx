"use client";

import * as React from "react";
import {
  WagmiProvider,
  createConfig,
  http,
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { mainnet, sepolia, hardhat } from "wagmi/chains";
import { QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import {
  RainbowKitProvider,
  darkTheme,
  ConnectButton,
  DisclaimerComponent,
} from "@rainbow-me/rainbowkit";
import { injected } from "wagmi/connectors";
import "@rainbow-me/rainbowkit/styles.css";

// Create wagmi config - only include necessary chains to reduce loading time
export const wagmiConfig = createConfig({
  chains: [hardhat], // Only hardhat for local dev - lazy load others
  connectors: [
    injected(),
  ],
  transports: {
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
  // Disable automatic reconnection to reduce initial load
  ssr: false,
});

// Create query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 min — don't refetch within window
      refetchInterval: false,      // disable background polling by default
    },
  },
});

// Custom dark theme matching our design system
const tentristTheme = darkTheme({
  accentColor: "#10b981",
  accentColorForeground: "#ededed",
  borderRadius: "medium",
  fontStack: "system",
  overlayBlur: "small",
});

// Custom disclaimer
const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    By connecting, you agree to the{" "}
    <Link href="/terms">Terms of Service</Link> and acknowledge the{" "}
    <Link href="/risks"> risks</Link> of staking cryptocurrency.
  </Text>
);

// Web3 Providers component
export function Web3Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Delay mounting to prevent hydration issues and improve initial load
    const timer = setTimeout(() => setMounted(true), 1);
    return () => clearTimeout(timer);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={tentristTheme}
          modalSize="compact"
          initialChain={31337} // hardhat chain ID
        >
          {mounted ? children : <div className="min-h-[100px]" />}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Hook for account info
export function useAccountInfo() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, error, isPending: isConnectingWallet } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance, isLoading: isLoadingBalance } = useBalance({
    address,
  });

  return {
    address,
    isConnected,
    isConnecting,
    isConnectingWallet,
    balance,
    isLoadingBalance,
    connect,
    connectors,
    disconnect,
    error,
  };
}

// Export RainbowKit ConnectButton for use in components
export { ConnectButton };
