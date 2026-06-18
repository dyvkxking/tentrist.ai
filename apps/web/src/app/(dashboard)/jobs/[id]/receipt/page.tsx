"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, ExternalLink, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { useJob } from "@/hooks/use-jobs";

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function JobReceiptPage() {
  const { id } = useParams();
  const { data: job } = useJob(id as string);
  const [copied, setCopied] = React.useState(false);

  if (!job) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <p className="text-foreground-muted text-center py-12">Job not found.</p>
      </div>
    );
  }

  const isComplete = job.status === "completed";
  const isCancelled = job.status === "cancelled";
  const isFailed = job.status === "failed";
  const slaBreach = job.actualUptime !== undefined && job.actualUptime < job.sla.requiredUptime;
  const slashAmount = job.cost * 0.1;
  const creditAmount = job.cost * 0.07;
  const netCost = isComplete || !slaBreach ? job.cost : job.cost - slashAmount + creditAmount;

  async function handleCopy() {
    await navigator.clipboard.writeText(id as string);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <PageHeader
        title="Job Receipt"
        description={`Receipt for job ${(id as string).slice(0, 8)}…`}
        breadcrumbs={[
          { label: "Jobs", href: "/dashboard/jobs" },
          { label: (id as string).slice(0, 8), href: `/dashboard/jobs/${id}` },
          { label: "Receipt" },
        ]}
      />

      {/* Status Banner */}
      <Card className={cn(
        "bg-bg-surface/80",
        isComplete && !slaBreach && "border-indicator-active/30",
        slaBreach && "border-indicator-stale/30",
        isFailed && "border-indicator-slashed/30"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isComplete && !slaBreach ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-indicator-active/20 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-indicator-active" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-indicator-active">Job Completed — SLA Fulfilled</div>
                    <div className="text-xs text-foreground-muted">All benchmarks met. Full payment released.</div>
                  </div>
                </>
              ) : slaBreach ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-indicator-stale/20 flex items-center justify-center">
                    <span className="text-indicator-stale text-lg">!</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-indicator-stale">SLA Breach — Partial Credit Issued</div>
                    <div className="text-xs text-foreground-muted">Uptime below threshold. SLA credit applied.</div>
                  </div>
                </>
              ) : isCancelled ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-indicator-stale/20 flex items-center justify-center">
                    <span className="text-indicator-stale text-sm font-bold">x</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-indicator-stale">Job Cancelled</div>
                    <div className="text-xs text-foreground-muted">Job stopped before completion.</div>
                  </div>
                </>
              ) : isFailed ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-indicator-slashed/20 flex items-center justify-center">
                    <span className="text-indicator-slashed text-lg">!</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-indicator-slashed">Job Failed</div>
                    <div className="text-xs text-foreground-muted">Job did not complete successfully.</div>
                  </div>
                </>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs">
                {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                {copied ? "Copied" : "Copy ID"}
              </Button>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-3 w-3 mr-1" />
                Tx
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Summary */}
      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Job Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Job ID", value: id as string },
            { label: "Submitted", value: formatTimestamp(job.createdAt) },
            { label: "Completed", value: job.deadline ? formatTimestamp(job.deadline) : "—" },
            { label: "Assigned Nodes", value: String(job.assignedNodes.length) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-hairline">
              <span className="text-foreground-muted">{label}</span>
              <span className="font-mono-data text-foreground text-sm">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SLA Result */}
      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>SLA Benchmark Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              label: "Uptime",
              required: `${job.sla.requiredUptime.toFixed(1)}%`,
              actual: `${job.actualUptime?.toFixed(2) ?? "—"}%`,
              pass: job.actualUptime !== undefined && job.actualUptime >= job.sla.requiredUptime,
            },
            {
              label: "Throughput",
              required: `${job.sla.requiredThroughput} ops/s`,
              actual: `${job.actualThroughput?.toFixed(0) ?? "—"} ops/s`,
              pass: job.actualThroughput !== undefined && job.actualThroughput >= job.sla.requiredThroughput,
            },
          ].map(({ label, required, actual, pass }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-hairline">
              <span className="text-foreground-muted">{label}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-foreground-muted">req: {required}</span>
                <span className={cn("font-mono-data text-sm", pass ? "text-indicator-active" : "text-indicator-slashed")}>
                  {actual} {pass ? "✓" : "✗"}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Total Job Cost", value: `$${job.cost.toFixed(4)} ETH` },
            ...(slaBreach
              ? [
                  { label: "Slash Amount (10%)", value: `-$${slashAmount.toFixed(4)} ETH`, negative: true },
                  { label: "SLA Credit (70%)", value: `+$${creditAmount.toFixed(4)} ETH`, positive: true },
                ]
              : []),
          ].map(({ label, value, negative, positive }) => (
            <div key={label} className="flex justify-between py-2 border-b border-hairline">
              <span className="text-foreground-muted">{label}</span>
              <span
                className={cn(
                  "font-mono-data",
                  negative ? "text-indicator-slashed" : positive ? "text-indicator-active" : "text-foreground"
                )}
              >
                {value}
              </span>
            </div>
          ))}
          <div className="flex justify-between py-3">
            <span className="font-semibold text-foreground">Net Amount</span>
            <span className="font-mono-data font-semibold text-indicator-active text-lg">
              ${netCost.toFixed(4)} ETH
            </span>
          </div>
        </CardContent>
      </Card>

      {/* On-Chain Links */}
      <Card className="bg-bg-surface/80">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground-muted">On-chain receipt</span>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-3 w-3 mr-1" />
              View on Etherscan
            </Button>
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
