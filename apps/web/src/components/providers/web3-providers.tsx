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

// Create wagmi config
export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, hardhat],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
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
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={tentristTheme}
          modalSize="compact"
        >
          {mounted ? children : null}
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
