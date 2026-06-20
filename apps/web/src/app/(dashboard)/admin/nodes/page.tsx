"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Server,
  Flag,
  Eye,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ReputationBadge } from "@/components/ui/ReputationBadge";
import { RequireAuth } from "@/components/providers/require-auth";
import { adminListNodes } from "@/lib/supabase-admin";
import { Skeleton } from "@/components/ui/skeleton";

interface Node {
  id: string;
  wallet_address: string;
  gpu: string;
  region: string;
  status: "online" | "offline" | "stale" | "slashed";
  reputation_score: number;
  total_stake: number;
  last_heartbeat: number;
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function AdminNodesPage() {
  return (
    <RequireAuth requiredRole="admin">
      <AdminNodesContent />
    </RequireAuth>
  );
}

function AdminNodesContent() {
  const [nodes, setNodes] = React.useState<Node[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);

  React.useEffect(() => {
    adminListNodes()
      .then(setNodes)
      .catch((err) => setError(err.message || "Failed to load nodes"));
  }, []);

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-indicator-slashed bg-indicator-slashed/10 p-4 text-sm text-indicator-slashed">
          {error}
        </div>
      </div>
    );
  }

  if (!nodes) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-bg-surface/80">
              <CardContent className="p-4">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-16 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-0">
            <div className="space-y-4 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredNodes = nodes.filter((node) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !node.id.toLowerCase().includes(query) &&
        !node.wallet_address.toLowerCase().includes(query) &&
        !node.gpu.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (statusFilter && node.status !== statusFilter) return false;
    return true;
  });

  const flaggedCount = 0;
  const investigatingCount = 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Node Registry
          </h1>
          <p className="text-sm text-foreground-muted">
            All registered compute nodes across the network — {filteredNodes.length} nodes
          </p>
        </div>
        <Badge variant="outline" className="text-indicator-active">
          <Server className="h-3 w-3 mr-1" />
          {nodes.length} Total
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data">
              {nodes.filter((n) => n.status === "online").length}
            </div>
            <div className="text-xs text-foreground-muted">Online</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data text-indicator-stale">
              {nodes.filter((n) => n.status === "stale").length}
            </div>
            <div className="text-xs text-foreground-muted">Stale</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data text-indicator-slashed">
              {nodes.filter((n) => n.status === "slashed").length}
            </div>
            <div className="text-xs text-foreground-muted">Slashed</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data text-indicator-stale">
              {flaggedCount + investigatingCount}
            </div>
            <div className="text-xs text-foreground-muted">Flagged / Investigating</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-bg-surface/80">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                type="search"
                placeholder="Search by node ID, address, or GPU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className={cn(
                  "flex h-9 rounded-md border bg-bg-base px-3 py-2 text-sm",
                  "border-border-hairline focus-visible:outline-none"
                )}
              >
                <option value="">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="stale">Stale</option>
                <option value="slashed">Slashed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nodes Table */}
      <Card className="bg-bg-surface/80">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Address
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    GPU
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Region
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Reputation
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Stake
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Last Heartbeat
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Flags
                  </th>
                  <th className="w-48"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredNodes.map((node) => (
                  <tr key={node.id} className="hover:bg-bg-base/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-foreground-muted" />
                        <span className="text-xs font-mono-data text-foreground">
                          {node.id}
                        </span>
                      </div>
                      <div className="text-[10px] text-foreground-muted font-mono-data mt-0.5">
                        {node.wallet_address.slice(0, 8)}...{node.wallet_address.slice(-6)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground">{node.gpu}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground-muted">{node.region}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={node.status} showPulse />
                    </td>
                    <td className="px-4 py-3">
                      <ReputationBadge score={node.reputation_score} showScore />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono-data text-foreground">
                        {node.total_stake.toFixed(1)} ETH
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground-muted">
                        {formatRelativeTime(node.last_heartbeat)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground-muted">-</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/nodes/${node.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Flag Node">
                          <Flag className="h-4 w-4 text-indicator-stale" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Investigate">
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
