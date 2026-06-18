"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FileText,
  ChevronLeft,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RequireAuth } from "@/components/providers/require-auth";

type ProposalStatus = "pending" | "active" | "passed" | "rejected";

function generateMockProposalDetail(id: string) {
  return {
    id,
    title: "Increase slash percentage from 5% to 10%",
    description: "This proposal seeks to increase the slash percentage for SLA breaches from the current 5% to 10%. This change is intended to improve network reliability by creating stronger incentives for nodes to maintain their SLA commitments. Analysis of recent slash events shows that the current 5% penalty is insufficient to deter repeated SLA violations, particularly among lower-stake nodes. By doubling the penalty, we expect to see a significant reduction in missed heartbeats and improved overall network uptime.",
    type: "Parameter Change" as const,
    status: "active" as ProposalStatus,
    parameterToChange: "slashPercentage",
    currentValue: "5",
    newValue: "10",
    votesFor: 1250,
    votesAgainst: 340,
    quorum: 2000,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    deadline: Date.now() + 5 * 24 * 60 * 60 * 1000,
    proposer: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    txHash: "0xabc123...def456",
  };
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(timestamp: number): string {
  const diff = timestamp - Date.now();
  if (diff < 0) return "Ended";
  if (diff < 60000) return "Ending soon";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m left`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h left`;
  return `${Math.floor(diff / 86400000)}d left`;
}

const statusConfig: Record<ProposalStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-zinc-500/10 text-zinc-400", icon: Clock },
  active: { label: "Active", color: "bg-indicator-active/10 text-indicator-active", icon: AlertTriangle },
  passed: { label: "Passed", color: "bg-indicator-active/10 text-indicator-active", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-indicator-slashed/10 text-indicator-slashed", icon: XCircle },
};

export default function AdminProposalDetailPage() {
  const params = useParams();
  const proposalId = params.id as string;

  return (
    <RequireAuth requiredRole="admin">
      <AdminProposalDetailContent proposalId={proposalId} />
    </RequireAuth>
  );
}

interface AdminProposalDetailContentProps {
  proposalId: string;
}

function AdminProposalDetailContent({ proposalId }: AdminProposalDetailContentProps) {
  const proposal = generateMockProposalDetail(proposalId);
  const [isVoting, setIsVoting] = React.useState(false);

  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const forPercent = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
  const againstPercent = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
  const quorumPercent = (totalVotes / proposal.quorum) * 100;
  const StatusIcon = statusConfig[proposal.status].icon;

  const handleVote = async (support: boolean) => {
    setIsVoting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsVoting(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/admin/governance">
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-1">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {proposal.id}
              </h1>
              <Badge className={statusConfig[proposal.status].color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig[proposal.status].label}
              </Badge>
            </div>
            <p className="text-sm text-foreground-muted max-w-2xl line-clamp-1">
              {proposal.title}
            </p>
          </div>
        </div>
        {proposal.status === "active" && (
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <ThumbsDown className="h-4 w-4" />
              Vote Against
            </Button>
            <Button className="gap-2">
              <ThumbsUp className="h-4 w-4" />
              Vote For
            </Button>
          </div>
        )}
      </div>

      {/* Proposal Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-bg-surface/80 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-foreground-muted" />
              {proposal.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground-muted leading-relaxed">
              {proposal.description}
            </p>

            <div className="grid gap-3 md:grid-cols-3 pt-2">
              <div className="p-3 bg-bg-base rounded-lg">
                <div className="text-xs text-foreground-muted mb-1">Type</div>
                <div className="text-sm font-medium">{proposal.type}</div>
              </div>
              <div className="p-3 bg-bg-base rounded-lg">
                <div className="text-xs text-foreground-muted mb-1">Parameter</div>
                <div className="text-sm font-mono-data">{proposal.parameterToChange}</div>
              </div>
              <div className="p-3 bg-bg-base rounded-lg">
                <div className="text-xs text-foreground-muted mb-1">Change</div>
                <div className="text-sm font-mono-data">
                  <span className="text-indicator-slashed">{proposal.currentValue}</span>
                  {" -> "}
                  <span className="text-indicator-active">{proposal.newValue}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Vote Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress bars */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-indicator-active">
                  <ThumbsUp className="h-3 w-3 inline mr-1" />
                  For
                </span>
                <span className="font-mono-data text-indicator-active">
                  {proposal.votesFor.toLocaleString()} ETH
                </span>
              </div>
              <div className="h-2 bg-indicator-slashed/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indicator-active transition-all"
                  style={{ width: `${forPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-indicator-slashed">
                  <ThumbsDown className="h-3 w-3 inline mr-1" />
                  Against
                </span>
                <span className="font-mono-data text-indicator-slashed">
                  {proposal.votesAgainst.toLocaleString()} ETH
                </span>
              </div>
              <div className="h-2 bg-indicator-active/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indicator-slashed transition-all"
                  style={{ width: `${againstPercent}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-hairline">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground-muted">Quorum Progress</span>
                <span className="font-mono-data text-foreground">
                  {quorumPercent.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-bg-base rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all",
                    quorumPercent >= 100 ? "bg-indicator-active" : "bg-indicator-stale"
                  )}
                  style={{ width: `${Math.min(quorumPercent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-foreground-muted mt-1">
                Required: {proposal.quorum.toLocaleString()} ETH
              </p>
            </div>

            <div className="pt-2 border-t border-hairline space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Created</span>
                <span className="text-foreground">{formatDate(proposal.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Deadline</span>
                <span className="text-indicator-active">
                  {formatRelativeTime(proposal.deadline)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Proposer</span>
                <span className="font-mono-data text-xs">
                  {proposal.proposer.slice(0, 8)}...{proposal.proposer.slice(-6)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execution Panel (shown when passed) */}
      {proposal.status === "passed" && (
        <Card className="bg-indicator-active/10 border-indicator-active/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-indicator-active" />
                <div>
                  <div className="text-sm font-medium text-indicator-active">
                    Proposal Passed
                  </div>
                  <p className="text-xs text-foreground-muted">
                    This proposal can now be executed on-chain
                  </p>
                </div>
              </div>
              <Button className="gap-2">
                <Play className="h-4 w-4" />
                Execute Proposal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* On-Chain Reference */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">On-Chain Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-bg-base rounded-lg border border-hairline">
            <div className="space-y-2 font-mono-data text-xs">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Governor Contract:</span>
                <span className="text-indicator-active">GovernorAlpha.sol</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Proposal ID:</span>
                <span className="text-foreground">{proposal.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Transaction:</span>
                <span className="text-indicator-active">{proposal.txHash}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Target Contract:</span>
                <span className="text-foreground">SlashManager.sol</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
