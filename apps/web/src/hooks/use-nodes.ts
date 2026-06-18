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
    stakeAmount: 0, // Not stored in nodes table
    stakeCurrency: "ETH",
    vramUsed: 0, // Not in node_heartbeats for this mapping
    vramTotal: sbNode.vram_total_mb,
    cpuCores: 0, // Not stored
    cpuModel: sbNode.gpu_model ?? "Unknown",
    region: sbNode.location ?? "Unknown",
    uptime: 0, // Not calculated
    lastHeartbeat: sbNode.last_heartbeat_at ? new Date(sbNode.last_heartbeat_at).getTime() : 0,
    totalJobsCompleted: sbNode.total_jobs_completed,
    totalJobsFailed: 0, // Not stored
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
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 10000,
  });
}

export function useNode(id: string) {
  return useQuery({
    queryKey: ["nodes", id],
    queryFn: () => fetchNode(id),
    refetchInterval: 10000,
    staleTime: 5000,
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
    refetchInterval: 30000,
    staleTime: 10000,
  });
}
