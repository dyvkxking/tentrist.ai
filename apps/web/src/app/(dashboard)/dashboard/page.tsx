"use client";

import * as React from "react";
import {
  Activity,
  Server,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { LiveIndicator } from "@/components/shared/live-indicator";
import { useJobs } from "@/hooks/use-jobs";
import { useNodes, useNetworkStats } from "@/hooks/use-nodes";
import { useAuth } from "@/hooks/use-auth";
import { useAccount, useReadContract } from "wagmi";
import { ESCROW_ABI, CONTRACT_ADDRESSES } from "@/lib/contracts";

// Format relative time
function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Execution log from job data
interface ExecutionLog {
  id: string;
  timestamp: Date;
  type: "job_submitted" | "job_completed" | "job_failed" | "node_slashed" | "sla_breach";
  message: string;
  metadata?: Record<string, string>;
}

const logTypeIcons: Record<ExecutionLog["type"], React.ReactNode> = {
  job_submitted: <RefreshCw className="h-3.5 w-3.5 text-blue-400" />,
  job_completed: <CheckCircle2 className="h-3.5 w-3.5 text-indicator-active" />,
  job_failed: <XCircle className="h-3.5 w-3.5 text-indicator-slashed" />,
  node_slashed: <AlertTriangle className="h-3.5 w-3.5 text-indicator-slashed" />,
  sla_breach: <AlertTriangle className="h-3.5 w-3.5 text-indicator-stale" />,
};

// Empty state
function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-zinc-800 rounded-lg">
      <div className="text-foreground-muted mb-1 text-sm">{description}</div>
      <div className="text-xs font-medium text-foreground">{title}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { address, isConnected } = useAccount();
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: nodes, isLoading: nodesLoading } = useNodes();
  const { data: networkStats } = useNetworkStats();

  // Real Escrow stake balance via wagmi
  const { data: myStakeRaw } = useReadContract({
    address: CONTRACT_ADDRESSES.Escrow,
    abi: ESCROW_ABI,
    functionName: "getStake",
    args: [address!],
    query: { enabled: !!address && isConnected },
  });

  // Build execution logs from real job data
  const logs: ExecutionLog[] = React.useMemo(() => {
    if (!jobs) return [];
    return jobs.slice(0, 15).map((job) => {
      const timestamp = new Date(job.createdAt);
      let type: ExecutionLog["type"] = "job_submitted";
      let message = `Job ${job.id.slice(0, 8)} submitted`;

      if (job.status === "completed") {
        type = "job_completed";
        message = `Job ${job.id.slice(0, 8)} completed successfully`;
      } else if (job.status === "failed") {
        type = "job_failed";
        message = `Job ${job.id.slice(0, 8)} failed`;
      } else if (job.status === "running") {
        message = `Job ${job.id.slice(0, 8)} running (${job.progress}%)`;
      }

      return {
        id: job.id,
        timestamp,
        type,
        message,
        metadata: { jobId: job.id },
      };
    });
  }, [jobs]);

  // Cluster nodes from real data
  const clusterNodes = React.useMemo(() => {
    if (!nodes) return [];
    return nodes.slice(0, 12).map((node) => ({
      id: node.id,
      address: node.address,
      status: node.status,
      vramUsed: node.vramUsed,
      vramTotal: node.vramTotal,
      reputation: node.reputation,
      lastHeartbeat: new Date(node.lastHeartbeat),
    }));
  }, [nodes]);

  const isLoading = jobsLoading || nodesLoading;

  // Stats from real data
  const stats = React.useMemo(() => {
    const totalJobs = jobs?.length ?? 0;
    const activeJobs = jobs?.filter((j) => j.status === "running" || j.status === "pending").length ?? 0;
    const completedJobs = jobs?.filter((j) => j.status === "completed").length ?? 0;
    const failedJobs = jobs?.filter((j) => j.status === "failed").length ?? 0;
    const onlineNodes = nodes?.filter((n) => n.status === "online").length ?? 0;
    const totalNodes = nodes?.length ?? 0;

    return {
      totalJobs,
      activeJobs,
      completedJobs,
      failedJobs,
      serverlessBalance: myStakeRaw
        ? (Number(myStakeRaw) / 1e18).toFixed(4)
        : "0.0000",
      globalNodes: totalNodes,
      onlineNodes,
      slaCompliance: totalJobs > 0
        ? `${((completedJobs / totalJobs) * 100).toFixed(1)}%`
        : "—",
      pendingSlashes: nodes?.filter((n) => n.status === "slashed").length ?? 0,
    };
  }, [jobs, nodes, myStakeRaw]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Control Room"
        description={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''} — real-time GPU orchestration`}
      />

      {/* Stats Grid */}
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Jobs"
          value={stats.totalJobs.toLocaleString()}
          trend={stats.totalJobs > 0 ? "up" : "neutral"}
          trendValue={stats.activeJobs > 0 ? `${stats.activeJobs} active` : "none"}
          glowColor={stats.totalJobs > 0 ? "active" : "none"}
          className="bg-bg-surface/80"
        />
        <MetricCard
          label="Serverless Balance"
          value={`${stats.serverlessBalance} ETH`}
          trend="neutral"
          trendValue="—"
          glowColor="none"
          className="bg-bg-surface/80"
        />
        <MetricCard
          label="Global Nodes"
          value={stats.globalNodes.toString()}
          trend={stats.onlineNodes > stats.globalNodes / 2 ? "up" : "down"}
          trendValue={`${stats.onlineNodes} online`}
          glowColor={stats.onlineNodes > 0 ? "active" : "none"}
          className="bg-bg-surface/80"
        />
        <MetricCard
          label="SLA Compliance"
          value={stats.slaCompliance}
          trend={stats.slaCompliance === "—" ? "neutral" : "up"}
          trendValue="—"
          glowColor={stats.slaCompliance !== "—" ? "active" : "none"}
          className="bg-bg-surface/80"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Execution Logs */}
        <Card className="lg:col-span-2 bg-bg-surface/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-indicator-active" />
                Execution Logs
              </CardTitle>
              <Badge variant="outline" className="text-xs font-mono-data">
                {isLoading ? "—" : logs.length > 0 ? "LIVE" : "EMPTY"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 bg-bg-base/50 rounded animate-pulse" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No execution logs"
                  description="Submit a job to see activity here"
                />
              </div>
            ) : (
              <div className="max-h-[360px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-bg-surface border-b border-hairline">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">Event</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">Message</th>
                      <th className="text-right px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">Time</th>
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
                          <span className="text-foreground font-mono-data text-xs">{log.message}</span>
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
                <span className="text-sm text-foreground-muted">Completed</span>
                <span className="text-sm font-mono-data text-indicator-active">{stats.completedJobs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Failed</span>
                <span className="text-sm font-mono-data text-indicator-slashed">{stats.failedJobs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Pending Slashes</span>
                <span className="text-sm font-mono-data text-indicator-stale">{stats.pendingSlashes}</span>
              </div>
            </CardContent>
          </Card>

          {/* Node Distribution */}
          <Card className="bg-bg-surface/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Server className="h-4 w-4 text-indicator-stale" />
                Node Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-6 bg-bg-base/50 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indicator-active pulse-active" />
                      <span className="text-sm text-foreground-muted">Online</span>
                    </div>
                    <span className="text-sm font-mono-data text-indicator-active">{stats.onlineNodes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indicator-stale" />
                      <span className="text-sm text-foreground-muted">Stale</span>
                    </div>
                    <span className="text-sm font-mono-data text-indicator-stale">
                      {networkStats?.staleNodes ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-foreground-muted" />
                      <span className="text-sm text-foreground-muted">Offline</span>
                    </div>
                    <span className="text-sm font-mono-data text-foreground-muted">
                      {networkStats?.offlineNodes ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indicator-slashed" />
                      <span className="text-sm text-foreground-muted">Slashed</span>
                    </div>
                    <span className="text-sm font-mono-data text-indicator-slashed">
                      {networkStats?.slashedNodes ?? 0}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-hairline flex items-center justify-between">
                    <span className="text-xs text-foreground-muted">Avg Reputation</span>
                    <span className="text-xs font-mono-data text-foreground">
                      {networkStats?.averageReputation ?? 0}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cluster Overview */}
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
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 bg-bg-base/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : clusterNodes.length === 0 ? (
            <EmptyState
              title="No nodes registered"
              description="Register GPU nodes to start processing workloads"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {clusterNodes.map((node) => (
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
                      {node.address.slice(0, 6)}...{node.address.slice(-4)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="h-1.5 bg-bg-base rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          node.vramTotal > 0 && node.vramUsed / node.vramTotal > 0.9
                            ? "bg-indicator-slashed"
                            : node.vramTotal > 0 && node.vramUsed / node.vramTotal > 0.7
                            ? "bg-indicator-stale"
                            : "bg-indicator-active"
                        )}
                        style={{ width: node.vramTotal > 0 ? `${(node.vramUsed / node.vramTotal) * 100}%` : "0%" }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono-data text-foreground-muted">
                      <span>{node.vramUsed}GB</span>
                      <span>{node.vramTotal}GB</span>
                    </div>
                  </div>

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

      {/* Recent Jobs */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-indicator-stale" />
              Recent Jobs
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-bg-base/50 rounded animate-pulse" />
              ))}
            </div>
          ) : !jobs || jobs.length === 0 ? (
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
                    <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">Job ID</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">SLA</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">Progress</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {jobs.slice(0, 8).map((job) => (
                    <tr key={job.id} className="hover:bg-bg-base/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono-data text-foreground text-xs">{job.id.slice(0, 12)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={job.status} showPulse size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {job.status === "completed" ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-indicator-active" />
                          ) : job.status === "failed" ? (
                            <XCircle className="h-3.5 w-3.5 text-indicator-slashed" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 text-indicator-stale" />
                          )}
                          <span className="text-xs text-foreground-muted">
                            {job.sla.requiredUptime.toFixed(0)}% uptime
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-bg-base rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                job.status === "completed"
                                  ? "bg-indicator-active"
                                  : job.status === "failed"
                                  ? "bg-indicator-slashed"
                                  : "bg-indicator-stale"
                              )}
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono-data text-foreground-muted w-8 text-right">
                            {job.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-mono-data text-foreground">
                          ${job.cost.toFixed(4)}
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
    </div>
  );
}