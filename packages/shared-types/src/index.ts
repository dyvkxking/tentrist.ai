// Shared types across web and nodes apps

export type JobStatus = "pending" | "running" | "completed" | "failed" | "requeued" | "cancelled";
export type NodeStatus = "online" | "offline" | "stale" | "slashed" | "maintenance" | "busy";
export type ReputationTier = "gold" | "silver" | "bronze" | "unranked";
export type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

export interface SLABenchmark {
  requiredUptime: number;
  requiredThroughput: number;
  deadline: number;
}

export interface Job {
  id: string;
  clientId: string;
  sla: SLABenchmark;
  status: JobStatus;
  assignedNodes: string[];
  checkpointRef: string;
  progress: number;
  cost: number;
  actualUptime?: number;
  actualThroughput?: number;
  createdAt: number;
  deadline: number;
}

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

export function getReputationTier(score: number): ReputationTier {
  if (score >= 100) return "gold";
  if (score >= 50) return "silver";
  if (score >= 0) return "bronze";
  return "unranked";
}