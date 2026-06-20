"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/stores/auth-store";

// Types
export interface WalletTransaction {
  id: string;
  user_id: string;
  type: "stake_added" | "stake_removed" | "job_payment" | "slashing" | "reward";
  amount_usd: number;
  job_id?: string;
  tx_hash?: string;
  created_at: string;
}

export interface EscrowPosition {
  id: string;
  user_id: string;
  node_id?: string;
  amount_eth: number;
  created_at: string;
}

export interface WalletStats {
  totalBalance: number;
  totalStaked: number;
  pendingUnstake: number;
  last30DaysRewards: number;
  last30DaysSlashings: number;
}

// API functions (Supabase)
async function fetchWalletTransactions(userId: string): Promise<WalletTransaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function fetchEscrowPositions(userId: string): Promise<EscrowPosition[]> {
  const { data, error } = await supabase
    .from("escrow_positions")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

async function fetchWalletStats(userId: string): Promise<WalletStats> {
  const txns = await fetchWalletTransactions(userId);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const recentTxns = txns.filter((t) => t.created_at >= thirtyDaysAgo);
  const rewards = recentTxns
    .filter((t) => t.type === "reward")
    .reduce((sum, t) => sum + t.amount_usd, 0);
  const slashings = recentTxns
    .filter((t) => t.type === "slashing")
    .reduce((sum, t) => sum + t.amount_usd, 0);

  return {
    totalBalance: txns
      .filter((t) => t.type !== "slashing")
      .reduce((sum, t) => sum + t.amount_usd, 0),
    totalStaked: txns
      .filter((t) => t.type === "stake_added")
      .reduce((sum, t) => sum + t.amount_usd, 0),
    pendingUnstake: 0,
    last30DaysRewards: rewards,
    last30DaysSlashings: slashings,
  };
}

async function stakeFunds(
  userId: string,
  amountEth: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/v1/escrow/stake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amountEth }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true };
  } catch {
    return { success: false, error: "Network error" };
  }
}

async function unstakeFunds(
  userId: string,
  amountEth: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/v1/escrow/unstake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amountEth }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true };
  } catch {
    return { success: false, error: "Network error" };
  }
}

// Hooks
export function useWalletTransactions() {
  return useQuery({
    queryKey: ["wallet", "transactions"],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) return [];
      return fetchWalletTransactions(user.id);
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

export function useEscrowPositions() {
  return useQuery({
    queryKey: ["wallet", "escrow"],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) return [];
      return fetchEscrowPositions(user.id);
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

export function useWalletStats() {
  return useQuery({
    queryKey: ["wallet", "stats"],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user)
        return {
          totalBalance: 0,
          totalStaked: 0,
          pendingUnstake: 0,
          last30DaysRewards: 0,
          last30DaysSlashings: 0,
        };
      return fetchWalletStats(user.id);
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

// Stake mutation hook
export function useStake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      const user = await getCurrentUser();
      if (!user) return { success: false, error: "Not authenticated" };
      return stakeFunds(user.id, amount);
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
      const user = await getCurrentUser();
      if (!user) return { success: false, error: "Not authenticated" };
      return unstakeFunds(user.id, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}
