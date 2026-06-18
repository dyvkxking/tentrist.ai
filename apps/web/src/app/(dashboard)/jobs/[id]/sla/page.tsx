"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Zap, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { useJob } from "@/hooks/use-jobs";

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function JobSLAPage() {
  const { id } = useParams();
  const { data: job, isLoading } = useJob(id as string);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <div className="h-64 bg-bg-surface/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <p className="text-foreground-muted text-center py-12">Job not found.</p>
        <div className="flex justify-center">
          <Link href="/dashboard/jobs">
            <Button variant="outline">Back to Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const uptimeCompliant = (job.actualUptime ?? 0) >= job.sla.requiredUptime;
  const throughputCompliant = (job.actualThroughput ?? 0) >= job.sla.requiredThroughput;
  const isComplete = job.status === "completed" || job.status === "failed";
  const isRunning = job.status === "running";

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <PageHeader
        title="SLA Record"
        description="On-chain SLA benchmark and fulfillment record"
        breadcrumbs={[
          { label: "Jobs", href: "/dashboard/jobs" },
          { label: job.id.slice(0, 8), href: `/dashboard/jobs/${job.id}` },
          { label: "SLA" },
        ]}
      />

      {/* On-Chain Record Banner */}
      <Card className="bg-bg-surface/80 border-indicator-active/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indicator-active/20 flex items-center justify-center">
                <Zap className="h-4 w-4 text-indicator-active" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">On-Chain SLA Record</div>
                <div className="text-xs text-foreground-muted font-mono">
                  Escrow.sol — 0x4A5...F82c
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-3 w-3 mr-1" />
              Etherscan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SLA Benchmarks */}
      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>SLA Benchmarks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Uptime */}
            <div className="p-4 bg-bg-base rounded-lg border border-hairline">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-foreground-muted uppercase tracking-wider">Uptime</span>
                {isComplete ? (
                  uptimeCompliant ? (
                    <CheckCircle2 className="h-4 w-4 text-indicator-active" />
                  ) : (
                    <XCircle className="h-4 w-4 text-indicator-slashed" />
                  )
                ) : (
                  <Clock className="h-4 w-4 text-indicator-stale" />
                )}
              </div>
              <div className="text-3xl font-mono-data font-semibold mb-1">
                {job.sla.requiredUptime.toFixed(1)}%
              </div>
              <div className="text-xs text-foreground-muted">
                {isComplete
                  ? uptimeCompliant
                    ? `Fulfilled — ${job.actualUptime?.toFixed(2)}% actual`
                    : `Breached — ${job.actualUptime?.toFixed(2)}% actual`
                  : `Target: ${job.sla.requiredUptime}%`}
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-bg-surface rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isComplete ? (uptimeCompliant ? "bg-indicator-active" : "bg-indicator-slashed") : "bg-indicator-stale"
                  )}
                  style={{ width: isComplete ? `${Math.min((job.actualUptime! / job.sla.requiredUptime) * 100, 100)}%` : "30%" }}
                />
              </div>
            </div>

            {/* Throughput */}
            <div className="p-4 bg-bg-base rounded-lg border border-hairline">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-foreground-muted uppercase tracking-wider">Throughput</span>
                {isComplete ? (
                  throughputCompliant ? (
                    <CheckCircle2 className="h-4 w-4 text-indicator-active" />
                  ) : (
                    <XCircle className="h-4 w-4 text-indicator-slashed" />
                  )
                ) : (
                  <Clock className="h-4 w-4 text-indicator-stale" />
                )}
              </div>
              <div className="text-3xl font-mono-data font-semibold mb-1">
                {job.sla.requiredThroughput}
                <span className="text-sm font-normal text-foreground-muted ml-1">ops/s</span>
              </div>
              <div className="text-xs text-foreground-muted">
                {isComplete
                  ? throughputCompliant
                    ? `Fulfilled — ${job.actualThroughput?.toFixed(0)} ops/s actual`
                    : `Breached — ${job.actualThroughput?.toFixed(0)} ops/s actual`
                  : `Target: ${job.sla.requiredThroughput} ops/s`}
              </div>
              <div className="mt-3 h-1.5 bg-bg-surface rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isComplete ? (throughputCompliant ? "bg-indicator-active" : "bg-indicator-slashed") : "bg-indicator-stale"
                  )}
                  style={{ width: isComplete ? `${Math.min((job.actualThroughput! / job.sla.requiredThroughput) * 100, 100)}%` : "30%" }}
                />
              </div>
            </div>
          </div>

          {/* Deadline */}
          <div className="p-4 bg-bg-base rounded-lg border border-hairline">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-foreground-muted uppercase tracking-wider mb-1">Deadline</div>
                <div className="text-lg font-mono-data font-semibold">
                  {formatTimestamp(job.sla.deadline)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-foreground-muted">
                  {new Date(job.sla.deadline) > new Date() ? (
                    <span className="text-indicator-stale">Pending</span>
                  ) : job.status === "completed" ? (
                    <span className="text-indicator-active">Met</span>
                  ) : (
                    <span className="text-indicator-slashed">Missed</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fulfillment Summary */}
      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Fulfillment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                label: "SLA Status",
                value: isComplete
                  ? uptimeCompliant && throughputCompliant ? "Fulfilled" : "Breached"
                  : "In Progress",
                color: isComplete
                  ? uptimeCompliant && throughputCompliant ? "text-indicator-active" : "text-indicator-slashed"
                  : "text-indicator-stale",
              },
              { label: "Uptime Achieved", value: `${job.actualUptime?.toFixed(2) ?? "—"}%` },
              { label: "Throughput Achieved", value: `${job.actualThroughput?.toFixed(0) ?? "—"} ops/s` },
              {
                label: "Slash Percentage",
                value:
                  isComplete && !uptimeCompliant
                    ? "10% of deposit"
                    : isComplete && !throughputCompliant
                    ? "10% of deposit"
                    : "—",
                color: isComplete && !uptimeCompliant ? "text-indicator-slashed" : undefined,
              },
              {
                label: "SLA Credit Issued",
                value:
                  isComplete && !uptimeCompliant
                    ? `${(job.cost * 0.07).toFixed(4)} ETH`
                    : isComplete && !throughputCompliant
                    ? `${(job.cost * 0.07).toFixed(4)} ETH`
                    : "—",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between py-2 border-b border-hairline">
                <span className="text-foreground-muted">{label}</span>
                <span className={cn("font-mono-data text-foreground", color)}>{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Link href={`/dashboard/jobs/${id}`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job
          </Button>
        </Link>
      </div>
    </div>
  );
}
