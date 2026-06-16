"use client";

import * as React from "react";
import Link from "next/link";
import {
  Server,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Cpu,
  HardDrive,
  Globe,
  Shield,
  TrendingUp,
  ChevronDown,
  MoreHorizontal,
  ExternalLink,
  List,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ReputationBadge, getReputationTier } from "@/components/ui/ReputationBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { useNodes, useNetworkStats } from "@/hooks/use-nodes";
import type { NodeProvider, NetworkStats } from "@/hooks/use-nodes";
import { ResponsiveCard, useIsMobile } from "@/components/ui/responsive-table";

// Format relative time
function formatRelativeTime(date: number): string {
  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Format stake amount
function formatStake(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${currency}`;
}

// Network Metrics Ribbon
function NetworkMetricsRibbon({ stats }: { stats: NetworkStats }) {
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      <MetricCard
        label="Total Nodes"
        value={stats.totalNodes}
        trend={stats.onlineNodes > stats.totalNodes / 2 ? "up" : "down"}
        trendValue={`${stats.onlineNodes} online`}
        glowColor="active"
        className="bg-bg-surface/80"
      />
      <MetricCard
        label="Total Staked"
        value={`${stats.totalStaked.toFixed(0)}`}
        trend="up"
        trendValue="ETH"
        glowColor="none"
        className="bg-bg-surface/80"
      />
      <MetricCard
        label="Available VRAM"
        value={`${stats.availableVRAM}GB`}
        trend="neutral"
        trendValue={`of ${stats.totalVRAM}GB`}
        glowColor="active"
        className="bg-bg-surface/80"
      />
      <MetricCard
        label="Avg Reputation"
        value={stats.averageReputation}
        trend={stats.averageReputation > 50 ? "up" : "down"}
        glowColor={stats.averageReputation > 50 ? "active" : "stale"}
        className="bg-bg-surface/80"
      />
      {/* Reputation tier distribution */}
      <div className="bg-bg-surface/80 border border-hairline rounded-lg p-3 flex flex-col gap-1">
        <span className="text-[10px] text-foreground-muted uppercase tracking-wider">
          Gold Tier
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-mono-data text-amber-400">
            {stats.goldTierCount}
          </span>
          <span className="text-[10px] text-foreground-muted font-mono-data">
            nodes
          </span>
        </div>
      </div>
      <div className="bg-bg-surface/80 border border-hairline rounded-lg p-3 flex flex-col gap-1">
        <span className="text-[10px] text-foreground-muted uppercase tracking-wider">
          Silver Tier
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-mono-data text-zinc-300">
            {stats.silverTierCount}
          </span>
          <span className="text-[10px] text-foreground-muted font-mono-data">
            nodes
          </span>
        </div>
      </div>
      <div className="bg-bg-surface/80 border border-hairline rounded-lg p-3 flex flex-col gap-1">
        <span className="text-[10px] text-foreground-muted uppercase tracking-wider">
          Bronze Tier
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-mono-data text-orange-600">
            {stats.bronzeTierCount}
          </span>
          <span className="text-[10px] text-foreground-muted font-mono-data">
            nodes
          </span>
        </div>
      </div>
      <div className="bg-bg-surface/80 border border-hairline rounded-lg p-3 flex flex-col gap-1">
        <span className="text-[10px] text-foreground-muted uppercase tracking-wider">
          Unranked
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-mono-data text-zinc-500">
            {stats.unrankedTierCount}
          </span>
          <span className="text-[10px] text-foreground-muted font-mono-data">
            nodes
          </span>
        </div>
      </div>
    </div>
  );
}

// Node row for table
function NodeRow({ node }: { node: NodeProvider }) {
  const vramPercentage = (node.vramUsed / node.vramTotal) * 100;
  const isStale = Date.now() - node.lastHeartbeat > 60000;

  return (
    <tr className="hover:bg-bg-base/50 transition-colors group">
      {/* Node ID & Address */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-mono-data text-foreground">
            {node.id}
          </span>
          <span className="text-xs text-foreground-muted font-mono-data">
            {node.address}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <div className="flex justify-center">
          <StatusBadge status={node.status} showPulse size="sm" />
        </div>
      </td>

      {/* Reputation Tier */}
      <td className="px-4 py-3">
        <div className="flex justify-center">
          <ReputationBadge
            tier={node.tier}
            score={node.reputation}
            showScore
            size="sm"
          />
        </div>
      </td>

      {/* Stake Amount */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-mono-data text-indicator-active text-right">
            {formatStake(node.stakeAmount, node.stakeCurrency)}
          </span>
          <span className="text-xs text-foreground-muted font-mono-data text-right">
            collateral
          </span>
        </div>
      </td>

      {/* Hardware - VRAM */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1 min-w-[100px]">
          <div className="flex justify-between text-xs">
            <span className="text-foreground-muted flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              VRAM
            </span>
            <span className="font-mono-data text-foreground">
              {node.vramUsed}/{node.vramTotal}GB
            </span>
          </div>
          <div className="h-1.5 bg-bg-base rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                vramPercentage > 90
                  ? "bg-indicator-slashed"
                  : vramPercentage > 75
                  ? "bg-indicator-stale"
                  : "bg-indicator-active"
              )}
              style={{ width: `${vramPercentage}%` }}
            />
          </div>
        </div>
      </td>

      {/* Hardware - CPU */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-mono-data text-foreground truncate max-w-[120px] block">
            {node.cpuModel}
          </span>
          <span className="text-xs text-foreground-muted font-mono-data">
            {node.cpuCores} cores
          </span>
        </div>
      </td>

      {/* Region */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Globe className="h-3 w-3 text-foreground-muted" />
          <span className="text-xs font-mono-data text-foreground">
            {node.region}
          </span>
        </div>
      </td>

      {/* Uptime */}
      <td className="px-4 py-3">
        <span className="text-sm font-mono-data text-foreground text-center block">
          {node.uptime}%
        </span>
      </td>

      {/* Jobs */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="font-mono-data text-indicator-active">
            {node.totalJobsCompleted} done
          </span>
          {node.totalJobsFailed > 0 && (
            <span className="font-mono-data text-indicator-slashed">
              {node.totalJobsFailed} failed
            </span>
          )}
        </div>
      </td>

      {/* Last Heartbeat */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1.5">
          {isStale ? (
            <div className="w-1.5 h-1.5 rounded-full bg-indicator-stale" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-indicator-active pulse-active" />
          )}
          <span
            className={cn(
              "text-xs font-mono-data",
              isStale ? "text-indicator-stale" : "text-foreground-muted"
            )}
          >
            {formatRelativeTime(node.lastHeartbeat)}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Empty state
function EmptyNodesState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-zinc-800 rounded-lg">
      <Server className="h-10 w-10 text-foreground-muted mb-4" />
      <h3 className="text-base font-semibold text-foreground mb-1">
        No nodes registered
      </h3>
      <p className="text-sm text-foreground-muted max-w-sm mb-4">
        Register your first GPU node to start processing workloads and earning
        rewards.
      </p>
      <Link
        href="/nodes/register"
        className="inline-flex items-center justify-center rounded-md font-medium border bg-indicator-active/20 text-indicator-active border-indicator-active/40 hover:bg-indicator-active/30 h-8 px-3 text-xs gap-1.5 transition-all"
      >
        <Plus className="h-4 w-4 mr-2" />
        Register Node
      </Link>
    </div>
  );
}

// Status filter pills
function StatusFilterPills({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (status: string) => void;
}) {
  const statuses = ["online", "stale", "offline", "slashed"];

  return (
    <div className="flex items-center gap-1">
      {statuses.map((status) => (
        <Button
          key={status}
          variant={selected.includes(status) ? "primary" : "outline"}
          size="sm"
          onClick={() => onToggle(status)}
          className={cn(
            "h-8 text-xs capitalize",
            selected.includes(status) &&
              status === "online" &&
              "bg-indicator-active/20 text-indicator-active border-indicator-active/30",
            selected.includes(status) &&
              status === "stale" &&
              "bg-indicator-stale/20 text-indicator-stale border-indicator-stale/30",
            selected.includes(status) &&
              status === "offline" &&
              "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
            selected.includes(status) &&
              status === "slashed" &&
              "bg-indicator-slashed/20 text-indicator-slashed border-indicator-slashed/30"
          )}
        >
          {status}
        </Button>
      ))}
    </div>
  );
}

export default function NodesPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
  const [sortField, setSortField] = React.useState<keyof NodeProvider>("reputation");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [view, setView] = React.useState<"table" | "cards">("table");
  const isMobile = useIsMobile();

  const { data: nodes, isLoading: nodesLoading } = useNodes();
  const { data: stats } = useNetworkStats();

  // Filter and sort nodes
  const filteredNodes = React.useMemo(() => {
    if (!nodes) return [];

    let result = [...nodes];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.id.toLowerCase().includes(query) ||
          n.address.toLowerCase().includes(query) ||
          n.region.toLowerCase().includes(query) ||
          n.cpuModel.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter.length > 0) {
      result = result.filter((n) => statusFilter.includes(n.status));
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });

    return result;
  }, [nodes, searchQuery, statusFilter, sortField, sortDir]);

  const handleSort = (field: keyof NodeProvider) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const handleStatusToggle = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Node Providers
          </h1>
          <p className="text-sm text-foreground-muted">
            Monitor and manage GPU compute node infrastructure
          </p>
        </div>
        <Link
          href="/nodes/register"
          className="inline-flex items-center justify-center rounded-md font-medium border bg-indicator-active/20 text-indicator-active border-indicator-active/40 hover:bg-indicator-active/30 h-8 px-3 text-xs gap-1.5 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Register Node
        </Link>
      </div>

      {/* Network Metrics Ribbon */}
      {stats && <NetworkMetricsRibbon stats={stats} />}

      {/* Filters */}
      <Card className="bg-bg-surface/80">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            {/* Search and filter row */}
            <div className="flex items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <Input
                  type="search"
                  placeholder="Search nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>

              {/* Status filter */}
              <StatusFilterPills
                selected={statusFilter}
                onToggle={handleStatusToggle}
              />

              {/* Refresh */}
              <Button variant="outline" size="icon" className="h-9 w-9">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Active filters indicator */}
            {(searchQuery || statusFilter.length > 0) && (
              <div className="flex items-center gap-2 text-xs text-foreground-muted">
                <span>Showing {filteredNodes.length} of {nodes?.length || 0} nodes</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-2 text-xs"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter([]);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}

            {/* View toggle - always visible */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setView(view === "table" ? "cards" : "table")}
              title={view === "table" ? "Card view" : "Table view"}
            >
              {view === "table" ? (
                <LayoutGrid className="h-4 w-4" />
              ) : (
                <List className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Nodes Content - Table or Cards */}
      {view === "table" || !isMobile ? (
        <Card className="bg-bg-surface/80 overflow-hidden">
          {nodesLoading ? (
            <CardContent className="p-6">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-bg-base rounded animate-pulse"
                  />
                ))}
              </div>
            </CardContent>
          ) : filteredNodes.length === 0 ? (
            <CardContent className="p-6">
              <EmptyNodesState />
            </CardContent>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline">
                    <th
                      className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("id")}
                    >
                      <div className="flex items-center gap-1">
                        Node
                        {sortField === "id" && (
                          <ChevronDown
                            className={cn(
                              "h-3 w-3",
                              sortDir === "asc" && "rotate-180"
                            )}
                          />
                        )}
                      </div>
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th
                      className="text-center px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("tier")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Tier
                        {sortField === "tier" && (
                          <ChevronDown
                            className={cn(
                              "h-3 w-3",
                              sortDir === "asc" && "rotate-180"
                            )}
                          />
                        )}
                      </div>
                    </th>
                    <th
                      className="text-right px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("stakeAmount")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Stake
                        {sortField === "stakeAmount" && (
                          <ChevronDown
                            className={cn(
                              "h-3 w-3",
                              sortDir === "asc" && "rotate-180"
                            )}
                          />
                        )}
                      </div>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Hardware
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      CPU
                    </th>
                    <th
                      className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("region")}
                    >
                      <div className="flex items-center gap-1">
                        Region
                        {sortField === "region" && (
                          <ChevronDown
                            className={cn(
                              "h-3 w-3",
                              sortDir === "asc" && "rotate-180"
                            )}
                          />
                        )}
                      </div>
                    </th>
                    <th
                      className="text-center px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("uptime")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Uptime
                        {sortField === "uptime" && (
                          <ChevronDown
                            className={cn(
                              "h-3 w-3",
                              sortDir === "asc" && "rotate-180"
                            )}
                          />
                        )}
                      </div>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Jobs
                    </th>
                    <th
                      className="text-right px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("lastHeartbeat")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Heartbeat
                        {sortField === "lastHeartbeat" && (
                          <ChevronDown
                            className={cn(
                              "h-3 w-3",
                              sortDir === "asc" && "rotate-180"
                            )}
                          />
                        )}
                      </div>
                    </th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {filteredNodes.map((node) => (
                    <NodeRow key={node.id} node={node} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-hairline">
              <span className="text-xs text-foreground-muted">
                Showing {filteredNodes.length} nodes
              </span>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-foreground-muted">
                  Total staked:{" "}
                  <span className="font-mono-data text-indicator-active">
                    {stats?.totalStaked.toFixed(2)} ETH
                  </span>
                </span>
              </div>
            </div>
          </>
        )}
      </Card>
      ) : (
        /* Mobile Card View */
        <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
          {filteredNodes.map((node) => {
            const isStale = node.status === "stale" || node.status === "offline";
            return (
              <ResponsiveCard
                key={node.id}
                title={node.id}
                subtitle={node.address}
                badge={
                  <StatusBadge status={node.status} showPulse size="sm" />
                }
                items={[
                  { label: "Stake", value: `${node.stakeAmount.toFixed(1)} ETH`, align: "right" },
                  { label: "Tier", value: <ReputationBadge tier={getReputationTier(node.reputation)} score={node.reputation} /> },
                  { label: "CPU", value: `${node.cpuCores} cores` },
                  { label: "VRAM", value: `${node.vramUsed}/${node.vramTotal} GB` },
                  { label: "Region", value: node.region },
                  { label: "Heartbeat", value: formatRelativeTime(node.lastHeartbeat), align: "right" },
                ]}
                actions={
                  <Link href={`/nodes/${node.id}`}>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                }
                className={cn(
                  node.status === "online" && "border-indicator-active/20",
                  node.status === "stale" && "border-indicator-stale/20",
                  node.status === "offline" && "border-zinc-700/50",
                  node.status === "slashed" && "border-indicator-slashed/20"
                )}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
