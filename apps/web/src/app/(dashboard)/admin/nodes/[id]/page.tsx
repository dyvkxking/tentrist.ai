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

interface HeartbeatEntry {
  timestamp: number;
  vramUsed: number;
  vramTotal: number;
  latency: number;
  status: "ok" | "warning" | "critical";
}

interface JobEntry {
  id: string;
  client: string;
  status: "pending" | "running" | "completed" | "failed";
  assignedAt: number;
  completedAt?: number;
}

interface SlashEntry {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
  status: "pending" | "executed" | "overridden";
}

function generateMockNodeDetail(id: string) {
  return {
    id,
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    gpu: "NVIDIA A100 80GB",
    vram: { used: 64, total: 80 },
    region: "us-east-1",
    stake: 10.5,
    reputation: 156,
    status: "online" as const,
    flags: ["clean"] as ("flagged" | "investigating" | "clean")[],
    internalNotes: "",
    heartbeatHistory: [
      { timestamp: Date.now() - 15000, vramUsed: 64, vramTotal: 80, latency: 12, status: "ok" as const },
      { timestamp: Date.now() - 45000, vramUsed: 62, vramTotal: 80, latency: 14, status: "ok" as const },
      { timestamp: Date.now() - 75000, vramUsed: 70, vramTotal: 80, latency: 18, status: "warning" as const },
      { timestamp: Date.now() - 105000, vramUsed: 65, vramTotal: 80, latency: 11, status: "ok" as const },
      { timestamp: Date.now() - 135000, vramUsed: 60, vramTotal: 80, latency: 13, status: "ok" as const },
    ] as HeartbeatEntry[],
    assignedJobs: [
      { id: "job_a1b2c3d4", client: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", status: "running" as const, assignedAt: Date.now() - 3600000 },
      { id: "job_e5f6g7h8", client: "0x862964cE01621d2F447D1A4d5d7dE0286FA8918f", status: "completed" as const, assignedAt: Date.now() - 86400000, completedAt: Date.now() - 82800000 },
      { id: "job_i9j0k1l2", client: "0x3d9dCB725C5B078cC8d2E8a4f4C7bD9e5f6a8b7c", status: "failed" as const, assignedAt: Date.now() - 172800000 },
    ] as JobEntry[],
    slashingEvents: [
      { id: "slash_001", amount: 0.15, reason: "Missed heartbeat interval", timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, status: "executed" as const },
    ] as SlashEntry[],
  };
}

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
  const node = generateMockNodeDetail(nodeId);
  const [internalNotes, setInternalNotes] = React.useState(node.internalNotes);

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
              {node.address}
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
              {node.vram.used}GB / {node.vram.total}GB
            </div>
            <div className="mt-1 h-1.5 bg-bg-base rounded-full overflow-hidden">
              <div
                className="h-full bg-indicator-active"
                style={{ width: `${(node.vram.used / node.vram.total) * 100}%` }}
              />
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
              {node.stake.toFixed(2)} ETH
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
              <ReputationBadge score={node.reputation} showScore size="md" />
              <div className="text-xs text-foreground-muted">
                Lifetime: {node.reputation > 0 ? "+" : ""}{node.reputation}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Completed Jobs</span>
                <span className="font-mono-data">{node.assignedJobs.filter(j => j.status === "completed").length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Failed Jobs</span>
                <span className="font-mono-data text-indicator-slashed">{node.assignedJobs.filter(j => j.status === "failed").length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Slash Events</span>
                <span className="font-mono-data text-indicator-stale">{node.slashingEvents.length}</span>
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
              {node.flags.includes("flagged") && (
                <Badge variant="danger">
                  <Flag className="h-3 w-3 mr-1" />
                  Flagged
                </Badge>
              )}
              {node.flags.includes("investigating") && (
                <Badge variant="warning">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Investigating
                </Badge>
              )}
              {node.flags.includes("clean") && (
                <Badge variant="success">
                  No issues detected
                </Badge>
              )}
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
                {node.heartbeatHistory.map((hb, index) => (
                  <tr key={index} className="hover:bg-bg-base/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground-muted font-mono-data">
                        {formatRelativeTime(hb.timestamp)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-bg-base rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full",
                              hb.status === "ok" ? "bg-indicator-active" :
                              hb.status === "warning" ? "bg-indicator-stale" : "bg-indicator-slashed"
                            )}
                            style={{ width: `${(hb.vramUsed / hb.vramTotal) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono-data">
                          {hb.vramUsed}GB / {hb.vramTotal}GB
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "text-xs font-mono-data",
                        hb.latency < 20 ? "text-indicator-active" :
                        hb.latency < 50 ? "text-indicator-stale" : "text-indicator-slashed"
                      )}>
                        {hb.latency}ms
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          hb.status === "ok" ? "success" :
                          hb.status === "warning" ? "warning" : "danger"
                        }
                        size="sm"
                      >
                        {hb.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
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
                {node.assignedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-bg-base/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/jobs/${job.id}`}>
                        <span className="text-xs font-mono-data text-indicator-active hover:underline cursor-pointer">
                          {job.id}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono-data text-foreground-muted">
                        {job.client.slice(0, 8)}...{job.client.slice(-6)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground-muted">
                        {formatRelativeTime(job.assignedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground-muted">
                        {job.completedAt ? formatRelativeTime(job.completedAt) : "-"}
                      </span>
                    </td>
                  </tr>
                ))}
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
          {node.slashingEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline">
                    <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Event ID
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Reason
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
                  {node.slashingEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-bg-base/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono-data text-foreground">
                          {event.id}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-mono-data text-indicator-slashed">
                          -{event.amount.toFixed(3)} ETH
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground-muted">
                          {event.reason}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground-muted">
                          {formatDate(event.timestamp)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={event.status === "executed" ? "danger" : "warning"}
                          size="sm"
                        >
                          {event.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Scale className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
              <p className="text-sm text-foreground-muted">No slashing events for this node</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
