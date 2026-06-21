"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi, supabase, type Job as SupabaseJob } from "@/lib/supabase";
import { getCurrentUser } from "@/stores/auth-store";
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

// API functions (Supabase)
async function fetchJobs(): Promise<Job[]> {
  const user = await getCurrentUser();
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
  const { data, error } = await supabase
    .from("job_logs")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((log: Record<string, unknown>) => ({
    id: log.id as string,
    timestamp: new Date(log.created_at as string).getTime(),
    level: log.level as JobLog["level"],
    message: log.message as string,
    nodeId: log.node_id as string | undefined,
  }));
}

async function fetchNodeAssignments(jobId: string): Promise<NodeAssignment[]> {
  const { data, error } = await supabase
    .from("node_assignments")
    .select("*, nodes(wallet_address)")
    .eq("job_id", jobId);
  if (error) throw error;
  return (data ?? []).map((assignment: Record<string, unknown>) => {
    const node = assignment.nodes as Record<string, unknown> | null;
    return {
      nodeId: assignment.node_id as string,
      address: node?.wallet_address as string ?? "",
      status: assignment.status as NodeAssignment["status"],
      progress: assignment.progress as number,
      vramUsed: assignment.vram_used as number,
      vramTotal: assignment.vram_total as number,
      lastHeartbeat: assignment.last_heartbeat_at
        ? new Date(assignment.last_heartbeat_at as string).getTime()
        : Date.now(),
    };
  });
}

// Hooks
export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
    refetchInterval: 60000, // Poll every 60 seconds (reduced from 30s)
    staleTime: 30000, // Cache for 30s
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ["jobs", id],
    queryFn: () => fetchJob(id),
    refetchInterval: 15000, // Poll every 15s for detail view (reduced from 5s)
    staleTime: 5000,
    enabled: !!id,
  });
}

export function useJobLogs(jobId: string) {
  return useQuery({
    queryKey: ["jobs", jobId, "logs"],
    queryFn: () => fetchJobLogs(jobId),
    refetchInterval: 10000, // Poll every 10s for logs (reduced from 2s)
    staleTime: 5000,
    enabled: !!jobId,
  });
}

export function useNodeAssignments(jobId: string) {
  return useQuery({
    queryKey: ["jobs", jobId, "assignments"],
    queryFn: () => fetchNodeAssignments(jobId),
    refetchInterval: 30000, // Poll every 30s (reduced from 10s)
    staleTime: 15000,
    enabled: !!jobId,
  });
}

// Streaming log hook using Supabase Realtime
export function useStreamingLogs(jobId: string, enabled: boolean = true) {
  const [logs, setLogs] = React.useState<JobLog[]>([]);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    if (!enabled || !jobId) return;

    // Initial fetch
    fetchJobLogs(jobId).then(setLogs).catch(console.error);
    setIsConnected(true);

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`job-logs-${jobId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "job_logs", filter: `job_id=eq.${jobId}` },
        (payload) => {
          const newLog = payload.new as Record<string, unknown>;
          setLogs((prev) => [
            ...prev,
            {
              id: newLog.id as string,
              timestamp: new Date(newLog.created_at as string).getTime(),
              level: newLog.level as JobLog["level"],
              message: newLog.message as string,
              nodeId: newLog.node_id as string | undefined,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [jobId, enabled]);

  return { logs, isConnected, appendLog: (log: JobLog) => setLogs((prev) => [...prev, log]) };
}
