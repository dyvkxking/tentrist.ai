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

interface Node {
  id: string;
  address: string;
  gpu: string;
  region: string;
  status: "online" | "offline" | "stale" | "slashed";
  reputation: number;
  stake: number;
  lastHeartbeat: number;
  flags: ("flagged" | "investigating" | "clean")[];
}

function generateMockNodes(): Node[] {
  return [
    {
      id: "node_001",
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      gpu: "NVIDIA A100 80GB",
      region: "us-east-1",
      status: "online",
      reputation: 156,
      stake: 10.5,
      lastHeartbeat: Date.now() - 15000,
      flags: ["clean"],
    },
    {
      id: "node_002",
      address: "0x862964cE01621d2F447D1A4d5d7dE0286FA8918f",
      gpu: "NVIDIA H100 80GB",
      region: "eu-west-1",
      status: "online",
      reputation: 89,
      stake: 8.2,
      lastHeartbeat: Date.now() - 28000,
      flags: ["clean"],
    },
    {
      id: "node_003",
      address: "0x3d9dCB725C5B078cC8d2E8a4f4C7bD9e5f6a8b7c",
      gpu: "NVIDIA A100 40GB",
      region: "ap-southeast-1",
      status: "stale",
      reputation: 45,
      stake: 5.0,
      lastHeartbeat: Date.now() - 180000,
      flags: ["flagged"],
    },
    {
      id: "node_004",
      address: "0xfedc0987654321abcdef0123456789abcdef0123",
      gpu: "NVIDIA RTX 4090",
      region: "us-west-2",
      status: "online",
      reputation: 203,
      stake: 15.0,
      lastHeartbeat: Date.now() - 10000,
      flags: ["clean"],
    },
    {
      id: "node_005",
      address: "0x2468ace13579bdfc0246f8db9310019283746fab",
      gpu: "NVIDIA A100 80GB",
      region: "eu-central-1",
      status: "slashed",
      reputation: -12,
      stake: 2.5,
      lastHeartbeat: Date.now() - 3600000,
      flags: ["investigating"],
    },
    {
      id: "node_006",
      address: "0xabcd1234efgh5678ijkl9012mnop3456qrst6789",
      gpu: "NVIDIA H100 80GB",
      region: "us-east-1",
      status: "online",
      reputation: 78,
      stake: 12.0,
      lastHeartbeat: Date.now() - 22000,
      flags: ["clean"],
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

export default function AdminNodesPage() {
  return (
    <RequireAuth requiredRole="admin">
      <AdminNodesContent />
    </RequireAuth>
  );
}

function AdminNodesContent() {
  const [nodes] = React.useState<Node[]>(generateMockNodes());
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);

  const filteredNodes = nodes.filter((node) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !node.id.toLowerCase().includes(query) &&
        !node.address.toLowerCase().includes(query) &&
        !node.gpu.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (statusFilter && node.status !== statusFilter) return false;
    return true;
  });

  const flaggedCount = nodes.filter((n) => n.flags.includes("flagged")).length;
  const investigatingCount = nodes.filter((n) => n.flags.includes("investigating")).length;

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
                        {node.address.slice(0, 8)}...{node.address.slice(-6)}
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
                      <ReputationBadge score={node.reputation} showScore />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono-data text-foreground">
                        {node.stake.toFixed(1)} ETH
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground-muted">
                        {formatRelativeTime(node.lastHeartbeat)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {node.flags.includes("flagged") && (
                          <Badge variant="danger" size="sm">
                            <Flag className="h-3 w-3 mr-0.5" />
                            flagged
                          </Badge>
                        )}
                        {node.flags.includes("investigating") && (
                          <Badge variant="warning" size="sm">
                            <AlertTriangle className="h-3 w-3 mr-0.5" />
                            investigating
                          </Badge>
                        )}
                        {node.flags.includes("clean") && (
                          <Badge variant="success" size="sm">
                            <CheckCircle2 className="h-3 w-3 mr-0.5" />
                            clean
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/nodes/${node.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {!node.flags.includes("flagged") && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Flag Node">
                            <Flag className="h-4 w-4 text-indicator-stale" />
                          </Button>
                        )}
                        {!node.flags.includes("investigating") && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Investigate">
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                          </Button>
                        )}
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
