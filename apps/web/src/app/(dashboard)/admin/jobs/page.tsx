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
import { adminListJobs } from "@/lib/supabase-admin";

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
  const [jobs, setJobs] = React.useState<any[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    adminListJobs().then((data) => {
      setJobs(data);
    }).catch((e) => {
      setError(e.message);
    });
  }, []);

  const filteredJobs = (jobs || []).filter((job: any) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !job.id.toLowerCase().includes(query) &&
        !(job.user_id || "").toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    return true;
  });

  const activeCount = (jobs || []).filter((j: any) => j.status === "running" || j.status === "pending").length;
  const totalValue = (jobs || []).reduce((sum: number, j: any) => sum + (j.budget_usd || 0), 0);

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="bg-bg-surface/80 p-8 text-center">
          <p className="text-indicator-slashed">Error loading jobs: {error}</p>
        </Card>
      </div>
    );
  }

  if (jobs === null) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">All Jobs</h1>
            <p className="text-sm text-foreground-muted">Loading...</p>
          </div>
        </div>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse text-foreground-muted">Loading jobs...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                {filteredJobs.map((job: any) => (
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
                          {(job.user_id || "").slice(0, 8)}...{(job.user_id || "").slice(-6)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-mono-data">{job.node_id ? 1 : 0}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono-data text-indicator-active">
                        {(job.budget_usd || 0).toFixed(2)} USD
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-mono-data">{job.sla_uptime_required || 95}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground-muted">
                        {formatRelativeTime(job.created_at ? new Date(job.created_at).getTime() : Date.now())}
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
