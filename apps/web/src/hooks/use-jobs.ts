"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi, type Job as SupabaseJob } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import * as React from "react";

// Types
export type JobStatus = "pending" | "running" | "completed" | "failed" | "requeued" | "cancelled";

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

export interface JobLog {
  id: string;
  timestamp: number;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  nodeId?: string;
}

export interface NodeAssignment {
  nodeId: string;
  address: string;
  status: "assigned" | "processing" | "completed" | "failed";
  progress: number;
  vramUsed: number;
  vramTotal: number;
  lastHeartbeat: number;
}

// Map Supabase job to frontend Job type
function mapJob(sbJob: SupabaseJob): Job {
  return {
    id: sbJob.id,
    clientId: sbJob.user_id,
    sla: {
      requiredUptime: sbJob.sla_uptime_required ?? 95,
      requiredThroughput: sbJob.sla_throughput_required ?? 100,
      deadline: sbJob.deadline ? new Date(sbJob.deadline).getTime() : Date.now() + 24 * 60 * 60 * 1000,
    },
    status: sbJob.status,
    assignedNodes: sbJob.node_id ? [sbJob.node_id] : [],
    checkpointRef: sbJob.checkpoint_url ?? "",
    progress: sbJob.status === "completed" ? 100 : sbJob.status === "failed" ? 0 : 50,
    cost: sbJob.price_charged_usd ?? sbJob.budget_usd ?? 0,
    actualUptime: undefined,
    actualThroughput: undefined,
    createdAt: new Date(sbJob.created_at).getTime(),
    deadline: sbJob.deadline ? new Date(sbJob.deadline).getTime() : Date.now() + 24 * 60 * 60 * 1000,
  };
}

// Logs and node assignments still use mock data (not stored in Supabase)
const mockLogs: Record<string, JobLog[]> = {};
const mockNodeAssignments: Record<string, NodeAssignment[]> = {};

function generateLogs(jobId: string, count: number = 50): JobLog[] {
  const levels: JobLog["level"][] = ["info", "warn", "error", "debug"];
  const messages = [
    "Heartbeat received from node",
    "Checkpoint saved successfully",
    "Processing batch {i}/{total}",
    "GPU memory allocation: {mem}GB",
    "Network latency: {lat}ms",
    "Work unit completed",
    "Uptime verification passed",
    "Throughput check: {throughput} ops/s",
    "Node reconnection attempt {attempt}",
    "Job progress update: {progress}%",
  ];

  return Array.from({ length: count }, (_, i) => {
    const level = levels[Math.floor(Math.random() * levels.length)];
    const message = messages[Math.floor(Math.random() * messages.length)]
      .replace("{i}", String(Math.floor(Math.random() * 100)))
      .replace("{total}", String(Math.floor(Math.random() * 100)))
      .replace("{mem}", (Math.random() * 16).toFixed(1))
      .replace("{lat}", String(Math.floor(Math.random() * 200)))
      .replace("{throughput}", String(Math.floor(Math.random() * 500)))
      .replace("{attempt}", String(Math.floor(Math.random() * 3) + 1))
      .replace("{progress}", String(Math.floor(Math.random() * 100)));

    return {
      id: `log_${jobId}_${i}`,
      timestamp: Date.now() - (count - i) * 1000 * Math.random() * 10,
      level,
      message,
      nodeId: `node_${Math.floor(Math.random() * 5)}`,
    };
  });
}

function generateNodeAssignments(jobId: string): NodeAssignment[] {
  return Array.from({ length: 3 }, (_, i) => ({
    nodeId: `node_${i}`,
    address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    status: (["assigned", "processing", "completed", "failed"] as NodeAssignment["status"][])[Math.floor(Math.random() * 4)],
    progress: Math.floor(Math.random() * 100),
    vramUsed: Math.floor(Math.random() * 16),
    vramTotal: 16,
    lastHeartbeat: Date.now() - Math.random() * 60000,
  }));
}

// API functions (Supabase)
async function fetchJobs(): Promise<Job[]> {
  const user = useAuthStore.getState().user;
  if (!user) return [];

  const sbJobs = await jobsApi.list(50);
  return sbJobs.map(mapJob);
}

async function fetchJob(id: string): Promise<Job | null> {
  try {
    const sbJob = await jobsApi.get(id);
    return mapJob(sbJob);
  } catch {
    return null;
  }
}

async function fetchJobLogs(jobId: string): Promise<JobLog[]> {
  await new Promise((r) => setTimeout(r, 100));
  if (!mockLogs[jobId]) {
    mockLogs[jobId] = generateLogs(jobId, 100);
  }
  return mockLogs[jobId];
}

async function fetchNodeAssignments(jobId: string): Promise<NodeAssignment[]> {
  await new Promise((r) => setTimeout(r, 150));
  if (!mockNodeAssignments[jobId]) {
    mockNodeAssignments[jobId] = generateNodeAssignments(jobId);
  }
  return mockNodeAssignments[jobId];
}

// Hooks
export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 10000,
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ["jobs", id],
    queryFn: () => fetchJob(id),
    refetchInterval: 5000, // Poll every 5 seconds for detail view
    staleTime: 2000,
    enabled: !!id,
  });
}

export function useJobLogs(jobId: string) {
  return useQuery({
    queryKey: ["jobs", jobId, "logs"],
    queryFn: () => fetchJobLogs(jobId),
    refetchInterval: 2000, // Poll every 2 seconds for logs
    staleTime: 1000,
    enabled: !!jobId,
  });
}

export function useNodeAssignments(jobId: string) {
  return useQuery({
    queryKey: ["jobs", jobId, "assignments"],
    queryFn: () => fetchNodeAssignments(jobId),
    refetchInterval: 10000, // Poll every 10 seconds
    staleTime: 5000,
    enabled: !!jobId,
  });
}

// Streaming log hook (simulated SSE-like behavior)
export function useStreamingLogs(jobId: string, enabled: boolean = true) {
  const [logs, setLogs] = React.useState<JobLog[]>([]);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    if (!enabled || !jobId) return;

    setIsConnected(true);

    // Initial fetch
    fetchJobLogs(jobId).then(setLogs);

    // Simulate streaming with interval
    const interval = setInterval(async () => {
      const newLogs = await fetchJobLogs(jobId);
      setLogs((prev) => {
        // Append only new logs
        const existingIds = new Set(prev.map((l) => l.id));
        const fresh = newLogs.filter((l) => !existingIds.has(l.id));
        return [...prev, ...fresh].slice(-500); // Keep last 500
      });
    }, 2000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [jobId, enabled]);

  return { logs, isConnected, appendLog: (log: JobLog) => setLogs((prev) => [...prev, log]) };
}
