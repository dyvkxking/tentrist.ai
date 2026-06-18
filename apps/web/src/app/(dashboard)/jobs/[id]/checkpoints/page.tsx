"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Save, ExternalLink, Clock } from "lucide-react";
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
    second: "2-digit",
  });
}

interface CheckpointRecord {
  id: string;
  checkpointNumber: number;
  timestamp: number;
  ref: string;
  size: string;
  status: "saved" | "migrated" | "restored";
}

const mockCheckpoints: CheckpointRecord[] = [
  { id: "cp_001", checkpointNumber: 1, timestamp: Date.now() - 3600000 * 3, ref: "QmcP...x9aB", size: "2.4 GB", status: "saved" },
  { id: "cp_002", checkpointNumber: 2, timestamp: Date.now() - 3600000 * 2, ref: "QmZP...k3cD", size: "3.1 GB", status: "saved" },
  { id: "cp_003", checkpointNumber: 3, timestamp: Date.now() - 3600000 * 1, ref: "QmNB...m7eF", size: "3.8 GB", status: "saved" },
];

const statusColors = {
  saved: "text-indicator-active",
  migrated: "text-indicator-stale",
  restored: "text-blue-400",
};

export default function JobCheckpointsPage() {
  const { id } = useParams();
  const { data: job } = useJob(id as string);
  const checkpoints = mockCheckpoints;

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <PageHeader
        title="Checkpoint History"
        description="All saved checkpoints for this job"
        breadcrumbs={[
          { label: "Jobs", href: "/dashboard/jobs" },
          { label: (id as string).slice(0, 8), href: `/dashboard/jobs/${id}` },
          { label: "Checkpoints" },
        ]}
      />

      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Checkpoint Log</CardTitle>
        </CardHeader>
        <CardContent>
          {checkpoints.length === 0 ? (
            <div className="py-8 text-center text-foreground-muted text-sm">
              No checkpoints recorded for this job.
            </div>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-4 gap-4 px-4 py-2 text-xs text-foreground-muted uppercase tracking-wider border-b border-hairline">
                <span>#</span>
                <span>Timestamp</span>
                <span>Reference</span>
                <span className="text-right">Size</span>
              </div>
              {checkpoints.map((cp) => (
                <div
                  key={cp.id}
                  className="grid grid-cols-4 gap-4 px-4 py-3 items-center border-b border-hairline hover:bg-bg-base/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Save className="h-3.5 w-3.5 text-indicator-stale shrink-0" />
                    <span className="font-mono-data text-sm">{cp.checkpointNumber}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                    <Clock className="h-3 w-3 shrink-0" />
                    {formatTimestamp(cp.timestamp)}
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-foreground">{cp.ref}</code>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono-data text-sm">{cp.size}</span>
                    <span className={cn("text-xs font-medium", statusColors[cp.status])}>
                      {cp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
