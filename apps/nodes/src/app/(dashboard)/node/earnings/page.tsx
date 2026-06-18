"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, DollarSign, ArrowUpRight } from "lucide-react";

const mockAggregateEarnings = {
  summary: {
    today: "0.245 ETH",
    thisWeek: "1.12 ETH",
    thisMonth: "4.85 ETH",
    allTime: "21.92 ETH",
  },
  nodes: [
    { id: "0x1a2b3c4d", name: "GPU-Rig-Alpha", status: "online", earnings: "8.42 ETH", jobsCompleted: 342 },
    { id: "0x5e6f7a8b", name: "GPU-Cluster-Beta", status: "online", earnings: "6.18 ETH", jobsCompleted: 256 },
    { id: "0x9c0d1e2f", name: "Render-Node-01", status: "stale", earnings: "2.85 ETH", jobsCompleted: 124 },
    { id: "0x3a4b5c6d", name: "Dev-GPU-Node", status: "offline", earnings: "4.12 ETH", jobsCompleted: 178 },
    { id: "0x7e8f9a0b", name: "Mining-Farm-03", status: "slashed", earnings: "0.45 ETH", jobsCompleted: 23 },
  ],
};

const statusBadgeClass = {
  online: "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20",
  stale: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
  offline: "bg-[#71717a]/10 text-[#71717a] border-[#71717a]/20",
  slashed: "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20",
};

export default function AggregateEarningsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Aggregate Earnings</h1>
          <p className="text-sm text-[#71717a] mt-1">
            Total earnings across all your nodes
          </p>
        </div>
        <Link href="/node/earnings/withdraw">
          <Button>
            <ArrowUpRight className="h-4 w-4 mr-1" />
            Withdraw All
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#71717a]">Today</span>
            </div>
            <p className="text-2xl font-bold font-mono text-[#22c55e] mt-2">
              {mockAggregateEarnings.summary.today}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#71717a]" />
              <span className="text-sm text-[#71717a]">This Week</span>
            </div>
            <p className="text-2xl font-bold font-mono text-[#22c55e] mt-2">
              {mockAggregateEarnings.summary.thisWeek}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#71717a]" />
              <span className="text-sm text-[#71717a]">This Month</span>
            </div>
            <p className="text-2xl font-bold font-mono text-[#22c55e] mt-2">
              {mockAggregateEarnings.summary.thisMonth}
            </p>
          </CardContent>
        </Card>
        <Card className="border-[#22c55e]/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[#71717a]" />
              <span className="text-sm text-[#71717a]">All Time</span>
            </div>
            <p className="text-2xl font-bold font-mono text-white mt-2">
              {mockAggregateEarnings.summary.allTime}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-Node Earnings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Wallet className="h-4 w-4 text-[#71717a]" />
            Per-Node Earnings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left text-xs text-[#71717a] font-medium px-6 py-3">Node</th>
                <th className="text-center text-xs text-[#71717a] font-medium px-4 py-3">Status</th>
                <th className="text-right text-xs text-[#71717a] font-medium px-4 py-3">Earnings</th>
                <th className="text-right text-xs text-[#71717a] font-medium px-4 py-3">Jobs Completed</th>
              </tr>
            </thead>
            <tbody>
              {mockAggregateEarnings.nodes.map((node) => (
                <tr key={node.id} className="border-b border-[#27272a] last:border-0 hover:bg-[#0f1011]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{node.name}</span>
                      <span className="text-xs text-[#71717a] font-mono">{node.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${statusBadgeClass[node.status as keyof typeof statusBadgeClass]}`}>
                      {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm font-mono text-[#22c55e]">{node.earnings}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm font-mono text-white">{node.jobsCompleted}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
