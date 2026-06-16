export type JobStatus = "pending" | "running" | "completed" | "failed" | "requeued";
export type NodeStatus = "offline" | "online" | "stale" | "slashed";

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
  createdAt: number;
  deadline: number;
}

export interface Node {
  address: string;
  stakeAmount: number;
  reputation: number;
  status: NodeStatus;
  lastHeartbeat: number;
}

export interface Heartbeat {
  nodeId: string;
  vramUsed: number;
  vramTotal: number;
  packetLatency: number;
  timestamp: number;
}