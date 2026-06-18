"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { useJob } from "@/hooks/use-jobs";
import { useAuthStore } from "@/stores/auth-store";

export default function JobCancelPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: job } = useJob(id as string);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [done, setDone] = React.useState(false);

  async function handleCancel() {
    if (!user) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/v1/jobs/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (res.ok) {
        setDone(true);
        // Also update Supabase
        const { jobsApi } = await import("@/lib/supabase");
        await jobsApi.updateStatus(id as string, "cancelled");
        setTimeout(() => router.push("/dashboard/jobs"), 1500);
      }
    } catch {
      setIsCancelling(false);
    }
  }

  const isActive = job?.status === "running" || job?.status === "pending";

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <PageHeader
        title="Cancel Job"
        description="Cancel your compute job and stop further charges"
        breadcrumbs={[
          { label: "Jobs", href: "/dashboard/jobs" },
          { label: (id as string).slice(0, 8), href: `/dashboard/jobs/${id}` },
          { label: "Cancel" },
        ]}
      />

      {!isActive && !done ? (
        <Card className="bg-bg-surface/80">
          <CardContent className="p-6 text-center">
            <p className="text-foreground-muted">
              This job is already <strong className="text-foreground">{job?.status}</strong> and cannot be cancelled.
            </p>
          </CardContent>
        </Card>
      ) : done ? (
        <Card className="bg-bg-surface/80 border-indicator-active/30">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-indicator-active/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-indicator-active text-2xl">✓</span>
            </div>
            <p className="text-foreground font-medium">Job cancelled successfully</p>
            <p className="text-foreground-muted text-sm mt-1">Redirecting to jobs list…</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-bg-surface/80 border-indicator-stale/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indicator-stale">
                <AlertTriangle className="h-5 w-5" />
                Cancel this job?
              </CardTitle>
              <CardDescription>
                This will immediately stop the job. A portion of your deposit may be deducted for
                work already completed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Job ID", value: (id as string).slice(0, 16) + "…" },
                { label: "Current Status", value: job?.status ?? "—" },
                { label: "Cost so far", value: job ? `$${job.cost.toFixed(4)} ETH` : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-hairline">
                  <span className="text-foreground-muted">{label}</span>
                  <span className="font-mono-data text-foreground">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-2">
            <Link href={`/dashboard/jobs/${id}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={handleCancel}
              isLoading={isCancelling}
            >
              {isCancelling ? "Cancelling…" : "Yes, Cancel Job"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
