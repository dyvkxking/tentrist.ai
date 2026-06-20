"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Server,
  User,
  Eye,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Play,
  ChevronLeft,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RequireAuth } from "@/components/providers/require-auth";
import { adminGetJob } from "@/lib/supabase-admin";
import type { NodeAssignment } from "@/hooks/use-jobs";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

const eventTypeConfig = {
  created: { icon: FileText, color: "text-blue-400" },
  assigned: { icon: Server, color: "text-foreground-muted" },
  checkpoint: { icon: CheckCircle2, color: "text-indicator-active" },
  slash: { icon: AlertTriangle, color: "text-indicator-slashed" },
  complete: { icon: CheckCircle2, color: "text-indicator-active" },
  fail: { icon: AlertTriangle, color: "text-indicator-slashed" },
};

export default function AdminJobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  return (
    <RequireAuth requiredRole="admin">
      <AdminJobDetailContent jobId={jobId} />
    </RequireAuth>
  );
}

interface AdminJobDetailContentProps {
  jobId: string;
}

function AdminJobDetailContent({ jobId }: AdminJobDetailContentProps) {
  const [job, setJob] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    adminGetJob(jobId).then((data) => {
      setJob(data);
    }).catch((e) => {
      setError(e.message);
    });
  }, [jobId]);

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="bg-bg-surface/80 p-8 text-center">
          <p className="text-indicator-slashed">Error loading job: {error}</p>
        </Card>
      </div>
    );
  }

  if (job === null) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Loading...</h1>
          </div>
        </div>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse text-foreground-muted">Loading job details...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/admin/jobs">
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-1">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {job.id}
              </h1>
              <StatusBadge status={job.status} showPulse />
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground-muted">
              <User className="h-4 w-4" />
              <span className="font-mono-data">
                Client: {job.user_id}
              </span>
            </div>
          </div>
        </div>
        <Button className="gap-2">
          <Play className="h-4 w-4" />
          Trigger SLA Evaluation
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-foreground-muted" />
              <span className="text-xs text-foreground-muted">Value</span>
            </div>
            <div className="text-lg font-semibold font-mono-data text-indicator-active">
              {(job.budget_usd || 0).toFixed(2)} USD
            </div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-4 w-4 text-foreground-muted" />
              <span className="text-xs text-foreground-muted">Nodes</span>
            </div>
            <div className="text-lg font-semibold font-mono-data">
              {job.node_id ? 1 : 0}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-foreground-muted" />
              <span className="text-xs text-foreground-muted">Created</span>
            </div>
            <div className="text-sm font-medium text-foreground">
              {formatRelativeTime(job.created_at ? new Date(job.created_at).getTime() : Date.now())}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-foreground-muted" />
              <span className="text-xs text-foreground-muted">Deadline</span>
            </div>
            <div className="text-sm font-medium text-foreground">
              {formatRelativeTime(job.deadline ? new Date(job.deadline).getTime() : Date.now() + 86400000)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Terms */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-foreground-muted" />
            SLA Terms
          </CardTitle>
          <CardDescription>Contractual obligations for job completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-3 bg-bg-base rounded-lg">
              <div className="text-xs text-foreground-muted mb-1">Required Uptime</div>
              <div className="text-lg font-mono-data text-indicator-active">{job.sla_uptime_required || 95}%</div>
            </div>
            <div className="p-3 bg-bg-base rounded-lg">
              <div className="text-xs text-foreground-muted mb-1">Required Throughput</div>
              <div className="text-lg font-mono-data text-indicator-active">{job.sla_throughput_required || 100}</div>
            </div>
            <div className="p-3 bg-bg-base rounded-lg">
              <div className="text-xs text-foreground-muted mb-1">Checkpoints Required</div>
              <div className="text-lg font-mono-data text-indicator-active">-</div>
            </div>
            <div className="p-3 bg-bg-base rounded-lg">
              <div className="text-xs text-foreground-muted mb-1">Max Latency</div>
              <div className="text-lg font-mono-data text-indicator-active">-</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Nodes */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4 text-foreground-muted" />
            Assigned Nodes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Node ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Address
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {(job.assignedNodes || []).map((node: any) => (
                  <tr key={node.nodeId} className="hover:bg-bg-base/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/nodes/${node.nodeId}`}>
                        <span className="text-xs font-mono-data text-indicator-active hover:underline cursor-pointer">
                          {node.nodeId}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono-data text-foreground-muted">
                        {(node.address || "").slice(0, 8)}...{(node.address || "").slice(-6)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={node.status === "processing" ? "online" : node.status === "failed" ? "failed" : node.status === "completed" ? "completed" : "pending"}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground-muted">
                        {node.joinedAt ? formatRelativeTime(node.joinedAt) : "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Checkpoints */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-indicator-active" />
            Checkpoints
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {job.checkpoints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline">
                    <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Checkpoint ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Node
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Data Hash
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {(job.checkpoints || []).map((cp: any) => (
                    <tr key={cp.id} className="hover:bg-bg-base/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono-data text-foreground">
                          {cp.id}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/nodes/${cp.nodeId}`}>
                          <span className="text-xs font-mono-data text-indicator-active hover:underline cursor-pointer">
                            {cp.nodeId}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono-data text-foreground-muted">
                          {cp.dataHash}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground-muted">
                          {formatDate(cp.timestamp)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={cp.status === "saved" ? "success" : cp.status === "restored" ? "warning" : "danger"}
                          size="sm"
                        >
                          {cp.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
              <p className="text-sm text-foreground-muted">No checkpoints recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Log */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-foreground-muted" />
            Event Log
          </CardTitle>
          <CardDescription>Chronological record of job events</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-hairline">
            {(job.eventLog || []).map((event: any, index: number) => {
              const eventType = event.type as keyof typeof eventTypeConfig;
              const EventIcon = eventTypeConfig[eventType]?.icon || FileText;
              const EventColor = eventTypeConfig[eventType]?.color || "text-foreground-muted";
              return (
                <div key={index} className="flex items-start gap-3 p-4 hover:bg-bg-base/50 transition-colors">
                  <div className={cn("p-1.5 bg-bg-base rounded", EventColor)}>
                    <EventIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{event.message}</span>
                      <span className="text-xs text-foreground-muted">
                        {formatDate(event.timestamp)}
                      </span>
                    </div>
                    {event.details && (
                      <p className="text-xs text-foreground-muted mt-1">{event.details}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
