"use client";

import * as React from "react";
import {
  Wallet,
  Shield,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  DollarSign,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/MetricCard";
import { ConnectButton } from "@/components/providers/web3-providers";
import { useAccount } from "wagmi";
import { StakeModal, UnstakeModal } from "@/components/wallet/stake-modals";

// Types
interface Transaction {
  id: string;
  type: "stake_added" | "stake_removed" | "job_payment" | "slashing" | "reward";
  amount: number;
  timestamp: number;
  status: "confirmed" | "pending" | "failed";
  hash: string;
  description: string;
}

interface EscrowPosition {
  id: string;
  nodeId: string;
  amount: number;
  startDate: number;
  status: "active" | "draining" | "released";
}

// Mock data generators
function generateTransactions(count: number = 20): Transaction[] {
  const types: Transaction["type"][] = [
    "stake_added",
    "stake_removed",
    "job_payment",
    "slashing",
    "reward",
  ];
  const descriptions: Record<Transaction["type"], string> = {
    stake_added: "Stake added to escrow",
    stake_removed: "Stake released after cooldown",
    job_payment: "Payment for job execution",
    slashing: "SLA breach penalty",
    reward: "Job completion reward",
  };

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const amount =
      type === "slashing"
        ? -(Math.random() * 0.5 + 0.1)
        : type === "job_payment" || type === "reward"
        ? Math.random() * 0.3
        : type === "stake_added"
        ? Math.random() * 5 + 1
        : Math.random() * 2 + 0.5;

    return {
      id: `tx_${i.toString().padStart(4, "0")}`,
      type,
      amount: parseFloat(amount.toFixed(4)),
      timestamp: Date.now() - i * 3600000 * Math.random() * 12,
      status: Math.random() > 0.1 ? "confirmed" : Math.random() > 0.5 ? "pending" : "failed",
      hash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      description: descriptions[type],
    };
  });
}

function generateEscrowPositions(): EscrowPosition[] {
  return [
    {
      id: "escrow_001",
      nodeId: "node_0042",
      amount: 25.0,
      startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
      status: "active",
    },
    {
      id: "escrow_002",
      nodeId: "node_0087",
      amount: 15.0,
      startDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
      status: "active",
    },
  ];
}

// Format relative time
function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Format date
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Transaction icon
function TransactionIcon({ type }: { type: Transaction["type"] }) {
  switch (type) {
    case "stake_added":
      return <ArrowDownRight className="h-4 w-4 text-indicator-active" />;
    case "stake_removed":
      return <ArrowUpRight className="h-4 w-4 text-indicator-stale" />;
    case "job_payment":
      return <DollarSign className="h-4 w-4 text-blue-400" />;
    case "slashing":
      return <XCircle className="h-4 w-4 text-indicator-slashed" />;
    case "reward":
      return <CheckCircle2 className="h-4 w-4 text-indicator-active" />;
  }
}

// Transaction row
function TransactionRow({ tx }: { tx: Transaction }) {
  const isNegative = tx.amount < 0;

  return (
    <tr className="hover:bg-bg-base/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <TransactionIcon type={tx.type} />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-mono-data text-foreground">
              {tx.description}
            </span>
            <span className="text-[10px] text-foreground-muted font-mono-data">
              {tx.hash}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-foreground-muted">
          {formatRelativeTime(tx.timestamp)}
        </span>
      </td>
      <td className="px-4 py-3">
        <Badge
          variant={
            tx.status === "confirmed"
              ? "success"
              : tx.status === "pending"
              ? "warning"
              : "danger"
          }
          className="text-xs"
        >
          {tx.status}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right">
        <span
          className={cn(
            "text-sm font-mono-data",
            isNegative ? "text-indicator-slashed" : "text-indicator-active"
          )}
        >
          {isNegative ? "" : "+"}
          {tx.amount.toFixed(4)} ETH
        </span>
      </td>
    </tr>
  );
}

// Escrow position card
function EscrowPositionCard({ position }: { position: EscrowPosition }) {
  return (
    <div className="p-4 bg-bg-base/50 rounded-lg border border-hairline">
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-mono-data text-foreground">
            {position.nodeId}
          </span>
          <span className="text-xs text-foreground-muted">
            Since {formatDate(position.startDate)}
          </span>
        </div>
        <Badge
          variant={position.status === "active" ? "success" : "warning"}
          className="text-xs"
        >
          {position.status}
        </Badge>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className="text-xs text-foreground-muted">Escrowed</span>
          <div className="text-xl font-mono-data text-indicator-active">
            {position.amount.toFixed(3)} ETH
          </div>
        </div>
        <div className="flex gap-1">
          <button className="p-1.5 rounded hover:bg-bg-surface transition-colors">
            <ExternalLink className="h-3.5 w-3.5 text-foreground-muted" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Connected wallet view
function ConnectedWalletView() {
  const { address, isConnected } = useAccount();
  const [stakeModalOpen, setStakeModalOpen] = React.useState(false);
  const [unstakeModalOpen, setUnstakeModalOpen] = React.useState(false);

  // Mock data
  const transactions = React.useMemo(() => generateTransactions(20), []);
  const escrowPositions = React.useMemo(() => generateEscrowPositions(), []);

  // Mock values
  const totalStaked = escrowPositions.reduce((sum, p) => sum + p.amount, 0);
  const totalBalance = 12.5847;
  const pendingUnstake = 0;
  const last30DaysReward = 2.341;

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Wallet
          </h1>
          <p className="text-sm text-foreground-muted">
            Manage your stakes and view transaction history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono-data">
            <span className="w-2 h-2 rounded-full bg-indicator-active mr-2" />
            Connected
          </Badge>
        </div>
      </header>

      {/* Connected Address */}
      <Card className="bg-bg-surface/80">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indicator-active/10 rounded-lg">
                <Wallet className="h-5 w-5 text-indicator-active" />
              </div>
              <div>
                <div className="text-xs text-foreground-muted mb-0.5">
                  Connected Wallet
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono-data text-foreground">
                    {truncatedAddress}
                  </span>
                  <button
                    className="p-1 hover:bg-bg-base rounded transition-colors"
                    onClick={() => navigator.clipboard.writeText(address || "")}
                  >
                    <Copy className="h-3 w-3 text-foreground-muted" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`https://etherscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md font-medium border bg-transparent text-foreground border-border-hairline hover:bg-bg-surface hover:border-zinc-700 h-8 px-3 text-xs gap-1.5 transition-all"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View on Etherscan
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Metrics Row */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Balance"
          value={`${totalBalance.toFixed(4)} ETH`}
          trend="up"
          trendValue="+$0.234"
          glowColor="active"
          className="bg-bg-surface/80"
        />
        <MetricCard
          label="Total Staked"
          value={`${totalStaked.toFixed(3)} ETH`}
          trend="neutral"
          trendValue="across 2 positions"
          glowColor="none"
          className="bg-bg-surface/80"
        />
        <MetricCard
          label="Pending Unstake"
          value={`${pendingUnstake.toFixed(3)} ETH`}
          trend="neutral"
          trendValue="no active cooldown"
          glowColor="stale"
          className="bg-bg-surface/80"
        />
        <MetricCard
          label="Last 30d Rewards"
          value={`+${last30DaysReward.toFixed(3)} ETH`}
          trend="up"
          trendValue="+18.2%"
          glowColor="active"
          className="bg-bg-surface/80"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          className="flex-1"
          onClick={() => setStakeModalOpen(true)}
        >
          <ArrowDownRight className="h-4 w-4 mr-2" />
          Add Stake
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setUnstakeModalOpen(true)}
        >
          <ArrowUpRight className="h-4 w-4 mr-2" />
          Initiate Unstake
        </Button>
      </div>

      {/* Escrow Positions */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-indicator-active" />
            Active Escrow Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {escrowPositions.map((position) => (
              <EscrowPositionCard key={position.id} position={position} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-indicator-stale" />
              Transaction History
            </CardTitle>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Time
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {transactions.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <StakeModal
        open={stakeModalOpen}
        onClose={() => setStakeModalOpen(false)}
        currentStake={totalStaked}
        maxStake={100}
      />
      <UnstakeModal
        open={unstakeModalOpen}
        onClose={() => setUnstakeModalOpen(false)}
        currentStake={totalStaked}
      />
    </div>
  );
}

// Disconnected wallet view
function DisconnectedWalletView() {
  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Wallet
          </h1>
          <p className="text-sm text-foreground-muted">
            Connect your wallet to manage stakes and view transactions
          </p>
        </div>
      </header>

      {/* Connect Card */}
      <Card className="bg-bg-surface/80">
        <CardContent className="py-16">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-indicator-active/10 rounded-full mb-4">
              <Wallet className="h-12 w-12 text-indicator-active" />
            </div>
            <h2 className="text-lg font-semibold mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-sm text-foreground-muted mb-6 max-w-sm">
              Connect your Ethereum wallet to manage your stakes in the Tentrist
              GPU network and track your transaction history.
            </p>
            <ConnectButton />
            <p className="text-xs text-foreground-muted mt-4">
              By connecting, you agree to the{" "}
              <button className="text-indicator-active hover:underline">
                Terms of Service
              </button>{" "}
              and acknowledge the risks of staking cryptocurrency.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function WalletPage() {
  const { isConnected } = useAccount();

  return isConnected ? (
    <ConnectedWalletView />
  ) : (
    <DisconnectedWalletView />
  );
}
