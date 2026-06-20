"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Server,
  Flag,
  PowerOff,
  Trash2,
  Heart,
  Briefcase,
  Scale,
  AlertTriangle,
  Clock,
  FileText,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ReputationBadge } from "@/components/ui/ReputationBadge";
import { RequireAuth } from "@/components/providers/require-auth";
import { adminGetNode } from "@/lib/supabase-admin";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

export default function AdminNodeDetailPage() {
  const params = useParams();
  const nodeId = params.id as string;

  return (
    <RequireAuth requiredRole="admin">
      <AdminNodeDetailContent nodeId={nodeId} />
    </RequireAuth>
  );
}

interface AdminNodeDetailContentProps {
  nodeId: string;
}

function AdminNodeDetailContent({ nodeId }: AdminNodeDetailContentProps) {
  const [node, setNode] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [internalNotes, setInternalNotes] = React.useState("");

  React.useEffect(() => {
    adminGetNode(nodeId)
      .then(setNode)
      .catch((err) => setError(err.message || "Failed to load node"));
  }, [nodeId]);

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-indicator-slashed bg-indicator-slashed/10 p-4 text-sm text-indicator-slashed">
          {error}
        </div>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-8 w-8" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-bg-surface/80">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-bg-surface/80">
              <CardContent className="p-4">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/admin/nodes">
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-1">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {node.id}
              </h1>
              <StatusBadge status={node.status} showPulse />
            </div>
            <p className="text-sm text-foreground-muted font-mono-data">
              {node.wallet_address}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Flag className="h-4 w-4" />
            Flag Node
          </Button>
          <Button variant="outline" className="gap-2">
            <PowerOff className="h-4 w-4" />
            Force Offline
          </Button>
          <Button variant="destructive" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Unregister
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-4 w-4 text-foreground-muted" />
              <span className="text-xs text-foreground-muted">GPU</span>
            </div>
            <div className="text-sm font-medium text-foreground">{node.gpu}</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-foreground-muted" />
              <span className="text-xs text-foreground-muted">VRAM</span>
            </div>
            <div className="text-sm font-mono-data font-medium text-foreground">
              N/A
            </div>
            <div className="mt-1 h-1.5 bg-bg-base rounded-full overflow-hidden">
              <div className="h-full bg-indicator-active" style={{ width: "0%" }} />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-4 w-4 text-foreground-muted" />
              <span className="text-xs text-foreground-muted">Stake</span>
            </div>
            <div className="text-sm font-mono-data font-medium text-foreground">
              {node.total_stake.toFixed(2)} ETH
            </div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">Region</Badge>
            </div>
            <div className="text-sm font-medium text-foreground">{node.region}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reputation and Flags */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-foreground-muted" />
              Reputation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <ReputationBadge score={node.reputation_score} showScore size="md" />
              <div className="text-xs text-foreground-muted">
                Lifetime: {node.reputation_score > 0 ? "+" : ""}{node.reputation_score}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Completed Jobs</span>
                <span className="font-mono-data">-</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Failed Jobs</span>
                <span className="font-mono-data text-indicator-slashed">-</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Slash Events</span>
                <span className="font-mono-data text-indicator-stale">-</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-foreground-muted" />
              Internal Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap mb-4">
              <Badge variant="success">
                No issues detected
              </Badge>
            </div>
            <div>
              <label className="text-xs text-foreground-muted mb-2 block">Internal Notes</label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Add internal notes about this node..."
                className={cn(
                  "w-full h-24 rounded-md border bg-bg-base px-3 py-2 text-sm",
                  "border-border-hairline focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-indicator-active/50"
                )}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heartbeat History */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-indicator-active" />
            Heartbeat History
          </CardTitle>
          <CardDescription>Recent heartbeat telemetry from this node</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    VRAM Used
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Latency
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-foreground-muted">
                    Heartbeat history not available in current view
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Jobs */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-foreground-muted" />
            Assigned Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Job ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Assigned
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-foreground-muted">
                    Assigned jobs not available in current view
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Slashing Events */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-4 w-4 text-indicator-slashed" />
            Slashing Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-8 text-center">
            <Scale className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
            <p className="text-sm text-foreground-muted">No slashing events for this node</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
