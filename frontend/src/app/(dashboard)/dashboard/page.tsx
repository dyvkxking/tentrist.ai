"use client";

import * as React from "react";
import {
  Activity,
  Server,
  Wallet,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { PageHeader, SystemStatusBar } from "@/components/shared/page-header";
import { LiveIndicator } from "@/components/shared/live-indicator";
import { useJobUpdates } from "@/hooks/use-sse-job";
import { useNodeUpdates } from "@/hooks/use-sse-node";
import { useAlertUpdates } from "@/hooks/use-sse-alert";

// Mock data types
interface ExecutionLog {
  id: string;
  timestamp: Date;
  type: "job_submitted" | "job_completed" | "job_failed" | "node_slashed" | "sla_breach";
  message: string;
  metadata?: Record<string, string>;
}

interface HeartbeatEvent {
  nodeId: string;
  timestamp: Date;
  status: "online" | "stale" | "offline";
  vramUsed: number;
  vramTotal: number;
  latencyMs: number;
}

interface ClusterNode {
  id: string;
  address: string;
  status: "online" | "stale" | "offline" | "slashed";
  vramUsed: number;
  vramTotal: number;
  reputation: number;
  lastHeartbeat: Date;
}

// Mock data generators
function generateMockLogs(count: number = 10): ExecutionLog[] {
  const types: ExecutionLog["type"][] = [
    "job_submitted",
    "job_completed",
    "job_failed",
    "node_slashed",
    "sla_breach",
  ];
  const messages: Record<ExecutionLog["type"], string> = {
    job_submitted: "Job {id} submitted to GPU pool",
    job_completed: "Job {id} completed successfully",
    job_failed: "Job {id} failed: {reason}",
    node_slashed: "Node {id} slashed for SLA breach",
    sla_breach: "SLA breach detected on job {id}",
  };

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const id = `job_${Math.random().toString(36).slice(2, 10)}`;
    return {
      id: `log_${i}`,
      timestamp: new Date(Date.now() - i * 60000 * Math.random() * 5),
      type,
      message: messages[type].replace("{id}", id).replace("{reason}", "timeout"),
      metadata: { jobId: id },
    };
  });
}

function generateMockHeartbeats(count: number = 8): HeartbeatEvent[] {
  return Array.from({ length: count }, (_, i) => ({
    nodeId: `node_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date(Date.now() - i * 30000),
    status: Math.random() > 0.1 ? "online" : Math.random() > 0.5 ? "stale" : "offline",
    vramUsed: Math.floor(Math.random() * 16),
    vramTotal: 16,
    latencyMs: Math.floor(Math.random() * 200) + 10,
  }));
}

function generateMockNodes(count: number = 12): ClusterNode[] {
  const statuses: ClusterNode["status"][] = ["online", "online", "online", "stale", "offline", "slashed"];
  return Array.from({ length: count }, (_, i) => ({
    id: `node_${i.toString().padStart(3, "0")}`,
    address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    vramUsed: Math.floor(Math.random() * 16),
    vramTotal: 16,
    reputation: Math.floor(Math.random() * 200) - 50,
    lastHeartbeat: new Date(Date.now() - Math.random() * 60000),
  }));
}

// Format relative time
function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Log type icons
const logTypeIcons: Record<ExecutionLog["type"], React.ReactNode> = {
  job_submitted: <RefreshCw className="h-3.5 w-3.5 text-blue-400" />,
  job_completed: <CheckCircle2 className="h-3.5 w-3.5 text-indicator-active" />,
  job_failed: <XCircle className="h-3.5 w-3.5 text-indicator-slashed" />,
  node_slashed: <AlertTriangle className="h-3.5 w-3.5 text-indicator-slashed" />,
  sla_breach: <AlertTriangle className="h-3.5 w-3.5 text-indicator-stale" />,
};

// Empty state component
function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-dashed border-zinc-800 rounded-lg">
      <div className="text-foreground-muted mb-2">{description}</div>
      <div className="text-sm font-medium text-foreground">{title}</div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default function DashboardPage() {
  // SSE-powered live updates
  const jobUpdates = useJobUpdates();
  const nodeUpdates = useNodeUpdates();
  const { alerts: activeAlerts } = useAlertUpdates();

  // Mock data - in real app this would come from API/WebSocket
  const [logs, setLogs] = React.useState<ExecutionLog[]>(generateMockLogs(15));
  const [heartbeats, setHeartbeats] = React.useState<HeartbeatEvent[]>(generateMockHeartbeats(8));
  const [nodes, setNodes] = React.useState<ClusterNode[]>(generateMockNodes(12));

  // Apply SSE node updates to state
  React.useEffect(() => {
    if (nodeUpdates.updates.length > 0) {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          const update = nodeUpdates.updates.find((u) => u.nodeId === node.id);
          if (update) {
            return {
              ...node,
              status: (update.status || node.status) as ClusterNode["status"],
              vramUsed: update.vramUsed ?? node.vramUsed,
            };
          }
          return node;
        })
      );
    }
  }, [nodeUpdates.updates]);

  // Apply SSE job updates - add new logs
  React.useEffect(() => {
    if (jobUpdates.updates.length > 0) {
      setLogs((prev) => {
        const newLogs = jobUpdates.updates.slice(0, 5).map((update) => ({
          id: `log_sse_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date(),
          type: (update.status === "completed"
            ? "job_completed"
            : update.status === "failed"
            ? "job_failed"
            : "job_submitted") as ExecutionLog["type"],
          message:
            update.status === "completed"
              ? `Job ${update.jobId} completed successfully`
              : update.status === "failed"
              ? `Job ${update.jobId} failed: ${update.message || "unknown error"}`
              : `Job ${update.jobId} ${update.message || "progress: " + update.progress + "%"}`,
          metadata: { jobId: update.jobId },
        }));
        return [...newLogs, ...prev].slice(0, 20);
      });
    }
  }, [jobUpdates.updates]);

  // Calculate stats
  const stats = {
    totalJobs: 1247,
    activeJobs: logs.filter((l) => l.type === "job_submitted").length,
    serverlessBalance: "12.5847",
    globalNodes: nodes.length,
    onlineNodes: nodes.filter((n) => n.status === "online").length,
    slaCompliance: "99.2%",
    pendingSlashes: nodes.filter((n) => n.status === "slashed").length,
  };

  const trendValues = { up: "12%", down: "3", neutral: "0" };

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <PageHeader
        title="Control Room"
        description="Real-time GPU compute orchestration dashboard"
      />

      {/* System Status Bar */}
      <SystemStatusBar status="connected" latencyMs={42} lastSync={new Date()} />

      {/* Stats Grid - High density metrics */}
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Jobs"
          value={stats.totalJobs.toLocaleString()}
          trend="up"
          trendValue={trendValues.up}
          glowColor="active"
          className="bg-bg-surface/80"
        />
        <MetricCard
          label="Serverless Balance"
          value={`${stats.serverlessBalance} ETH`}
          trend="neutral"
          trendValue={trendValues.neutral}
          glowColor="none"
          className="bg-bg-surface/80"
        />
        <MetricCard
          label="Global Nodes"
          value={stats.globalNodes.toString()}
          trend={stats.onlineNodes > stats.globalNodes / 2 ? "up" : "down"}
          trendValue={`${stats.onlineNodes} online`}
          glowColor="active"
          className="bg-bg-surface/80"
        />
        <MetricCard
          label="SLA Compliance"
          value={stats.slaCompliance}
          trend="up"
          trendValue="0.3%"
          glowColor="active"
          className="bg-bg-surface/80"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Execution Logs - Full height scrollable */}
        <Card className="lg:col-span-2 bg-bg-surface/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-indicator-active" />
                Execution Logs
              </CardTitle>
              <Badge variant="outline" className="text-xs font-mono-data">
                LIVE
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {logs.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No execution logs"
                  description="Execution events will appear here as jobs run"
                />
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-bg-surface border-b border-hairline">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                        Event
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                        Message
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-bg-base/50 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            {logTypeIcons[log.type]}
                            <span className="text-xs text-foreground-muted font-mono-data uppercase">
                              {log.type.replace(/_/g, " ")}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-foreground font-mono-data text-xs">
                            {log.message}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="text-xs text-foreground-muted font-mono-data">
                            {formatRelativeTime(log.timestamp)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {/* Heartbeat Activity */}
          <Card className="bg-bg-surface/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-indicator-stale" />
                Heartbeat Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {heartbeats.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    title="No heartbeats"
                    description="Waiting for node heartbeats..."
                  />
                </div>
              ) : (
                <div className="max-h-[180px] overflow-y-auto">
                  {heartbeats.map((hb, i) => (
                    <div
                      key={`${hb.nodeId}-${i}`}
                      className="flex items-center justify-between px-4 py-2 border-b border-hairline last:border-0 hover:bg-bg-base/50"
                    >
                      <div className="flex items-center gap-2">
                        <LiveIndicator
                          status={hb.status === "online" ? "connected" : hb.status === "stale" ? "reconnecting" : "disconnected"}
                          size="sm"
                        />
                        <span className="text-xs font-mono-data text-foreground">
                          {hb.nodeId}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono-data">
                        <span className="text-foreground-muted">
                          {hb.vramUsed}/{hb.vramTotal} GB
                        </span>
                        <span
                          className={cn(
                            hb.latencyMs < 100
                              ? "text-indicator-active"
                              : hb.latencyMs < 300
                              ? "text-indicator-stale"
                              : "text-indicator-slashed"
                          )}
                        >
                          {hb.latencyMs}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-bg-surface/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Active Jobs</span>
                <span className="text-sm font-mono-data text-indicator-active">{stats.activeJobs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Pending Slashes</span>
                <span className="text-sm font-mono-data text-indicator-slashed">{stats.pendingSlashes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Avg Latency</span>
                <span className="text-sm font-mono-data text-foreground">42ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Node Health</span>
                <span className="text-sm font-mono-data text-indicator-active">94.2%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cluster Visualization */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Server className="h-4 w-4 text-indicator-stale" />
              Cluster Overview
            </CardTitle>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indicator-active pulse-active" />
                <span className="text-foreground-muted">Online</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indicator-stale pulse-stale" />
                <span className="text-foreground-muted">Stale</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indicator-slashed" />
                <span className="text-foreground-muted">Offline/Slashed</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {nodes.length === 0 ? (
            <EmptyState
              title="No nodes registered"
              description="Register GPU nodes to start processing workloads"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={cn(
                    "relative p-3 rounded-lg border transition-all hover:border-zinc-700",
                    node.status === "online"
                      ? "border-indicator-active/30 bg-indicator-active/5"
                      : node.status === "stale"
                      ? "border-indicator-stale/30 bg-indicator-stale/5"
                      : "border-foreground-muted/20 bg-foreground-muted/5"
                  )}
                >
                  {/* Status dot */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        node.status === "online" && "bg-indicator-active pulse-active",
                        node.status === "stale" && "bg-indicator-stale pulse-stale",
                        node.status === "offline" && "bg-foreground-muted",
                        node.status === "slashed" && "bg-indicator-slashed"
                      )}
                    />
                    <span className="text-xs font-mono-data text-foreground truncate">
                      {node.id}
                    </span>
                  </div>

                  {/* VRAM bar */}
                  <div className="space-y-1">
                    <div className="h-1.5 bg-bg-base rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          node.vramUsed / node.vramTotal > 0.9
                            ? "bg-indicator-slashed"
                            : node.vramUsed / node.vramTotal > 0.7
                            ? "bg-indicator-stale"
                            : "bg-indicator-active"
                        )}
                        style={{ width: `${(node.vramUsed / node.vramTotal) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono-data text-foreground-muted">
                      <span>{node.vramUsed}GB</span>
                      <span>{node.vramTotal}GB</span>
                    </div>
                  </div>

                  {/* Reputation */}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-foreground-muted">Rep</span>
                    <span
                      className={cn(
                        "text-[10px] font-mono-data",
                        node.reputation > 100
                          ? "text-indicator-active"
                          : node.reputation > 0
                          ? "text-foreground"
                          : "text-indicator-slashed"
                      )}
                    >
                      {node.reputation > 0 ? "+" : ""}
                      {node.reputation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Jobs List */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-indicator-stale" />
              Recent Jobs
            </CardTitle>
            <button className="text-xs text-indicator-active hover:underline flex items-center gap-1">
              View all
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {logs.filter((l) => l.type.includes("job")).length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No jobs yet"
                description="Submit your first compute job to get started"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-bg-surface border-b border-hairline">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Job ID
                    </th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      SLA
                    </th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Nodes
                    </th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {logs
                    .filter((l) => l.type.includes("job"))
                    .slice(0, 5)
                    .map((log, i) => {
                      const statuses: Array<"pending" | "running" | "completed" | "failed"> = [
                        "pending",
                        "running",
                        "completed",
                        "failed",
                      ];
                      const status = statuses[i % statuses.length];
                      return (
                        <tr key={log.id} className="hover:bg-bg-base/50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono-data text-foreground text-xs">
                              {log.metadata?.jobId || `job_${i.toString().padStart(8, "0")}`}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={status} showPulse size="sm" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {status === "completed" ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-indicator-active" />
                              ) : status === "failed" ? (
                                <XCircle className="h-3.5 w-3.5 text-indicator-slashed" />
                              ) : (
                                <TrendingUp className="h-3.5 w-3.5 text-indicator-stale" />
                              )}
                              <span className="text-xs text-foreground-muted">
                                {status === "completed" ? "99.8%" : status === "failed" ? "87.2%" : "94.5%"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-xs font-mono-data text-foreground">
                              {Math.floor(Math.random() * 4) + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 bg-bg-base rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    status === "completed"
                                      ? "bg-indicator-active"
                                      : status === "failed"
                                      ? "bg-indicator-slashed"
                                      : "bg-indicator-stale"
                                  )}
                                  style={{ width: status === "completed" ? "100%" : status === "failed" ? "45%" : `${Math.floor(Math.random() * 60) + 40}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono-data text-foreground-muted w-8 text-right">
                                {status === "completed" ? "100" : status === "failed" ? "45" : "67"}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}