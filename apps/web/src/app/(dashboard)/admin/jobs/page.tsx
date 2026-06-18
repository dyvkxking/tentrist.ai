"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Server,
  Eye,
  Clock,
  DollarSign,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RequireAuth } from "@/components/providers/require-auth";

interface Job {
  id: string;
  clientAddress: string;
  status: "pending" | "running" | "completed" | "failed" | "requeued" | "cancelled";
  nodes: number;
  value: number;
  sla: {
    uptime: number;
    throughput: number;
    deadline: number;
  };
  createdAt: number;
}

function generateMockJobs(): Job[] {
  return [
    {
      id: "job_a1b2c3d4",
      clientAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      status: "running",
      nodes: 4,
      value: 2.5,
      sla: { uptime: 95, throughput: 100, deadline: Date.now() + 86400000 },
      createdAt: Date.now() - 3600000,
    },
    {
      id: "job_e5f6g7h8",
      clientAddress: "0x862964cE01621d2F447D1A4d5d7dE0286FA8918f",
      status: "completed",
      nodes: 2,
      value: 1.2,
      sla: { uptime: 98, throughput: 150, deadline: Date.now() - 86400000 },
      createdAt: Date.now() - 172800000,
    },
    {
      id: "job_i9j0k1l2",
      clientAddress: "0x3d9dCB725C5B078cC8d2E8a4f4C7bD9e5f6a8b7c",
      status: "failed",
      nodes: 3,
      value: 3.8,
      sla: { uptime: 95, throughput: 200, deadline: Date.now() - 43200000 },
      createdAt: Date.now() - 259200000,
    },
    {
      id: "job_m3n4o5p6",
      clientAddress: "0xfedc0987654321abcdef0123456789abcdef0123",
      status: "pending",
      nodes: 8,
      value: 5.0,
      sla: { uptime: 99, throughput: 500, deadline: Date.now() + 172800000 },
      createdAt: Date.now() - 1800000,
    },
    {
      id: "job_q7r8s9t0",
      clientAddress: "0x2468ace13579bdfc0246f8db9310019283746fab",
      status: "requeued",
      nodes: 1,
      value: 0.8,
      sla: { uptime: 90, throughput: 50, deadline: Date.now() + 43200000 },
      createdAt: Date.now() - 7200000,
    },
    {
      id: "job_u1v2w3x4",
      clientAddress: "0xabcd1234efgh5678ijkl9012mnop3456qrst6789",
      status: "completed",
      nodes: 5,
      value: 4.2,
      sla: { uptime: 95, throughput: 300, deadline: Date.now() - 172800000 },
      createdAt: Date.now() - 345600000,
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

export default function AdminJobsPage() {
  return (
    <RequireAuth requiredRole="admin">
      <AdminJobsContent />
    </RequireAuth>
  );
}

function AdminJobsContent() {
  const [jobs] = React.useState<Job[]>(generateMockJobs());
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredJobs = jobs.filter((job) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !job.id.toLowerCase().includes(query) &&
        !job.clientAddress.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    return true;
  });

  const activeCount = jobs.filter((j) => j.status === "running" || j.status === "pending").length;
  const totalValue = jobs.reduce((sum, j) => sum + j.value, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            All Jobs
          </h1>
          <p className="text-sm text-foreground-muted">
            Complete job registry with client information — {filteredJobs.length} jobs
          </p>
        </div>
        <Badge variant="outline" className="text-indicator-active">
          <Server className="h-3 w-3 mr-1" />
          {jobs.length} Total
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data">{jobs.length}</div>
            <div className="text-xs text-foreground-muted">Total Jobs</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data text-indicator-active">
              {activeCount}
            </div>
            <div className="text-xs text-foreground-muted">Active</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data text-indicator-stale">
              {jobs.filter((j) => j.status === "failed").length}
            </div>
            <div className="text-xs text-foreground-muted">Failed</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data">
              {totalValue.toFixed(1)} ETH
            </div>
            <div className="text-xs text-foreground-muted">Total Value</div>
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
                placeholder="Search by job ID or client address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card className="bg-bg-surface/80">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Job ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Nodes
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Value
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    SLA Uptime
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Created
                  </th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-bg-base/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-foreground-muted" />
                        <span className="text-sm font-mono-data text-foreground">
                          {job.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-foreground-muted" />
                        <span className="text-xs font-mono-data text-foreground-muted">
                          {job.clientAddress.slice(0, 8)}...{job.clientAddress.slice(-6)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-mono-data">{job.nodes}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono-data text-indicator-active">
                        {job.value.toFixed(2)} ETH
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-mono-data">{job.sla.uptime}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground-muted">
                        {formatRelativeTime(job.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/jobs/${job.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
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
