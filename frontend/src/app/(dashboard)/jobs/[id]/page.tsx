"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Server,
  Cpu,
  Activity,
  Zap,
  Timer,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/shared/page-header";
import { LiveIndicator } from "@/components/shared/live-indicator";
import { useJob, useNodeAssignments } from "@/hooks/use-jobs";
import type { Job, NodeAssignment, JobStatus } from "@/hooks/use-jobs";
import { useJobUpdates } from "@/hooks/use-sse-job";

function formatTimeRemaining(deadline: number): string {
  const diff = deadline - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${minutes}m`;
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 1000) return "just now";
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

// SLA Compliance Gauge Component
function SLAComplianceGauge({
  label,
  actual,
  required,
  unit,
}: {
  label: string;
  actual: number;
  required: number;
  unit: string;
}) {
  const percentage = Math.min((actual / required) * 100, 100);
  const isCompliant = actual >= required;
  const diff = actual - required;
  const diffStr = diff >= 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-foreground-muted uppercase tracking-wider">{label}</span>
        <span
          className={cn(
            "font-mono-data",
            isCompliant ? "text-indicator-active" : "text-indicator-slashed"
          )}
        >
          {isCompliant ? "✓ Compliant" : "✗ Breach"}
        </span>
      </div>
      <div className="relative h-2 bg-bg-base rounded-full overflow-hidden">
        {/* Required threshold marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-indicator-stale/50 z-10"
          style={{ left: "100%" }}
        />
        {/* Actual value bar */}
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isCompliant ? "bg-indicator-active" : "bg-indicator-slashed"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs font-mono-data">
        <span className="text-foreground">
          {actual.toFixed(1)}
          {unit}
        </span>
        <span className="text-foreground-muted">
          Required: {required.toFixed(1)}
          {unit}
        </span>
      </div>
      <div
        className={cn(
          "text-xs font-mono-data text-right",
          isCompliant ? "text-indicator-active" : "text-indicator-slashed"
        )}
      >
        {diffStr}
        {unit}
      </div>
    </div>
  );
}

// Node Worker Row Component
function NodeWorkerRow({ node }: { node: NodeAssignment }) {
  const statusColors = {
    assigned: "text-zinc-400",
    processing: "text-blue-400",
    completed: "text-indicator-active",
    failed: "text-indicator-slashed",
  };

  const vramPercentage = (node.vramUsed / node.vramTotal) * 100;
  const isStale = Date.now() - node.lastHeartbeat > 60000;

  return (
    <div className="flex items-center gap-4 p-3 bg-bg-base/50 rounded-lg border border-hairline">
      {/* Node Status Indicator */}
      <div className="flex-shrink-0">
        {node.status === "completed" ? (
          <CheckCircle2 className="h-4 w-4 text-indicator-active" />
        ) : node.status === "failed" ? (
          <XCircle className="h-4 w-4 text-indicator-slashed" />
        ) : (
          <Server
            className={cn(
              "h-4 w-4",
              statusColors[node.status as keyof typeof statusColors]
            )}
          />
        )}
      </div>

      {/* Node Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-mono-data text-foreground truncate">
            {node.nodeId}
          </span>
          <StatusBadge status={node.status as any} size="sm" />
        </div>
        <div className="text-xs text-foreground-muted font-mono-data truncate">
          {node.address}
        </div>
      </div>

      {/* VRAM */}
      <div className="flex-shrink-0 w-32">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-foreground-muted">VRAM</span>
          <span className="font-mono-data text-foreground">
            {node.vramUsed.toFixed(1)}/{node.vramTotal}GB
          </span>
        </div>
        <div className="h-1.5 bg-bg-base rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              vramPercentage > 90
                ? "bg-indicator-slashed"
                : vramPercentage > 75
                ? "bg-indicator-stale"
                : "bg-indicator-active"
            )}
            style={{ width: `${vramPercentage}%` }}
          />
        </div>
      </div>

      {/* Progress */}
      <div className="flex-shrink-0 w-20">
        <div className="text-xs text-foreground-muted mb-1">Progress</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-bg-base rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                node.status === "completed"
                  ? "bg-indicator-active"
                  : node.status === "failed"
                  ? "bg-indicator-slashed"
                  : "bg-indicator-stale"
              )}
              style={{ width: `${node.progress}%` }}
            />
          </div>
          <span className="text-xs font-mono-data text-foreground w-8">
            {node.progress}%
          </span>
        </div>
      </div>

      {/* Heartbeat */}
      <div className="flex-shrink-0 w-24 text-right">
        <div className="text-xs text-foreground-muted mb-1">Heartbeat</div>
        <div className="flex items-center justify-end gap-1.5">
          {isStale ? (
            <AlertTriangle className="h-3 w-3 text-indicator-stale" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-indicator-active pulse-active" />
          )}
          <span
            className={cn(
              "text-xs font-mono-data",
              isStale ? "text-indicator-stale" : "text-foreground-muted"
            )}
          >
            {getRelativeTime(node.lastHeartbeat)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
function JobDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-8 bg-bg-surface rounded w-48" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-bg-surface rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  const { data: job, isLoading: jobLoading, refetch } = useJob(jobId);
  const { data: nodeAssignments, isLoading: nodesLoading } = useNodeAssignments(jobId);
  const jobUpdates = useJobUpdates();

  // Apply SSE job updates
  React.useEffect(() => {
    if (jobUpdates.updates.length > 0) {
      const update = jobUpdates.updates.find((u) => u.jobId === jobId);
      if (update) {
        // Refresh job data on status change
        if (update.status) {
          refetch();
        }
      }
    }
  }, [jobUpdates.updates, jobId, refetch]);

  if (jobLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit" disabled>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
        <JobDetailSkeleton />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="h-12 w-12 text-indicator-stale mb-4" />
        <h2 className="text-lg font-semibold mb-2">Job Not Found</h2>
        <p className="text-foreground-muted mb-4">
          The job you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center rounded-md font-medium border bg-transparent text-foreground-muted hover:bg-bg-surface hover:text-foreground border-border-hairline h-8 px-3 text-xs gap-1.5 transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Link>
      </div>
    );
  }

  const isRunning = job.status === "running";
  const timeRemaining = formatTimeRemaining(job.deadline);
  const isDeadlineNear = job.deadline - Date.now() < 3600000; // Less than 1 hour

  return (
    <div className="flex flex-col gap-4">
      {/* Back Button */}
      <Link
        href="/jobs"
        className="inline-flex items-center justify-center rounded-md font-medium border bg-transparent text-foreground-muted hover:bg-bg-surface hover:text-foreground h-8 px-3 text-xs gap-1.5 transition-all w-fit"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Link>

      {/* Page Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground font-mono-data">
              {job.id}
            </h1>
            <StatusBadge status={job.status} showPulse />
          </div>
          <div className="flex items-center gap-4 text-sm text-foreground-muted">
            <span>Client: {job.clientId}</span>
            <span>•</span>
            <span>Checkpoint: {job.checkpointRef}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && <LiveIndicator />}
          <Link
            href={`/jobs/${jobId}/logs`}
            className="inline-flex items-center justify-center rounded-md font-medium border bg-transparent text-foreground border-border-hairline hover:bg-bg-surface hover:border-zinc-700 h-8 px-3 text-xs gap-1.5 transition-all"
          >
            View Logs
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </header>

      {/* Top Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Time Remaining"
          value={timeRemaining}
          glowColor={isDeadlineNear ? "stale" : "none"}
          trend={isDeadlineNear ? "down" : "neutral"}
          trendValue={isDeadlineNear ? "Critical" : undefined}
        />
        <MetricCard
          label="Progress"
          value={`${job.progress}%`}
          trend={job.progress === 100 ? "up" : job.progress > 50 ? "neutral" : "down"}
        />
        <MetricCard
          label="SLA Uptime"
          value={`${(job.actualUptime || 0).toFixed(1)}%`}
          trend={
            (job.actualUptime || 0) >= job.sla.requiredUptime ? "up" : "down"
          }
          trendValue={
            (job.actualUptime || 0) >= job.sla.requiredUptime
              ? "Compliant"
              : "At Risk"
          }
          glowColor={
            (job.actualUptime || 0) >= job.sla.requiredUptime
              ? "active"
              : "slashed"
          }
        />
        <MetricCard
          label="Throughput"
          value={`${job.actualThroughput || 0}`}
          trend={
            (job.actualThroughput || 0) >= job.sla.requiredThroughput
              ? "up"
              : "down"
          }
          trendValue="ops/s"
          glowColor={
            (job.actualThroughput || 0) >= job.sla.requiredThroughput
              ? "active"
              : "stale"
          }
        />
      </div>

      {/* SLA Compliance Section */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-indicator-active" />
            SLA Compliance Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <SLAComplianceGauge
              label="Uptime"
              actual={job.actualUptime || 0}
              required={job.sla.requiredUptime}
              unit="%"
            />
            <SLAComplianceGauge
              label="Throughput"
              actual={job.actualThroughput || 0}
              required={job.sla.requiredThroughput}
              unit=" ops/s"
            />
          </div>

          {/* Deadline Info */}
          <div className="mt-6 pt-4 border-t border-hairline">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Timer className="h-4 w-4" />
                <span>Deadline</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-mono-data text-foreground">
                  {new Date(job.deadline).toLocaleString()}
                </span>
                <span
                  className={cn(
                    "text-sm font-mono-data",
                    isDeadlineNear ? "text-indicator-stale" : "text-foreground-muted"
                  )}
                >
                  ({timeRemaining} remaining)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Node Worker Array */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="h-4 w-4 text-blue-400" />
            Node Worker Array
            <span className="text-xs font-normal text-foreground-muted ml-2">
              ({nodeAssignments?.length || 0} nodes)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nodesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-bg-base rounded-lg animate-pulse" />
              ))}
            </div>
          ) : nodeAssignments && nodeAssignments.length > 0 ? (
            <div className="space-y-3">
              {nodeAssignments.map((node) => (
                <NodeWorkerRow key={node.nodeId} node={node} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-zinc-800 rounded-lg">
              <Server className="h-8 w-8 text-foreground-muted mb-2" />
              <p className="text-sm text-foreground-muted">No nodes assigned yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-indicator-stale" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1 p-3 bg-bg-base/50 rounded-lg">
              <span className="text-xs text-foreground-muted uppercase tracking-wider">
                Job Cost
              </span>
              <span className="text-xl font-mono-data text-indicator-active">
                ${job.cost.toFixed(4)}
              </span>
            </div>
            <div className="flex flex-col gap-1 p-3 bg-bg-base/50 rounded-lg">
              <span className="text-xs text-foreground-muted uppercase tracking-wider">
                SLA Penalty
              </span>
              <span className="text-xl font-mono-data text-indicator-slashed">
                $
                {(
                  ((job.sla.requiredUptime - (job.actualUptime || 0)) / 100) *
                  job.cost *
                  0.1
                ).toFixed(4)}
              </span>
            </div>
            <div className="flex flex-col gap-1 p-3 bg-bg-base/50 rounded-lg">
              <span className="text-xs text-foreground-muted uppercase tracking-wider">
                Net Cost
              </span>
              <span className="text-xl font-mono-data text-foreground">
                $
                {(
                  job.cost -
                  ((job.sla.requiredUptime - (job.actualUptime || 0)) / 100) *
                    job.cost *
                    0.1
                ).toFixed(4)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
