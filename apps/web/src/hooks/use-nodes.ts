"use client";

import { useQuery } from "@tanstack/react-query";
import { nodesApi, type Node as SupabaseNode } from "@/lib/supabase";

// Types
export type NodeStatus = "online" | "offline" | "stale" | "slashed";
export type ReputationTier = "gold" | "silver" | "bronze" | "unranked";

export interface NodeProvider {
  id: string;
  address: string;
  status: NodeStatus;
  reputation: number;
  tier: ReputationTier;
  stakeAmount: number;
  stakeCurrency: string;
  vramUsed: number;
  vramTotal: number;
  cpuCores: number;
  cpuModel: string;
  region: string;
  uptime: number;
  lastHeartbeat: number;
  totalJobsCompleted: number;
  totalJobsFailed: number;
  createdAt: number;
}

// Helper to determine tier from reputation score
export function getReputationTier(score: number): ReputationTier {
  if (score >= 100) return "gold";
  if (score >= 50) return "silver";
  if (score >= 0) return "bronze";
  return "unranked";
}

// Map Supabase node to frontend NodeProvider type
function mapNode(sbNode: SupabaseNode): NodeProvider {
  return {
    id: sbNode.id,
    address: sbNode.wallet_address,
    status: (sbNode.status === "busy" || sbNode.status === "maintenance") ? "online" : sbNode.status,
    reputation: sbNode.reputation_score,
    tier: getReputationTier(sbNode.reputation_score),
    stakeAmount: sbNode.stake_amount ? Number(sbNode.stake_amount) / 1e18 : 0, // wei → ETH
    stakeCurrency: "ETH",
    vramUsed: sbNode.vram_used_mb ?? 0,
    vramTotal: sbNode.vram_total_mb,
    cpuCores: sbNode.cpu_cores ?? 0,
    cpuModel: sbNode.gpu_model ?? "Unknown",
    region: sbNode.location ?? "Unknown",
    uptime: sbNode.uptime_seconds ?? 0,
    lastHeartbeat: sbNode.last_heartbeat_at ? new Date(sbNode.last_heartbeat_at).getTime() : 0,
    totalJobsCompleted: sbNode.total_jobs_completed,
    totalJobsFailed: sbNode.total_jobs_failed ?? 0,
    createdAt: new Date(sbNode.created_at).getTime(),
  };
}

// API functions (Supabase)
async function fetchNodes(): Promise<NodeProvider[]> {
  const sbNodes = await nodesApi.list();
  return sbNodes.map(mapNode);
}

async function fetchNode(id: string): Promise<NodeProvider | null> {
  try {
    const sbNode = await nodesApi.get(id);
    return mapNode(sbNode);
  } catch {
    return null;
  }
}

// Hooks
export function useNodes() {
  return useQuery({
    queryKey: ["nodes"],
    queryFn: fetchNodes,
    refetchInterval: 60000, // Poll every 60s (reduced)
    staleTime: 30000,
  });
}

export function useNode(id: string) {
  return useQuery({
    queryKey: ["nodes", id],
    queryFn: () => fetchNode(id),
    refetchInterval: 30000, // Poll every 30s (reduced from 10s)
    staleTime: 15000,
    enabled: !!id,
  });
}

// Network-wide stats hook
export interface NetworkStats {
  totalNodes: number;
  onlineNodes: number;
  staleNodes: number;
  offlineNodes: number;
  slashedNodes: number;
  totalStaked: number;
  averageReputation: number;
  totalVRAM: number;
  availableVRAM: number;
  goldTierCount: number;
  silverTierCount: number;
  bronzeTierCount: number;
  unrankedTierCount: number;
}

export function useNetworkStats() {
  return useQuery({
    queryKey: ["nodes", "network-stats"],
    queryFn: async (): Promise<NetworkStats> => {
      // Re-use the data from useNodes hook via queryClient to avoid double-fetch
      const sbNodes = await nodesApi.list();
      const nodes = sbNodes.map(mapNode);

      return {
        totalNodes: nodes.length,
        onlineNodes: nodes.filter((n) => n.status === "online").length,
        staleNodes: nodes.filter((n) => n.status === "stale").length,
        offlineNodes: nodes.filter((n) => n.status === "offline").length,
        slashedNodes: nodes.filter((n) => n.status === "slashed").length,
        totalStaked: nodes.reduce((sum, n) => sum + n.stakeAmount, 0),
        averageReputation: nodes.length > 0
          ? Math.floor(nodes.reduce((sum, n) => sum + n.reputation, 0) / nodes.length)
          : 0,
        totalVRAM: nodes.reduce((sum, n) => sum + n.vramTotal, 0),
        availableVRAM: nodes.reduce((sum, n) => sum + (n.vramTotal - n.vramUsed), 0),
        goldTierCount: nodes.filter((n) => n.tier === "gold").length,
        silverTierCount: nodes.filter((n) => n.tier === "silver").length,
        bronzeTierCount: nodes.filter((n) => n.tier === "bronze").length,
        unrankedTierCount: nodes.filter((n) => n.tier === "unranked").length,
      };
    },
    refetchInterval: 60000, // Increased to 60s - reduce network load
    staleTime: 30000, // Cache for 30s before refetch
  });
}
