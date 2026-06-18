"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle, DollarSign, RefreshCw, ExternalLink } from "lucide-react";

const mockSlashingData = {
  totalSlashed: "0.85 ETH",
  totalRefunded: "0.62 ETH",
  slashRate: "1.2%",
  events: [
    {
      id: "0xevt001",
      jobId: "0xpqr123stu456",
      amount: "0.15 ETH",
      reason: "Missed heartbeat threshold",
      timestamp: "3 days ago",
      onChain: "0xf8e5...a3b2",
    },
    {
      id: "0xevt002",
      jobId: "0xstu789vwx012",
      amount: "0.45 ETH",
      reason: "SLA breach - latency exceeded",
      timestamp: "1 week ago",
      onChain: "0xd4c7...f1e8",
    },
    {
      id: "0xevt003",
      jobId: "0xmno567pqr890",
      amount: "0.25 ETH",
      reason: "Node offline for 5+ minutes",
      timestamp: "2 weeks ago",
      onChain: "0xa2b9...c7d4",
    },
  ],
};

export default function SlashingPage() {
  const params = useParams();
  const nodeId = params.id as string;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/node/nodes/${nodeId}`}
        className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Node Overview
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Slashing History</h1>
        <p className="text-sm text-[#71717a] mt-1">
          Slashing events for node {nodeId}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#ef4444]/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#ef4444]/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[#ef4444]" />
              </div>
              <div>
                <p className="text-sm text-[#71717a]">Total Slashed</p>
                <p className="text-2xl font-bold font-mono text-[#ef4444] mt-1">
                  {mockSlashingData.totalSlashed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#f59e0b]/10 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-[#f59e0b]" />
              </div>
              <div>
                <p className="text-sm text-[#71717a]">Total Refunded</p>
                <p className="text-2xl font-bold font-mono text-[#f59e0b] mt-1">
                  {mockSlashingData.totalRefunded}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-[#22c55e]" />
              </div>
              <div>
                <p className="text-sm text-[#71717a]">Slash Rate</p>
                <p className="text-2xl font-bold font-mono text-white mt-1">
                  {mockSlashingData.slashRate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Slashing Events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left text-xs text-[#71717a] font-medium px-6 py-3">Event ID</th>
                <th className="text-left text-xs text-[#71717a] font-medium px-4 py-3">Job ID</th>
                <th className="text-right text-xs text-[#71717a] font-medium px-4 py-3">Amount</th>
                <th className="text-left text-xs text-[#71717a] font-medium px-4 py-3">Reason</th>
                <th className="text-right text-xs text-[#71717a] font-medium px-4 py-3">Timestamp</th>
                <th className="text-right text-xs text-[#71717a] font-medium px-6 py-3">On-Chain</th>
              </tr>
            </thead>
            <tbody>
              {mockSlashingData.events.map((event) => (
                <tr key={event.id} className="border-b border-[#27272a] last:border-0">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-white">{event.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-mono text-[#71717a]">{event.jobId}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm font-mono text-[#ef4444]">{event.amount}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-white">{event.reason}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-sm text-[#71717a] font-mono">{event.timestamp}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href="#"
                      className="inline-flex items-center gap-1 text-sm font-mono text-[#22c55e] hover:underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      {event.onChain}
                      <ExternalLink className="h-3 w-3" />
                    </a>
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
