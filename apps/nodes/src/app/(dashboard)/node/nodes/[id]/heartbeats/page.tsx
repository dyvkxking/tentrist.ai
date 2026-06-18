"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const generateHeartbeatGrid = () => {
  const slots: Array<"ok" | "missed" | "warn" | "offline"> = [];
  // 30 days * 288 slots/day (5-min intervals) = 8640 slots, but we show last 30 days
  for (let i = 0; i < 30 * 24; i++) {
    const rand = Math.random();
    if (rand < 0.92) slots.push("ok");
    else if (rand < 0.97) slots.push("warn");
    else if (rand < 0.995) slots.push("missed");
    else slots.push("offline");
  }
  return slots;
};

const mockHeartbeatData = {
  totalHeartbeats: 8640,
  successRate: "99.2%",
  avgLatency: "142ms",
  missedCount: 12,
  recentMissed: [
    { id: "1", timestamp: "2 hours ago", reason: "Network timeout" },
    { id: "2", timestamp: "1 day ago", reason: "GPU driver crash" },
    { id: "3", timestamp: "3 days ago", reason: "Network timeout" },
    { id: "4", timestamp: "5 days ago", reason: "Node restart" },
    { id: "5", timestamp: "1 week ago", reason: "Network timeout" },
  ],
};

export default function HeartbeatsPage() {
  const params = useParams();
  const nodeId = params.id as string;
  const [heartbeats] = React.useState(generateHeartbeatGrid);

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
        <h1 className="text-xl font-semibold text-white">Heartbeat Reliability</h1>
        <p className="text-sm text-[#71717a] mt-1">
          30-day pulse history for node {nodeId}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
                <Heart className="h-5 w-5 text-[#22c55e]" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-white">{mockHeartbeatData.totalHeartbeats.toLocaleString()}</p>
                <p className="text-xs text-[#71717a]">Total Heartbeats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-[#22c55e]" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-[#22c55e]">{mockHeartbeatData.successRate}</p>
                <p className="text-xs text-[#71717a]">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f59e0b]/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#f59e0b]" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-white">{mockHeartbeatData.avgLatency}</p>
                <p className="text-xs text-[#71717a]">Avg Latency</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ef4444]/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-[#ef4444]" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-[#ef4444]">{mockHeartbeatData.missedCount}</p>
                <p className="text-xs text-[#71717a]">Missed Pulses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pulse Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Heart className="h-4 w-4 text-[#71717a]" />
            30-Day Pulse History (5-min intervals)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#22c55e]" />
              <span className="text-xs text-[#71717a]">OK</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#f59e0b]" />
              <span className="text-xs text-[#71717a]">VRAM Warning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#ef4444]" />
              <span className="text-xs text-[#71717a]">Missed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#27272a]" />
              <span className="text-xs text-[#71717a]">Offline</span>
            </div>
          </div>

          {/* Grid - simplified 30 days x 24 hours */}
          <div className="grid gap-0.5" style={{ gridTemplateColumns: "repeat(24, 1fr)" }}>
            {heartbeats.map((slot, i) => (
              <div
                key={i}
                className={`w-full aspect-square rounded-sm ${
                  slot === "ok"
                    ? "bg-[#22c55e]"
                    : slot === "warn"
                    ? "bg-[#f59e0b]"
                    : slot === "missed"
                    ? "bg-[#ef4444]"
                    : "bg-[#27272a]"
                }`}
                title={`${slot.toUpperCase()} - Slot ${i + 1}`}
              />
            ))}
          </div>

          {/* Day labels */}
          <div className="flex justify-between mt-2">
            {[0, 7, 14, 21, 29].map((day) => (
              <span key={day} className="text-[10px] text-[#71717a] font-mono">
                Day {day + 1}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Missed Pulses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Missed Pulses</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left text-xs text-[#71717a] font-medium px-6 py-3">Event ID</th>
                <th className="text-left text-xs text-[#71717a] font-medium px-4 py-3">Reason</th>
                <th className="text-right text-xs text-[#71717a] font-medium px-6 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {mockHeartbeatData.recentMissed.map((miss) => (
                <tr key={miss.id} className="border-b border-[#27272a] last:border-0">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-[#ef4444]">{miss.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-white">{miss.reason}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-[#71717a] font-mono">{miss.timestamp}</span>
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
