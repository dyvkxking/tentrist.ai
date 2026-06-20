"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { jobsApi } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";

export default function PublicJobPage() {
  const { id } = useParams();

  const { data: job, isLoading } = useQuery({
    queryKey: ["jobs", id],
    queryFn: () => jobsApi.get(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <PageHeader
          title="Job Detail"
          description={id as string}
          breadcrumbs={[{ label: "Explore", href: "/explore" }, { label: "Jobs", href: "/explore/jobs" }, { label: id as string }]}
        />
        <Card className="bg-bg-surface/80">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-foreground-muted text-sm">Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <PageHeader
          title="Job Detail"
          description={id as string}
          breadcrumbs={[{ label: "Explore", href: "/explore" }, { label: "Jobs", href: "/explore/jobs" }, { label: id as string }]}
        />
        <Card className="bg-bg-surface/80">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-foreground-muted text-sm">Job not found</span>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-start">
          <Link href="/explore/jobs">
            <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back to Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = job.status as "completed" | "running" | "failed" | "pending";
  const createdAt = new Date(job.created_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const completedAt = job.completed_at
    ? new Date(job.completed_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : undefined;
  const value = job.price_charged_usd
    ? `$${job.price_charged_usd.toFixed(6)}`
    : job.budget_usd
    ? `$${job.budget_usd.toFixed(6)}`
    : "N/A";

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <PageHeader
        title="Job Detail"
        description={id as string}
        breadcrumbs={[{ label: "Explore", href: "/explore" }, { label: "Jobs", href: "/explore/jobs" }, { label: id as string }]}
      />

      <Card className="bg-bg-surface/80">
        <CardContent className="p-6 space-y-3">
          {[
            { label: "Job ID", value: job.id },
            { label: "Type", value: job.job_type },
            { label: "Status", value: "" },
            { label: "Value", value },
            { label: "Client", value: job.user_id },
            { label: "Created", value: createdAt },
            ...(completedAt ? [{ label: "Completed", value: completedAt }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-hairline/50 last:border-0">
              <span className="text-foreground-muted text-sm">{label}</span>
              {label === "Status" ? (
                <StatusBadge status={status} />
              ) : (
                <span className="font-mono-data text-foreground text-sm">{value}</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Link href="/explore/jobs">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back to Jobs</Button>
        </Link>
      </div>
    </div>
  );
}
