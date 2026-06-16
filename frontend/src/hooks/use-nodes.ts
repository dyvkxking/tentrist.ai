"use client";

import { useQuery } from "@tanstack/react-query";

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

// Mock data generators
function generateMockNodes(count: number = 25): NodeProvider[] {
  const statuses: NodeStatus[] = ["online", "online", "online", "online", "stale", "offline", "slashed"];
  const regions = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1", "eu-central-1"];
  const cpuModels = [
    "AMD EPYC 9654",
    "NVIDIA A100 80GB",
    "NVIDIA H100 80GB",
    "AMD Instinct MI300X",
    "NVIDIA A6000",
  ];

  return Array.from({ length: count }, (_, i) => {
    const reputation = Math.floor(Math.random() * 200) - 30;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      id: `node_${i.toString().padStart(4, "0")}`,
      address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      status,
      reputation,
      tier: getReputationTier(reputation),
      stakeAmount: Math.floor(Math.random() * 50) + 10,
      stakeCurrency: "ETH",
      vramUsed: Math.floor(Math.random() * 80),
      vramTotal: 80,
      cpuCores: [64, 128, 256][Math.floor(Math.random() * 3)],
      cpuModel: cpuModels[Math.floor(Math.random() * cpuModels.length)],
      region: regions[Math.floor(Math.random() * regions.length)],
      uptime: Math.floor(Math.random() * 99) + 1,
      lastHeartbeat: Date.now() - Math.random() * 120000,
      totalJobsCompleted: Math.floor(Math.random() * 500),
      totalJobsFailed: Math.floor(Math.random() * 20),
      createdAt: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
    };
  });
}

// API functions (mock)
async function fetchNodes(): Promise<NodeProvider[]> {
  await new Promise((r) => setTimeout(r, 300));
  return generateMockNodes(25);
}

async function fetchNode(id: string): Promise<NodeProvider | null> {
  await new Promise((r) => setTimeout(r, 200));
  const nodes = generateMockNodes(25);
  return nodes.find((n) => n.id === id) || null;
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
      await new Promise((r) => setTimeout(r, 200));
      const nodes = generateMockNodes(100);

      return {
        totalNodes: nodes.length,
        onlineNodes: nodes.filter((n) => n.status === "online").length,
        staleNodes: nodes.filter((n) => n.status === "stale").length,
        offlineNodes: nodes.filter((n) => n.status === "offline").length,
        slashedNodes: nodes.filter((n) => n.status === "slashed").length,
        totalStaked: nodes.reduce((sum, n) => sum + n.stakeAmount, 0),
        averageReputation: Math.floor(
          nodes.reduce((sum, n) => sum + n.reputation, 0) / nodes.length
        ),
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
