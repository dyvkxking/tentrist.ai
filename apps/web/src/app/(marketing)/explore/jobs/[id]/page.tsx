"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";

const MOCK_JOB: Record<string, { id: string; type: string; status: "completed" | "running" | "failed" | "pending"; value: string; nodes: number; sla: string; createdAt: string; completedAt?: string; client: string }> = {
  "job_8a3f2e1c4d": { id: "job_8a3f2e1c4d", type: "LLM Fine-tuning", status: "completed", value: "$0.023 ETH", nodes: 2, sla: "99%", createdAt: "Jun 15, 2024 09:12", completedAt: "Jun 15, 2024 14:38", client: "0x1A2b...9F8e" },
};

export default function PublicJobPage() {
  const { id } = useParams();
  const job = MOCK_JOB[id as string] ?? Object.values(MOCK_JOB)[0];

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
            { label: "Type", value: job.type },
            { label: "Status", value: "" },
            { label: "Value", value: job.value },
            { label: "Nodes", value: String(job.nodes) },
            { label: "SLA", value: job.sla },
            { label: "Client", value: job.client },
            { label: "Created", value: job.createdAt },
            ...(job.completedAt ? [{ label: "Completed", value: job.completedAt }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-hairline/50 last:border-0">
              <span className="text-foreground-muted text-sm">{label}</span>
              {label === "Status" ? (
                <StatusBadge status={job.status} />
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
