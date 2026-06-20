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
import { adminListDisputes } from "@/lib/supabase-admin";

interface Dispute {
  id: string;
  node_address: string;
  job_id: string;
  slash_amount: number;
  reason: string;
  status: "pending" | "resolved" | "rejected";
  created_at: string;
}

function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
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
  const [disputes, setDisputes] = React.useState<Dispute[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await adminListDisputes();
        setDisputes(data as Dispute[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load disputes");
        setDisputes([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredDisputes = disputes?.filter((dispute) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !dispute.id.toLowerCase().includes(query) &&
        !dispute.node_address.toLowerCase().includes(query) &&
        !dispute.job_id.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    return true;
  }) ?? [];

  const pendingCount = disputes?.filter((d) => d.status === "pending").length ?? 0;
  const totalDisputed = disputes?.reduce((sum, d) => sum + d.slash_amount, 0) ?? 0;

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
            {loading ? (
              <div className="h-8 w-12 bg-bg-base rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-semibold font-mono-data">{disputes?.length ?? 0}</div>
            )}
            <div className="text-xs text-foreground-muted">Total Disputes</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            {loading ? (
              <div className="h-8 w-12 bg-bg-base rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-semibold font-mono-data text-indicator-stale">
                {pendingCount}
              </div>
            )}
            <div className="text-xs text-foreground-muted">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            {loading ? (
              <div className="h-8 w-12 bg-bg-base rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-semibold font-mono-data text-indicator-active">
                {disputes?.filter((d) => d.status === "resolved").length ?? 0}
              </div>
            )}
            <div className="text-xs text-foreground-muted">Resolved</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            {loading ? (
              <div className="h-8 w-16 bg-bg-base rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-semibold font-mono-data text-indicator-slashed">
                {totalDisputed.toFixed(3)} ETH
              </div>
            )}
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
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="hover:bg-bg-base/50 transition-colors">
                      {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 w-20 bg-bg-base rounded animate-pulse" />
                        </td>
                      ))}
                      <td className="px-4 py-3"></td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-indicator-slashed">
                      {error}
                    </td>
                  </tr>
                ) : filteredDisputes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-foreground-muted">
                      No disputes found
                    </td>
                  </tr>
                ) : (
                  filteredDisputes.map((dispute) => {
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
                            {dispute.node_address.slice(0, 8)}...{dispute.node_address.slice(-6)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono-data text-indicator-active">
                            {dispute.job_id}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-mono-data text-indicator-slashed">
                            -{dispute.slash_amount.toFixed(3)} ETH
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
                            {formatRelativeTime(dispute.created_at)}
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
