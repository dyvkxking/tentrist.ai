"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";

// Types
export interface WalletTransaction {
  id: string;
  type: "stake_added" | "stake_removed" | "job_payment" | "slashing" | "reward";
  amount: number;
  timestamp: number;
  status: "confirmed" | "pending" | "failed";
  hash: string;
  description: string;
}

export interface EscrowPosition {
  id: string;
  nodeId: string;
  amount: number;
  startDate: number;
  status: "active" | "draining" | "released";
}

export interface WalletStats {
  totalBalance: number;
  totalStaked: number;
  pendingUnstake: number;
  last30DaysRewards: number;
  last30DaysSlashings: number;
}

// Mock data generators
function generateMockTransactions(count: number = 20): WalletTransaction[] {
  const types: WalletTransaction["type"][] = [
    "stake_added",
    "stake_removed",
    "job_payment",
    "slashing",
    "reward",
  ];
  const descriptions: Record<WalletTransaction["type"], string> = {
    stake_added: "Stake added to escrow",
    stake_removed: "Stake released after cooldown",
    job_payment: "Payment for job execution",
    slashing: "SLA breach penalty",
    reward: "Job completion reward",
  };

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const amount =
      type === "slashing"
        ? -(Math.random() * 0.5 + 0.1)
        : type === "job_payment" || type === "reward"
        ? Math.random() * 0.3
        : type === "stake_added"
        ? Math.random() * 5 + 1
        : Math.random() * 2 + 0.5;

    return {
      id: `tx_${i.toString().padStart(4, "0")}`,
      type,
      amount: parseFloat(amount.toFixed(4)),
      timestamp: Date.now() - i * 3600000 * Math.random() * 12,
      status: Math.random() > 0.1 ? "confirmed" : Math.random() > 0.5 ? "pending" : "failed",
      hash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      description: descriptions[type],
    };
  });
}

function generateMockEscrowPositions(): EscrowPosition[] {
  return [
    {
      id: "escrow_001",
      nodeId: "node_0042",
      amount: 25.0,
      startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
      status: "active",
    },
    {
      id: "escrow_002",
      nodeId: "node_0087",
      amount: 15.0,
      startDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
      status: "active",
    },
  ];
}

// API functions (mock)
async function fetchWalletTransactions(): Promise<WalletTransaction[]> {
  await new Promise((r) => setTimeout(r, 300));
  return generateMockTransactions(20);
}

async function fetchEscrowPositions(): Promise<EscrowPosition[]> {
  await new Promise((r) => setTimeout(r, 200));
  return generateMockEscrowPositions();
}

async function fetchWalletStats(): Promise<WalletStats> {
  await new Promise((r) => setTimeout(r, 200));
  return {
    totalBalance: 12.5847,
    totalStaked: 40.0,
    pendingUnstake: 0,
    last30DaysRewards: 2.341,
    last30DaysSlashings: 0.124,
  };
}

// Hooks
export function useWalletTransactions() {
  return useQuery({
    queryKey: ["wallet", "transactions"],
    queryFn: fetchWalletTransactions,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

export function useEscrowPositions() {
  return useQuery({
    queryKey: ["wallet", "escrow"],
    queryFn: fetchEscrowPositions,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

export function useWalletStats() {
  return useQuery({
    queryKey: ["wallet", "stats"],
    queryFn: fetchWalletStats,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

// Stake mutation hook
export function useStake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      // Simulate transaction
      await new Promise((r) => setTimeout(r, 2000));
      return { success: true, amount };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

// Unstake mutation hook
export function useUnstake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      // Simulate transaction
      await new Promise((r) => setTimeout(r, 2000));
      return { success: true, amount };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}
