"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Scale,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RequireAuth } from "@/components/providers/require-auth";

interface Dispute {
  id: string;
  nodeAddress: string;
  jobId: string;
  slashAmount: number;
  reason: string;
  status: "pending" | "resolved" | "rejected";
  createdAt: number;
}

function generateMockDisputes(): Dispute[] {
  return [
    {
      id: "dispute_001",
      nodeAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      jobId: "job_a1b2c3d4",
      slashAmount: 0.45,
      reason: "SLA breach: missed heartbeat intervals",
      status: "pending",
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
    },
    {
      id: "dispute_002",
      nodeAddress: "0x862964cE01621d2F447D1A4d5d7dE0286FA8918f",
      jobId: "job_e5f6g7h8",
      slashAmount: 0.32,
      reason: "VRAM exceeded 95% threshold",
      status: "pending",
      createdAt: Date.now() - 5 * 60 * 60 * 1000,
    },
    {
      id: "dispute_003",
      nodeAddress: "0x3d9dCB725C5B078cC8d2E8a4f4C7bD9e5f6a8b7c",
      jobId: "job_i9j0k1l2",
      slashAmount: 0.78,
      reason: "Latency SLA breach: avg 350ms > 200ms target",
      status: "resolved",
      createdAt: Date.now() - 24 * 60 * 60 * 1000,
    },
    {
      id: "dispute_004",
      nodeAddress: "0xfedc0987654321abcdef0123456789abcdef0123",
      jobId: "job_m3n4o5p6",
      slashAmount: 0.21,
      reason: "Missed checkpoint deadlines",
      status: "rejected",
      createdAt: Date.now() - 48 * 60 * 60 * 1000,
    },
    {
      id: "dispute_005",
      nodeAddress: "0x2468ace13579bdfc0246f8db9310019283746fab",
      jobId: "job_q7r8s9t0",
      slashAmount: 0.55,
      reason: "SLA breach: uptime 87% < 95% required",
      status: "pending",
      createdAt: Date.now() - 6 * 60 * 60 * 1000,
    },
  ];
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-indicator-stale/10 text-indicator-stale border-indicator-stale/30",
    icon: Clock,
  },
  resolved: {
    label: "Resolved",
    color: "bg-indicator-active/10 text-indicator-active border-indicator-active/30",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "bg-indicator-slashed/10 text-indicator-slashed border-indicator-slashed/30",
    icon: XCircle,
  },
};

export default function AdminSlashingDisputesPage() {
  return (
    <RequireAuth requiredRole="admin">
      <AdminSlashingDisputesContent />
    </RequireAuth>
  );
}

function AdminSlashingDisputesContent() {
  const [disputes] = React.useState<Dispute[]>(generateMockDisputes());
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredDisputes = disputes.filter((dispute) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !dispute.id.toLowerCase().includes(query) &&
        !dispute.nodeAddress.toLowerCase().includes(query) &&
        !dispute.jobId.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    return true;
  });

  const pendingCount = disputes.filter((d) => d.status === "pending").length;
  const totalDisputed = disputes.reduce((sum, d) => sum + d.slashAmount, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Slash Disputes
          </h1>
          <p className="text-sm text-foreground-muted">
            Dispute resolution desk for contested slash events — {filteredDisputes.length} disputes
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="warning" className="text-sm">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {pendingCount} pending review
          </Badge>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data">{disputes.length}</div>
            <div className="text-xs text-foreground-muted">Total Disputes</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data text-indicator-stale">
              {pendingCount}
            </div>
            <div className="text-xs text-foreground-muted">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data text-indicator-active">
              {disputes.filter((d) => d.status === "resolved").length}
            </div>
            <div className="text-xs text-foreground-muted">Resolved</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data text-indicator-slashed">
              {totalDisputed.toFixed(3)} ETH
            </div>
            <div className="text-xs text-foreground-muted">Total Disputed</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-bg-surface/80">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                type="search"
                placeholder="Search by dispute ID, node address, or job ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disputes Table */}
      <Card className="bg-bg-surface/80">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Event ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Node
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Job
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Slash Amount
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Created
                  </th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredDisputes.map((dispute) => {
                  const StatusIcon = statusConfig[dispute.status].icon;
                  return (
                    <tr key={dispute.id} className="hover:bg-bg-base/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Scale className="h-4 w-4 text-foreground-muted" />
                          <span className="text-xs font-mono-data text-foreground">
                            {dispute.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono-data text-foreground-muted">
                          {dispute.nodeAddress.slice(0, 8)}...{dispute.nodeAddress.slice(-6)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono-data text-indicator-active">
                          {dispute.jobId}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-mono-data text-indicator-slashed">
                          -{dispute.slashAmount.toFixed(3)} ETH
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground-muted line-clamp-1">
                          {dispute.reason}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", statusConfig[dispute.status].color)}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[dispute.status].label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground-muted">
                          {formatRelativeTime(dispute.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/slashing/disputes/${dispute.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
