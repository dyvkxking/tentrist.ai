"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Wallet,
  Check,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { useAuthStore } from "@/stores/auth-store";

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

export default function JobConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = React.useState<"review" | "signing" | "submitting" | "done">("review");
  const [error, setError] = React.useState<string | null>(null);
  const [walletAddress, setWalletAddress] = React.useState<string | null>(null);

  const jobParams: JobFormValues | null = React.useMemo(() => {
    try {
      const encoded = searchParams.get("job");
      if (!encoded) return null;
      return JSON.parse(atob(encoded)) as JobFormValues;
    } catch {
      return null;
    }
  }, [searchParams]);

  // Mock wallet connect
  async function handleConnectWallet() {
    setStep("signing");
    try {
      // In production this would use wagmi/rainbowkit to request signature
      const mockWallet = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setWalletAddress(mockWallet);
      setStep("done");
    } catch {
      setStep("review");
      setError("Wallet connection failed");
    }
  }

  async function handleConfirm() {
    if (!user || !jobParams) return;
    setStep("submitting");
    setError(null);

    try {
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + jobParams.deadlineHours * 3600;

      const apiPayload = {
        clientId: user.id,
        requiredUptime: Math.round(jobParams.requiredUptime * 100),
        requiredThroughput: jobParams.requiredThroughput,
        deadlineTimestamp,
        workloadPayload: jobParams.parameters
          ? new TextEncoder().encode(jobParams.parameters)
          : new TextEncoder().encode("{}"),
        isServerless: true,
      };

      const res = await fetch("/api/v1/jobs/serverless", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      if (!res.ok) throw new Error(`Submission failed: ${res.statusText}`);

      const apiResult: {
        jobId: string;
        status: string;
        assignedNode: string;
        checkpointRef?: string;
      } = await res.json();

      const { jobsApi } = await import("@/lib/supabase");
      await jobsApi.create({
        job_id_256: apiResult.jobId,
        user_id: user.id,
        node_id: apiResult.assignedNode || null,
        status: "pending",
        job_type: jobParams.jobType,
        input_payload: jobParams.parameters ? JSON.parse(jobParams.parameters) : {},
        output_payload: null,
        estimated_duration_minutes: jobParams.deadlineHours * 60,
        actual_duration_minutes: null,
        checkpoint_url: apiResult.checkpointRef || null,
        sla_uptime_required: Math.round(jobParams.requiredUptime * 100),
        sla_throughput_required: jobParams.requiredThroughput,
        deadline: new Date(deadlineTimestamp * 1000).toISOString(),
        budget_usd: jobParams.depositAmount,
        price_charged_usd: null,
        paid_at: null,
        completed_at: null,
      });

      router.push(`/dashboard/jobs/${apiResult.jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStep("done");
    }
  }

  if (!jobParams) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
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

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <PageHeader
        title="Confirm & Sign"
        description="Sign the on-chain SLA record to commit your job to the network"
        breadcrumbs={[
          { label: "Jobs", href: "/dashboard/jobs" },
          { label: "New Job", href: "/dashboard/jobs/new" },
          { label: "Preview", href: "/dashboard/jobs/new/preview" },
          { label: "Confirm" },
        ]}
      />

      {/* Contract Info */}
      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indicator-active" />
            On-Chain SLA Record
          </CardTitle>
          <CardDescription>
            This transaction records your SLA terms on-chain. No funds are transferred — your
            deposit is held in the Escrow contract and released based on job outcome.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Contract", value: "0x4A5...F82c (Escrow.sol)" },
            { label: "Network", value: "Ethereum Mainnet" },
            { label: "Method", value: "recordSLABenchmark(...)" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-hairline">
              <span className="text-foreground-muted">{label}</span>
              <span className="font-mono-data text-foreground">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Job Terms Summary */}
      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Job Terms to Record</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Workload", value: JOB_TYPE_LABELS[jobParams.jobType] },
            { label: "Required Uptime", value: `${jobParams.requiredUptime.toFixed(1)}%` },
            { label: "Required Throughput", value: `${jobParams.requiredThroughput} ops/s` },
            { label: "Deadline", value: `${jobParams.deadlineHours} hours` },
            { label: "Checkpoint Interval", value: `${jobParams.checkpointInterval}s` },
            { label: "Escrow Deposit", value: `$${estimatedCost.toFixed(4)} ETH` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-hairline">
              <span className="text-foreground-muted">{label}</span>
              <span className="font-mono-data text-foreground">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Wallet Step */}
      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-indicator-stale" />
            Wallet Signature
          </CardTitle>
          <CardDescription>
            Sign with your wallet to authorize the on-chain SLA record.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "review" && (
            <Button
              onClick={handleConnectWallet}
              className="w-full bg-[#22c55e] text-white hover:bg-[#16a34a]"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet to Sign
            </Button>
          )}

          {step === "signing" && (
            <div className="flex items-center gap-3 p-4 bg-bg-base rounded-lg border border-hairline">
              <Loader2 className="h-5 w-5 text-indicator-stale animate-spin" />
              <span className="text-foreground-muted">Waiting for wallet signature…</span>
            </div>
          )}

          {step === "done" && walletAddress && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-indicator-active">
                <Check className="h-4 w-4" />
                Signature verified
              </div>
              <div className="p-4 bg-bg-base rounded-lg border border-hairline">
                <div className="text-xs text-foreground-muted mb-1">Signing wallet</div>
                <code className="text-sm font-mono text-foreground">
                  {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
                </code>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SLA Warning */}
      <div className="p-4 rounded-lg bg-indicator-stale/10 border border-indicator-stale/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-indicator-stale shrink-0 mt-0.5" />
          <div className="text-sm text-foreground-muted">
            By confirming, you agree to lock <strong className="text-foreground">${estimatedCost.toFixed(4)} ETH</strong> as your job deposit. If the node fails to meet your SLA terms, up to 10% will be slashed and credited to your account.
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-indicator-slashed/10 border border-indicator-slashed/30 text-sm text-indicator-slashed">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Link href="/dashboard/jobs/new/preview">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <Button
          onClick={handleConfirm}
          disabled={step !== "done"}
          isLoading={step === "submitting"}
          className="bg-indicator-active text-bg-base hover:bg-indicator-active/90"
        >
          {step === "submitting" ? "Submitting to Network…" : "Confirm & Submit Job"}
        </Button>
      </div>
    </div>
  );
}
