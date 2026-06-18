"use client";

import * as React from "react";
import Link from "next/link";
import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LiveIndicator } from "@/components/shared/live-indicator";
import { Input } from "@/components/ui/input";
import {
  Cpu,
  Plus,
  Eye,
  TrendingUp,
  TrendingDown,
  Search,
  MoreHorizontal,
} from "lucide-react";

interface Node {
  id: string;
  name: string;
  gpuModel: string;
  vramUsed: number;
  vramTotal: number;
  status: "online" | "stale" | "offline" | "slashed";
  reputation: number;
  stake: string;
  region: string;
  lastHeartbeat: string;
  earnings: string;
}

const mockNodes: Node[] = [
  {
    id: "0x1a2b3c4d",
    name: "GPU-Rig-Alpha",
    gpuModel: "NVIDIA H100 80GB",
    vramUsed: 65,
    vramTotal: 80,
    status: "online",
    reputation: 127,
    stake: "12.5 ETH",
    region: "US-West",
    lastHeartbeat: "2 min ago",
    earnings: "8.42 ETH",
  },
  {
    id: "0x5e6f7a8b",
    name: "GPU-Cluster-Beta",
    gpuModel: "NVIDIA A100 80GB",
    vramUsed: 72,
    vramTotal: 80,
    status: "online",
    reputation: 98,
    stake: "10.0 ETH",
    region: "EU-Central",
    lastHeartbeat: "30 sec ago",
    earnings: "6.18 ETH",
  },
  {
    id: "0x9c0d1e2f",
    name: "Render-Node-01",
    gpuModel: "RTX 4090 24GB",
    vramUsed: 18,
    vramTotal: 24,
    status: "stale",
    reputation: 45,
    stake: "3.2 ETH",
    region: "Asia-Pacific",
    lastHeartbeat: "5 min ago",
    earnings: "2.85 ETH",
  },
  {
    id: "0x3a4b5c6d",
    name: "Dev-GPU-Node",
    gpuModel: "NVIDIA H100 80GB",
    vramUsed: 0,
    vramTotal: 80,
    status: "offline",
    reputation: 76,
    stake: "8.0 ETH",
    region: "US-East",
    lastHeartbeat: "2 hours ago",
    earnings: "4.12 ETH",
  },
  {
    id: "0x7e8f9a0b",
    name: "Mining-Farm-03",
    gpuModel: "NVIDIA A100 80GB",
    vramUsed: 78,
    vramTotal: 80,
    status: "slashed",
    reputation: 12,
    stake: "2.1 ETH",
    region: "EU-West",
    lastHeartbeat: "1 day ago",
    earnings: "0.45 ETH",
  },
];

const statusBadgeClass: Record<Node["status"], string> = {
  online: "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20",
  stale: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
  offline: "bg-[#71717a]/10 text-[#71717a] border-[#71717a]/20",
  slashed: "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20",
};

export default function NodesListPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredNodes = mockNodes.filter(
    (node) =>
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.gpuModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">My Nodes</h1>
          <p className="text-sm text-[#71717a] mt-1">
            Manage your registered GPU compute nodes
          </p>
        </div>
        <Link href="/node/nodes/new">
          <Button variant="default" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Node
          </Button>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Nodes"
          value="5"
          trend="up"
          trendValue="+1 this month"
          glowColor="active"
        />
        <MetricCard
          label="Total Earnings"
          value="21.92 ETH"
          trend="up"
          trendValue="+12.4% this week"
          glowColor="active"
        />
        <MetricCard
          label="Avg Reputation"
          value="71.6"
          trend="down"
          trendValue="-2.3 pts"
        />
        <MetricCard
          label="Active Jobs"
          value="3"
          trend="neutral"
          trendValue="0 pending"
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717a]" />
        <Input
          placeholder="Search nodes by name, GPU model, or region..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-[#0f1011] border-[#27272a]"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#71717a]" />
            Registered Nodes ({filteredNodes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#27272a]">
                  <th className="text-left text-xs text-[#71717a] font-medium px-6 py-3">
                    Name / GPU
                  </th>
                  <th className="text-center text-xs text-[#71717a] font-medium px-4 py-3">
                    Status
                  </th>
                  <th className="text-center text-xs text-[#71717a] font-medium px-4 py-3">
                    Reputation
                  </th>
                  <th className="text-right text-xs text-[#71717a] font-medium px-4 py-3">
                    Stake
                  </th>
                  <th className="text-center text-xs text-[#71717a] font-medium px-4 py-3">
                    VRAM
                  </th>
                  <th className="text-center text-xs text-[#71717a] font-medium px-4 py-3">
                    Region
                  </th>
                  <th className="text-center text-xs text-[#71717a] font-medium px-4 py-3">
                    Last Heartbeat
                  </th>
                  <th className="text-right text-xs text-[#71717a] font-medium px-6 py-3">
                    Earnings
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredNodes.map((node) => (
                  <tr
                    key={node.id}
                    className="border-b border-[#27272a] last:border-0 hover:bg-[#0f1011]/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">
                          {node.name}
                        </span>
                        <span className="text-xs text-[#71717a] font-mono">
                          {node.gpuModel}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${statusBadgeClass[node.status]}`}
                      >
                        <LiveIndicator status={node.status === "online" ? "connected" : node.status === "stale" ? "reconnecting" : "disconnected"} size="sm" />
                        {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {node.reputation >= 100 ? (
                          <TrendingUp className="h-3 w-3 text-[#22c55e]" />
                        ) : node.reputation < 50 ? (
                          <TrendingDown className="h-3 w-3 text-[#ef4444]" />
                        ) : null}
                        <span
                          className={`text-sm font-mono ${
                            node.reputation >= 100
                              ? "text-[#22c55e]"
                              : node.reputation < 50
                              ? "text-[#ef4444]"
                              : "text-white"
                          }`}
                        >
                          {node.reputation}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-mono text-white">
                        {node.stake}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (node.vramUsed / node.vramTotal) > 0.9
                                ? "bg-[#ef4444]"
                                : (node.vramUsed / node.vramTotal) > 0.7
                                ? "bg-[#f59e0b]"
                                : "bg-[#22c55e]"
                            }`}
                            style={{
                              width: `${(node.vramUsed / node.vramTotal) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono text-[#71717a]">
                          {node.vramUsed}/{node.vramTotal} GB
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-[#71717a]">{node.region}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-[#71717a] font-mono">
                        {node.lastHeartbeat}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-mono text-[#22c55e]">
                        {node.earnings}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/node/nodes/${node.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
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
