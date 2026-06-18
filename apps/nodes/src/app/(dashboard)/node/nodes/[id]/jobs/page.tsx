"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, Eye, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

interface Job {
  id: string;
  status: "completed" | "failed" | "running" | "pending";
  completedAt: string;
  duration: string;
  earnings: string;
  slaOutcome: "met" | "breached" | "partial";
}

const mockJobs: Job[] = [
  { id: "0xabc123def456", status: "completed", completedAt: "2 hours ago", duration: "45m 32s", earnings: "0.045 ETH", slaOutcome: "met" },
  { id: "0xdef789abc012", status: "completed", completedAt: "6 hours ago", duration: "1h 23m 15s", earnings: "0.082 ETH", slaOutcome: "met" },
  { id: "0xghi345jkl678", status: "completed", completedAt: "1 day ago", duration: "32m 08s", earnings: "0.032 ETH", slaOutcome: "breached" },
  { id: "0xjkl901mno234", status: "running", completedAt: "In progress", duration: "12m 45s", earnings: "0.015 ETH", slaOutcome: "partial" },
  { id: "0xmno567pqr890", status: "completed", completedAt: "2 days ago", duration: "2h 01m 22s", earnings: "0.120 ETH", slaOutcome: "met" },
  { id: "0xpqr123stu456", status: "failed", completedAt: "3 days ago", duration: "5m 12s", earnings: "0.005 ETH", slaOutcome: "breached" },
  { id: "0xstu789vwx012", status: "completed", completedAt: "4 days ago", duration: "58m 44s", earnings: "0.058 ETH", slaOutcome: "met" },
];

const statusBadgeClass: Record<Job["status"], { bg: string; text: string; icon: React.ElementType }> = {
  completed: { bg: "bg-[#22c55e]/10", text: "text-[#22c55e]", icon: CheckCircle },
  failed: { bg: "bg-[#ef4444]/10", text: "text-[#ef4444]", icon: XCircle },
  running: { bg: "bg-[#f59e0b]/10", text: "text-[#f59e0b]", icon: Clock },
  pending: { bg: "bg-[#71717a]/10", text: "text-[#71717a]", icon: Clock },
};

const slaBadgeClass: Record<Job["slaOutcome"], string> = {
  met: "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20",
  breached: "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20",
  partial: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
};

export default function NodeJobsPage() {
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
        <h1 className="text-xl font-semibold text-white">Assigned Jobs</h1>
        <p className="text-sm text-[#71717a] mt-1">
          Jobs assigned to node {nodeId}
        </p>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-[#71717a]" />
            Job History ({mockJobs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#27272a]">
                  <th className="text-left text-xs text-[#71717a] font-medium px-6 py-3">Job ID</th>
                  <th className="text-center text-xs text-[#71717a] font-medium px-4 py-3">Status</th>
                  <th className="text-center text-xs text-[#71717a] font-medium px-4 py-3">Completed At</th>
                  <th className="text-right text-xs text-[#71717a] font-medium px-4 py-3">Duration</th>
                  <th className="text-right text-xs text-[#71717a] font-medium px-4 py-3">Earnings</th>
                  <th className="text-center text-xs text-[#71717a] font-medium px-4 py-3">SLA Outcome</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {mockJobs.map((job) => {
                  const StatusIcon = statusBadgeClass[job.status].icon;
                  return (
                    <tr key={job.id} className="border-b border-[#27272a] last:border-0 hover:bg-[#0f1011]/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-white">{job.id}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${statusBadgeClass[job.status].bg} ${statusBadgeClass[job.status].text}`}>
                          <StatusIcon className="h-3 w-3" />
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-[#71717a] font-mono">{job.completedAt}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-mono text-white">{job.duration}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-mono text-[#22c55e]">{job.earnings}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${slaBadgeClass[job.slaOutcome]}`}>
                          {job.slaOutcome === "met" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {job.slaOutcome === "breached" && <XCircle className="h-3 w-3 mr-1" />}
                          {job.slaOutcome === "partial" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {job.slaOutcome.charAt(0).toUpperCase() + job.slaOutcome.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/node/nodes/${nodeId}/jobs/${job.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
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
