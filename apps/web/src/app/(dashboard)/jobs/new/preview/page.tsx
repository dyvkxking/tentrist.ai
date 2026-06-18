"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Server,
  Shield,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageHeader } from "@/components/shared/page-header";
type JobFormValues = {
  jobType: "llm" | "rendering" | "batch";
  requiredUptime: number;
  requiredThroughput: number;
  deadlineHours: number;
  checkpointInterval: number;
  parameters: string;
  depositAmount: number;
  agreeTerms: boolean;
};

const JOB_TYPE_LABELS = {
  llm: "LLM Fine-tuning",
  rendering: "Batch Rendering",
  batch: "Batch Compute",
};

function formatDeadline(hours: number): string {
  const d = new Date(Date.now() + hours * 3600 * 1000);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function JobPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [eligibleNodes, setEligibleNodes] = React.useState<number>(0);
  const [estimatedRate, setEstimatedRate] = React.useState<string>("—");

  // Decode job params from URL
  const jobParams: JobFormValues | null = React.useMemo(() => {
    try {
      const encoded = searchParams.get("job");
      if (!encoded) return null;
      return JSON.parse(atob(encoded)) as JobFormValues;
    } catch {
      return null;
    }
  }, [searchParams]);

  // Fetch eligible node count for preview
  React.useEffect(() => {
    fetch("/api/v1/nodes/eligible")
      .then((r) => r.json())
      .then((data: { count?: number }) => {
        setEligibleNodes(data.count ?? 0);
        // Estimate rate: 100 micro-USDC per ms * 1000 ms/s * 60 s/min
        const ratePerMin = (100 * 60).toLocaleString();
        setEstimatedRate(`$${ratePerMin} per node-minute`);
      })
      .catch(() => {
        setEligibleNodes(0);
        setEstimatedRate("Rate varies by node");
      });
  }, []);

  if (!jobParams) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="p-8 text-center">
          <p className="text-foreground-muted mb-4">No job configuration found.</p>
          <Link href="/dashboard/jobs/new">
            <Button variant="outline">Start Over</Button>
          </Link>
        </div>
      </div>
    );
  }

  const estimatedCost =
    jobParams.depositAmount *
    ((jobParams.requiredUptime / 95) * (jobParams.requiredThroughput / 50));

  async function handleConfirm() {
    // Pass job params to confirm page
    const encoded = btoa(JSON.stringify(jobParams));
    router.push(`/dashboard/jobs/new/confirm?job=${encoded}`);
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <PageHeader
        title="Review Your Job"
        description="Confirm your job configuration before submitting to the network"
        breadcrumbs={[
          { label: "Jobs", href: "/dashboard/jobs" },
          { label: "New Job", href: "/dashboard/jobs/new" },
          { label: "Preview" },
        ]}
      />

      {/* SLA Summary */}
      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indicator-active" />
            SLA Terms (On-Chain Record)
          </CardTitle>
          <CardDescription>
            These terms will be recorded on-chain and enforced automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-bg-base rounded-lg border border-hairline">
              <div className="text-xs text-foreground-muted mb-1">Required Uptime</div>
              <div className="text-2xl font-mono-data font-semibold text-indicator-active">
                {jobParams.requiredUptime.toFixed(1)}%
              </div>
              <div className="text-xs text-foreground-muted mt-1">Enforced via heartbeat</div>
            </div>
            <div className="p-4 bg-bg-base rounded-lg border border-hairline">
              <div className="text-xs text-foreground-muted mb-1">Required Throughput</div>
              <div className="text-2xl font-mono-data font-semibold text-indicator-active">
                {jobParams.requiredThroughput}
                <span className="text-sm font-normal text-foreground-muted ml-1">ops/s</span>
              </div>
              <div className="text-xs text-foreground-muted mt-1">Measured per interval</div>
            </div>
            <div className="p-4 bg-bg-base rounded-lg border border-hairline">
              <div className="text-xs text-foreground-muted mb-1">Deadline</div>
              <div className="text-2xl font-mono-data font-semibold text-indicator-active">
                {jobParams.deadlineHours}h
              </div>
              <div className="text-xs text-foreground-muted mt-1">
                Expires {formatDeadline(jobParams.deadlineHours)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Configuration */}
      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Job Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Workload Type", value: JOB_TYPE_LABELS[jobParams.jobType] },
            { label: "Checkpoint Interval", value: `${jobParams.checkpointInterval} seconds` },
            {
              label: "Workload Parameters",
              value: jobParams.parameters
                ? jobParams.parameters.length > 80
                  ? jobParams.parameters.slice(0, 80) + "…"
                  : jobParams.parameters
                : "None",
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-hairline">
              <span className="text-foreground-muted">{label}</span>
              <span className="font-mono-data text-foreground">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Matched Nodes Preview */}
      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-indicator-stale" />
            Matched Nodes
          </CardTitle>
          <CardDescription>
            {eligibleNodes > 0
              ? `${eligibleNodes} eligible node${eligibleNodes !== 1 ? "s" : ""} match your requirements`
              : "Fetching eligible nodes…"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-bg-base rounded-lg border border-hairline">
              <div className="text-xs text-foreground-muted mb-1">Eligible Nodes</div>
              <div className="text-2xl font-mono-data font-semibold">
                {eligibleNodes > 0 ? eligibleNodes : "—"}
              </div>
            </div>
            <div className="p-4 bg-bg-base rounded-lg border border-hairline">
              <div className="text-xs text-foreground-muted mb-1">Estimated Rate</div>
              <div className="text-2xl font-mono-data font-semibold">{estimatedRate}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Cost Estimate</CardTitle>
          <CardDescription>
            Deposit is held in escrow and refunded based on SLA fulfillment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between py-2 border-b border-hairline">
            <span className="text-foreground-muted">Job Type</span>
            <span className="font-mono-data text-foreground">
              {JOB_TYPE_LABELS[jobParams.jobType]}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-hairline">
            <span className="text-foreground-muted">Deadline</span>
            <span className="font-mono-data text-foreground">{jobParams.deadlineHours}h</span>
          </div>
          <div className="flex justify-between py-2 border-b border-hairline">
            <span className="text-foreground-muted">Checkpoint Interval</span>
            <span className="font-mono-data text-foreground">
              {jobParams.checkpointInterval}s
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-hairline">
            <span className="text-foreground-muted">SLA Multiplier</span>
            <span className="font-mono-data text-indicator-stale">
              ×{((jobParams.requiredUptime / 95) * (jobParams.requiredThroughput / 50)).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between py-3">
            <span className="font-semibold text-foreground">Escrow Deposit</span>
            <span className="font-mono-data font-semibold text-indicator-active text-lg">
              ${estimatedCost.toFixed(4)} ETH
            </span>
          </div>
        </CardContent>
      </Card>

      {/* SLA Warning */}
      <div className="p-4 rounded-lg bg-indicator-stale/10 border border-indicator-stale/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-indicator-stale shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-indicator-stale mb-1">SLA Enforcement Notice</div>
            <div className="text-sm text-foreground-muted">
              If benchmarks are not met, automatic slashing will occur. Up to 10% of your deposit
              may be deducted, with 70% credited back to your account as SLA credits. The
              remaining 30% is distributed to node operators.
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Link href="/dashboard/jobs/new">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Edit Job
          </Button>
        </Link>
        <Button
          onClick={handleConfirm}
          className="bg-indicator-active text-bg-base hover:bg-indicator-active/90"
        >
          Proceed to Signature
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
