"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RequireAuth } from "@/components/providers/require-auth";
import { adminListProposals } from "@/lib/supabase-admin";

interface Proposal {
  id: string;
  title: string;
  type: "Parameter Change" | "Contract Upgrade" | "Budget";
  status: "pending" | "active" | "passed" | "rejected";
  votes_for: number;
  votes_against: number;
  created_at: string;
  deadline: string;
}

function formatRelativeTime(timestamp: string | number): string {
  const ts = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp;
  const diff = ts - Date.now();
  if (diff < 0) return "Ended";
  if (diff < 60000) return "Ending soon";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m left`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h left`;
  return `${Math.floor(diff / 86400000)}d left`;
}

function formatDate(timestamp: string | number): string {
  const ts = typeof timestamp === "string" ? timestamp : new Date(timestamp).toISOString();
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
    icon: Clock,
  },
  active: {
    label: "Active",
    color: "bg-indicator-active/10 text-indicator-active border-indicator-active/30",
    icon: AlertTriangle,
  },
  passed: {
    label: "Passed",
    color: "bg-indicator-active/10 text-indicator-active border-indicator-active/30",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "bg-indicator-slashed/10 text-indicator-slashed border-indicator-slashed/30",
    icon: XCircle,
  },
};

const typeColors = {
  "Parameter Change": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  "Contract Upgrade": "bg-purple-500/10 text-purple-400 border-purple-500/30",
  "Budget": "bg-amber-500/10 text-amber-400 border-amber-500/30",
};

export default function AdminGovernancePage() {
  return (
    <RequireAuth requiredRole="admin">
      <AdminGovernanceContent />
    </RequireAuth>
  );
}

function AdminGovernanceContent() {
  const [proposals, setProposals] = React.useState<Proposal[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    adminListProposals()
      .then(setProposals)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-indicator-slashed">Failed to load proposals: {error}</p>
      </div>
    );
  }

  if (!proposals) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="h-8 w-48 bg-bg-surface rounded animate-pulse" />
            <div className="h-4 w-64 bg-bg-surface rounded animate-pulse mt-1" />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-bg-surface rounded animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-bg-surface rounded animate-pulse" />
      </div>
    );
  }

  const activeCount = proposals.filter((p) => p.status === "active").length;
  const totalVotes = proposals.reduce((sum, p) => sum + p.votes_for + p.votes_against, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Governance
          </h1>
          <p className="text-sm text-foreground-muted">
            On-chain governance proposals and voting — {proposals.length} proposals
          </p>
        </div>
        <Link href="/admin/governance/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Proposal
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data">{proposals.length}</div>
            <div className="text-xs text-foreground-muted">Total Proposals</div>
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
            <div className="text-2xl font-semibold font-mono-data text-indicator-active">
              {proposals.filter((p) => p.status === "passed").length}
            </div>
            <div className="text-xs text-foreground-muted">Passed</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data">
              {totalVotes.toLocaleString()}
            </div>
            <div className="text-xs text-foreground-muted">Total Votes (ETH)</div>
          </CardContent>
        </Card>
      </div>

      {/* Proposals Table */}
      <Card className="bg-bg-surface/80">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Proposal
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Votes For
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Votes Against
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {proposals.map((proposal) => {
                  const StatusIcon = statusConfig[proposal.status].icon;
                  const totalVotes = proposal.votes_for + proposal.votes_against;
                  const forPercent = totalVotes > 0 ? (proposal.votes_for / totalVotes) * 100 : 50;
                  return (
                    <tr key={proposal.id} className="hover:bg-bg-base/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-foreground-muted" />
                          <span className="text-sm text-foreground max-w-xs truncate">
                            {proposal.title}
                          </span>
                        </div>
                        <div className="text-[10px] text-foreground-muted font-mono-data mt-0.5">
                          {proposal.id}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn("text-xs", typeColors[proposal.type])}>
                          {proposal.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", statusConfig[proposal.status].color)}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[proposal.status].label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-mono-data text-indicator-active">
                            <ThumbsUp className="h-3 w-3 inline mr-1" />
                            {proposal.votes_for.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-foreground-muted">
                            ETH
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-mono-data text-indicator-slashed">
                            <ThumbsDown className="h-3 w-3 inline mr-1" />
                            {proposal.votes_against.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-foreground-muted">
                            ETH
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground-muted">
                          {formatDate(proposal.created_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "text-xs",
                          proposal.status === "active" ? "text-indicator-active" : "text-foreground-muted"
                        )}>
                          {formatRelativeTime(proposal.deadline)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/governance/${proposal.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <FileText className="h-4 w-4" />
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
