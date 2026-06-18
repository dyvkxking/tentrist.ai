"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Briefcase, CheckCircle, Clock, Cpu, Zap, Save } from "lucide-react";

const mockJobData = {
  id: "0xabc123def456",
  status: "completed",
  startedAt: "2024-06-16 14:30:00 UTC",
  completedAt: "2024-06-16 15:15:32 UTC",
  duration: "45m 32s",
  earnings: "0.045 ETH",
  slaTarget: "99% uptime, 50ms max latency",
  workUnitsCompleted: 128,
  workUnitsTotal: 128,
  checkpoints: [
    { id: "1", timestamp: "15:00", progress: "25%", vramUsage: "72GB" },
    { id: "2", timestamp: "15:07", progress: "50%", vramUsage: "76GB" },
    { id: "3", timestamp: "15:14", progress: "75%", vramUsage: "78GB" },
    { id: "4", timestamp: "15:15", progress: "100%", vramUsage: "65GB" },
  ],
  metrics: {
    avgVramUsage: "74.2 GB",
    maxVramUsage: "79.8 GB",
    avgLatency: "38ms",
    maxLatency: "47ms",
    uptimeScore: "100%",
  },
};

export default function JobDetailPage() {
  const params = useParams();
  const nodeId = params.id as string;
  const jobId = params.jobId as string;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/node/nodes/${nodeId}/jobs`}
        className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Job Details</h1>
          <p className="text-sm text-[#71717a] font-mono mt-1">{jobId}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">
          <CheckCircle className="h-4 w-4" />
          Completed
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#71717a]" />
              <span className="text-sm text-[#71717a]">Duration</span>
            </div>
            <p className="text-xl font-bold font-mono text-white mt-2">{mockJobData.duration}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#71717a]" />
              <span className="text-sm text-[#71717a]">Earnings</span>
            </div>
            <p className="text-xl font-bold font-mono text-[#22c55e] mt-2">{mockJobData.earnings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#71717a]" />
              <span className="text-sm text-[#71717a]">Work Units</span>
            </div>
            <p className="text-xl font-bold font-mono text-white mt-2">
              {mockJobData.workUnitsCompleted}/{mockJobData.workUnitsTotal}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#71717a]" />
              <span className="text-sm text-[#71717a]">SLA Outcome</span>
            </div>
            <p className="text-xl font-bold text-[#22c55e] mt-2">Met</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Time Range</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex justify-between">
            <span className="text-sm text-[#71717a]">Started</span>
            <span className="text-sm font-mono text-white">{mockJobData.startedAt}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-[#71717a]">Completed</span>
            <span className="text-sm font-mono text-white">{mockJobData.completedAt}</span>
          </div>
        </CardContent>
      </Card>

      {/* My Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Cpu className="h-4 w-4 text-[#71717a]" />
            My Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-[#71717a]">Avg VRAM</p>
            <p className="text-lg font-bold font-mono text-white">{mockJobData.metrics.avgVramUsage}</p>
          </div>
          <div>
            <p className="text-xs text-[#71717a]">Max VRAM</p>
            <p className="text-lg font-bold font-mono text-white">{mockJobData.metrics.maxVramUsage}</p>
          </div>
          <div>
            <p className="text-xs text-[#71717a]">Avg Latency</p>
            <p className="text-lg font-bold font-mono text-white">{mockJobData.metrics.avgLatency}</p>
          </div>
          <div>
            <p className="text-xs text-[#71717a]">Max Latency</p>
            <p className="text-lg font-bold font-mono text-white">{mockJobData.metrics.maxLatency}</p>
          </div>
          <div>
            <p className="text-xs text-[#71717a]">Uptime Score</p>
            <p className="text-lg font-bold text-[#22c55e]">{mockJobData.metrics.uptimeScore}</p>
          </div>
        </CardContent>
      </Card>

      {/* Checkpoint History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Save className="h-4 w-4 text-[#71717a]" />
            Checkpoint History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left text-xs text-[#71717a] font-medium px-6 py-3">Checkpoint ID</th>
                <th className="text-left text-xs text-[#71717a] font-medium px-4 py-3">Timestamp</th>
                <th className="text-center text-xs text-[#71717a] font-medium px-4 py-3">Progress</th>
                <th className="text-right text-xs text-[#71717a] font-medium px-6 py-3">VRAM Usage</th>
              </tr>
            </thead>
            <tbody>
              {mockJobData.checkpoints.map((cp) => (
                <tr key={cp.id} className="border-b border-[#27272a] last:border-0">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-white">Checkpoint-{cp.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-mono text-[#71717a]">{cp.timestamp}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#22c55e] rounded-full"
                          style={{ width: cp.progress }}
                        />
                      </div>
                      <span className="text-sm font-mono text-white">{cp.progress}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-mono text-white">{cp.vramUsage}</span>
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
