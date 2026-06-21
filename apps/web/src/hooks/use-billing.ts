"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/stores/auth-store";
import type { WalletTransaction, EscrowPosition, WalletStats } from "./use-wallet";
import { useWalletTransactions, useEscrowPositions, useWalletStats } from "./use-wallet";

export type { WalletTransaction, EscrowPosition, WalletStats };

// Re-export wallet hooks
export { useWalletTransactions, useEscrowPositions, useWalletStats };

// Invoice type
export interface Invoice {
  id: string;
  user_id: string;
  period: string; // "June 2024"
  amount_eth: number;
  amount_usd: number;
  status: "paid" | "pending" | "failed";
  jobs_count: number;
  invoice_number: string;
  created_at: string;
}

// SLA Credit type
export interface SLACredit {
  id: string;
  user_id: string;
  job_id: string;
  breach_type: "uptime" | "throughput" | "deadline";
  required_value: number;
  actual_value: number;
  credit_amount_eth: number;
  credit_amount_usd: number;
  created_at: string;
}

// Invoice API
async function fetchInvoices(userId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// SLA Credits API
async function fetchSLACredits(userId: string): Promise<SLACredit[]> {
  const { data, error } = await supabase
    .from("sla_credits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Topup mutation
async function createTopup(userId: string, amountEth: number): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/billing/topup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amountEth }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, txHash: data.txHash };
  } catch {
    return { success: false, error: "Network error" };
  }
}

// Hooks
export function useInvoices() {
  return useQuery({
    queryKey: ["billing", "invoices"],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) return [];
      return fetchInvoices(user.id);
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function useSLACredits() {
  return useQuery({
    queryKey: ["billing", "sla-credits"],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) return [];
      return fetchSLACredits(user.id);
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function useTopup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      const user = await getCurrentUser();
      if (!user) return { success: false, error: "Not authenticated" };
      return createTopup(user.id, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });
}

// Derived billing summary from wallet hooks
export function useBillingSummary() {
  const { data: txns = [] } = useWalletTransactions();
  const { data: escrowPositions = [] } = useEscrowPositions();
  const { data: stats } = useWalletStats();

  return {
    // Available = credits (deposits) - debits - slashing
    availableBalance: stats?.totalBalance ?? 0,
    // Locked = active escrow positions
    lockedBalance: escrowPositions.reduce((sum, p) => sum + p.amount_eth, 0),
    // Total spent MTD
    mtdSpent: txns
      .filter((t) => {
        const created = new Date(t.created_at);
        const now = new Date();
        return (
          t.type === "job_payment" &&
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, t) => sum + t.amount_usd, 0),
    // Total credits MTD
    mtdCredits: txns
      .filter((t) => {
        const created = new Date(t.created_at);
        const now = new Date();
        return (
          t.type === "slashing" &&
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, t) => sum + Math.abs(t.amount_usd), 0),
    recentTransactions: txns.slice(0, 10),
  };
}
