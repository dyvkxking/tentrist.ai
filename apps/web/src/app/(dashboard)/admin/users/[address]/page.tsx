"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  User,
  ChevronLeft,
  Server,
  Briefcase,
  DollarSign,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ReputationBadge } from "@/components/ui/ReputationBadge";
import { RequireAuth } from "@/components/providers/require-auth";

interface UserJob {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  value: number;
  nodes: number;
  createdAt: number;
}

interface UserNode {
  id: string;
  gpu: string;
  region: string;
  status: "online" | "offline" | "stale" | "slashed";
  reputation: number;
  stake: number;
  lastHeartbeat: number;
}

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "payment" | "slash" | "reward";
  amount: number;
  timestamp: number;
  jobId?: string;
  nodeId?: string;
}

function generateMockUserDetail(address: string) {
  const isProvider = address.includes("862964") || address.includes("fedc09") || address.includes("abcd12");

  return {
    address,
    type: isProvider ? "provider" as const : "client" as const,
    status: "active" as const,
    joinedAt: Date.now() - 150 * 24 * 60 * 60 * 1000,
    jobs: isProvider ? [] : [
      { id: "job_a1b2c3d4", status: "running" as const, value: 2.5, nodes: 4, createdAt: Date.now() - 3600000 },
      { id: "job_e5f6g7h8", status: "completed" as const, value: 1.2, nodes: 2, createdAt: Date.now() - 86400000 },
      { id: "job_i9j0k1l2", status: "failed" as const, value: 3.8, nodes: 3, createdAt: Date.now() - 172800000 },
    ] as UserJob[],
    nodes: isProvider ? [
      { id: "node_001", gpu: "NVIDIA A100 80GB", region: "us-east-1", status: "online" as const, reputation: 156, stake: 10.5, lastHeartbeat: Date.now() - 15000 },
      { id: "node_002", gpu: "NVIDIA H100 80GB", region: "eu-west-1", status: "online" as const, reputation: 89, stake: 8.2, lastHeartbeat: Date.now() - 28000 },
    ] as UserNode[] : [],
    transactions: [
      { id: "tx_001", type: "deposit", amount: 10, timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000 },
      { id: "tx_002", type: "payment", amount: -2.5, timestamp: Date.now() - 3600000, jobId: "job_a1b2c3d4" },
      { id: "tx_003", type: "payment", amount: -1.2, timestamp: Date.now() - 86400000, jobId: "job_e5f6g7h8" },
      { id: "tx_004", type: "withdrawal", amount: -5, timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000 },
    ] as Transaction[],
    totalSpend: isProvider ? 0 : 284.5,
    totalEarned: isProvider ? 156.8 : 0,
    accountNotes: "",
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
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

const txTypeConfig = {
  deposit: { color: "text-indicator-active", icon: DollarSign, label: "Deposit" },
  withdrawal: { color: "text-foreground-muted", icon: DollarSign, label: "Withdrawal" },
  payment: { color: "text-indicator-stale", icon: Briefcase, label: "Payment" },
  slash: { color: "text-indicator-slashed", icon: AlertTriangle, label: "Slash" },
  reward: { color: "text-indicator-active", icon: CheckCircle2, label: "Reward" },
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const address = params.address as string;

  return (
    <RequireAuth requiredRole="admin">
      <AdminUserDetailContent address={address} />
    </RequireAuth>
  );
}

interface AdminUserDetailContentProps {
  address: string;
}

function AdminUserDetailContent({ address }: AdminUserDetailContentProps) {
  const user = generateMockUserDetail(address);
  const [accountNotes, setAccountNotes] = React.useState(user.accountNotes);

  const balance = user.transactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-1">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {user.type === "client" ? "Client" : "Provider"} Wallet
              </h1>
              <Badge
                variant={user.status === "active" ? "success" : "danger"}
              >
                {user.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-foreground-muted" />
              <span className="text-xs font-mono-data text-foreground-muted">
                {user.address}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {user.status === "active" ? (
            <Button variant="outline" className="gap-2">
              <XCircle className="h-4 w-4" />
              Suspend
            </Button>
          ) : (
            <Button variant="outline" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Activate
            </Button>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-xs text-foreground-muted mb-1">Balance</div>
            <div className="text-lg font-semibold font-mono-data text-foreground">
              {balance.toFixed(2)} ETH
            </div>
          </CardContent>
        </Card>
        {user.type === "client" ? (
          <>
            <Card className="bg-bg-surface/80">
              <CardContent className="p-4">
                <div className="text-xs text-foreground-muted mb-1">Jobs Submitted</div>
                <div className="text-lg font-semibold font-mono-data">{user.jobs.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-bg-surface/80">
              <CardContent className="p-4">
                <div className="text-xs text-foreground-muted mb-1">Total Spend</div>
                <div className="text-lg font-semibold font-mono-data text-indicator-stale">
                  {user.totalSpend.toFixed(1)} ETH
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="bg-bg-surface/80">
              <CardContent className="p-4">
                <div className="text-xs text-foreground-muted mb-1">Nodes Registered</div>
                <div className="text-lg font-semibold font-mono-data text-blue-400">{user.nodes.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-bg-surface/80">
              <CardContent className="p-4">
                <div className="text-xs text-foreground-muted mb-1">Total Earned</div>
                <div className="text-lg font-semibold font-mono-data text-indicator-active">
                  {user.totalEarned.toFixed(1)} ETH
                </div>
              </CardContent>
            </Card>
          </>
        )}
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-xs text-foreground-muted mb-1">Joined</div>
            <div className="text-sm font-medium text-foreground">
              {formatDate(user.joinedAt)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Table (for clients) */}
      {user.type === "client" && user.jobs.length > 0 && (
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-foreground-muted" />
              Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline">
                    <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Job ID
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
                    <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {user.jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-bg-base/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/admin/jobs/${job.id}`}>
                          <span className="text-xs font-mono-data text-indicator-active hover:underline cursor-pointer">
                            {job.id}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={job.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-mono-data">{job.nodes}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-mono-data text-indicator-stale">
                          {job.value.toFixed(2)} ETH
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground-muted">
                          {formatRelativeTime(job.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nodes Table (for providers) */}
      {user.type === "provider" && user.nodes.length > 0 && (
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4 text-foreground-muted" />
              Nodes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline">
                    <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Node ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      GPU
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Region
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Reputation
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Stake
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {user.nodes.map((node) => (
                    <tr key={node.id} className="hover:bg-bg-base/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/admin/nodes/${node.id}`}>
                          <span className="text-xs font-mono-data text-indicator-active hover:underline cursor-pointer">
                            {node.id}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground">{node.gpu}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground-muted">{node.region}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={node.status} size="sm" showPulse />
                      </td>
                      <td className="px-4 py-3">
                        <ReputationBadge score={node.reputation} showScore size="sm" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-mono-data">{node.stake.toFixed(1)} ETH</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-foreground-muted" />
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-hairline">
            {user.transactions.map((tx) => {
              const TxIcon = txTypeConfig[tx.type].icon;
              const TxColor = txTypeConfig[tx.type].color;
              return (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-bg-base/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-1.5 bg-bg-base rounded", TxColor)}>
                      <TxIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm text-foreground">
                        {txTypeConfig[tx.type].label}
                        {tx.jobId && (
                          <Link href={`/admin/jobs/${tx.jobId}`}>
                            <span className="ml-2 text-indicator-active hover:underline cursor-pointer">
                              {tx.jobId}
                            </span>
                          </Link>
                        )}
                        {tx.nodeId && (
                          <Link href={`/admin/nodes/${tx.nodeId}`}>
                            <span className="ml-2 text-indicator-active hover:underline cursor-pointer">
                              {tx.nodeId}
                            </span>
                          </Link>
                        )}
                      </div>
                      <div className="text-xs text-foreground-muted">
                        {formatDate(tx.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "text-sm font-mono-data",
                    tx.amount >= 0 ? "text-indicator-active" : "text-indicator-stale"
                  )}>
                    {tx.amount >= 0 ? "+" : ""}{tx.amount.toFixed(2)} ETH
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Admin Notes */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-foreground-muted" />
            Account Notes
          </CardTitle>
          <CardDescription>Internal notes for this account (not visible to user)</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={accountNotes}
            onChange={(e) => setAccountNotes(e.target.value)}
            placeholder="Add internal notes about this account..."
            className={cn(
              "w-full h-24 rounded-md border bg-bg-base px-3 py-2 text-sm",
              "border-border-hairline focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-indicator-active/50"
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
