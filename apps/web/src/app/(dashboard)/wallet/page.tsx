"use client";

import React, { useState, useMemo } from "react";
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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/MetricCard";
import { ConnectButton } from "@/components/providers/web3-providers";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { ESCROW_ABI, CONTRACT_ADDRESSES } from "@/lib/contracts";
import { useWalletTransactions, useEscrowPositions } from "@/hooks/use-wallet";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  type: "stake_added" | "stake_removed" | "job_payment" | "slashing" | "reward";
  amount_usd: number;
  timestamp: number;
  status: "confirmed" | "pending" | "failed";
  hash: string;
  description: string;
}

const TX_DESCRIPTIONS: Record<Transaction["type"], string> = {
  stake_added:   "Stake added to escrow",
  stake_removed: "Stake released after cooldown",
  job_payment:   "Payment for job execution",
  slashing:      "SLA breach penalty",
  reward:        "Job completion reward",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function txIcon(type: Transaction["type"]) {
  switch (type) {
    case "stake_added":   return <ArrowDownRight className="h-4 w-4 text-indicator-active" />;
    case "stake_removed": return <ArrowUpRight  className="h-4 w-4 text-indicator-stale" />;
    case "job_payment":   return <DollarSign    className="h-4 w-4 text-blue-400" />;
    case "slashing":      return <XCircle       className="h-4 w-4 text-indicator-slashed" />;
    case "reward":        return <CheckCircle2  className="h-4 w-4 text-indicator-active" />;
  }
}

// ─── Stake Modal ──────────────────────────────────────────────────────────────

function StakeModal({
  open,
  onClose,
  currentStakeEth,
  balanceEth,
}: {
  open: boolean;
  onClose: () => void;
  currentStakeEth: string;
  balanceEth: string;
}) {
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { writeContract, isPending: isSigning, error: writeError } = useWriteContract({
    mutation: {
      onSuccess: (hash) => { setTxHash(hash); },
    },
  });
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const p = (v: string) => parseFloat(v) || 0;
  const pAmount = p(amount);
  const pCurrent = p(currentStakeEth);
  const pBalance = p(balanceEth);
  const newStake = pCurrent + pAmount;
  const MIN_STAKE = 10;

  const errMsg =
    !amount ? "" :
    pAmount <= 0 ? "Enter a valid amount greater than 0" :
    pAmount > pBalance ? "Insufficient wallet balance" :
    newStake < MIN_STAKE && newStake > pCurrent ? `Minimum stake of ${MIN_STAKE} ETH required` : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || pAmount <= 0 || !!errMsg) return;
    writeContract({
      address: CONTRACT_ADDRESSES.Escrow,
      abi: ESCROW_ABI,
      functionName: "stake",
      value: parseEther(amount),
    });
  };

  const handleClose = () => {
    setAmount(""); setTxHash(undefined); onClose();
  };

  if (!open) return null;

  if (isConfirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative z-10 w-full max-w-md mx-4">
          <Card className="bg-bg-surface border-hairline">
            <CardContent className="py-8 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-indicator-active" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Stake Submitted</h3>
              <p className="text-foreground-muted mb-2">
                <span className="font-mono-data text-indicator-active">{pAmount.toFixed(4)} ETH</span> staked successfully.
              </p>
              {txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indicator-active hover:underline mb-6"
                >
                  View on Etherscan <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <Button onClick={handleClose} className="w-full">Done</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md mx-4">
        <Card className="bg-bg-surface border-hairline">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-indicator-active" />
                Add to Stake
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-bg-base rounded-lg space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Current Stake</span>
                  <span className="font-mono-data">{pCurrent.toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Wallet Balance</span>
                  <span className="font-mono-data">{pBalance.toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Min Required</span>
                  <span className="font-mono-data">{MIN_STAKE.toFixed(4)} ETH</span>
                </div>
              </div>

              <input
                type="number"
                placeholder="0.0000 ETH"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-bg-base border border-hairline rounded-md text-sm font-mono-data text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-indicator-active"
              />
              {errMsg && <p className="text-xs text-indicator-slashed">{errMsg}</p>}

              <div className="flex gap-2">
                {[1, 5, 10].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(String(v))}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-mono-data rounded border transition-colors",
                      pAmount === v
                        ? "border-indicator-active bg-indicator-active/10 text-indicator-active"
                        : "border-hairline text-foreground-muted hover:border-zinc-600"
                    )}
                  >
                    +{v} ETH
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAmount(pBalance.toFixed(4))}
                  className="flex-1 py-1.5 text-xs font-mono-data rounded border border-hairline text-foreground-muted hover:border-zinc-600"
                >
                  MAX
                </button>
              </div>

              {pAmount > 0 && (
                <div className="p-3 bg-indicator-active/5 border border-indicator-active/20 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">New Total Stake</span>
                    <span className="font-mono-data text-indicator-active font-medium">
                      {newStake.toFixed(4)} ETH
                    </span>
                  </div>
                </div>
              )}

              {writeError && (
                <div className="flex items-start gap-2 p-3 bg-indicator-slashed/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-indicator-slashed shrink-0 mt-0.5" />
                  <span className="text-xs text-indicator-slashed">{String(writeError?.message || "Transaction failed")}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!amount || !!errMsg || isSigning || isConfirming}
                >
                  {isSigning || isConfirming ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />{isConfirming ? "Confirming..." : "Sign..."}</>
                  ) : (
                    <><Shield className="h-4 w-4 mr-2" />Confirm Stake</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Unstake Modal ────────────────────────────────────────────────────────────

function UnstakeModal({
  open,
  onClose,
  currentStakeEth,
}: {
  open: boolean;
  onClose: () => void;
  currentStakeEth: string;
}) {
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [ack, setAck] = useState(false);

  const { writeContract, isPending: isSigning, error: writeError } = useWriteContract({
    mutation: {
      onSuccess: (hash) => { setTxHash(hash); },
    },
  });
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const p = (v: string) => parseFloat(v) || 0;
  const pAmount = p(amount);
  const pCurrent = p(currentStakeEth);
  const remaining = pCurrent - pAmount;
  const MIN_KEEP = 10;

  const errMsg =
    !amount ? "" :
    pAmount <= 0 ? "Enter a valid amount greater than 0" :
    pAmount > pCurrent ? "Cannot exceed current stake" :
    remaining < MIN_KEEP && remaining >= 0 ? `Must keep at least ${MIN_KEEP} ETH staked` : "";

  const canSubmit = !!amount && pAmount > 0 && pAmount <= pCurrent && remaining >= MIN_KEEP && ack && !isSigning && !isConfirming;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    writeContract({
      address: CONTRACT_ADDRESSES.Escrow,
      abi: ESCROW_ABI,
      functionName: "withdraw",
      args: [parseEther(amount)],
    });
  };

  const handleClose = () => {
    setAmount(""); setTxHash(undefined); setAck(false); onClose();
  };

  if (!open) return null;

  if (isConfirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative z-10 w-full max-w-md mx-4">
          <Card className="bg-bg-surface border-hairline">
            <CardContent className="py-8 text-center">
              <div className="flex justify-center mb-4">
                <Clock className="h-16 w-16 text-indicator-stale" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Unstaking Initiated</h3>
              <p className="text-foreground-muted mb-4">
                <span className="font-mono-data text-indicator-stale">{pAmount.toFixed(4)} ETH</span> unstaking started.
              </p>
              <div className="p-3 bg-bg-base rounded-lg mb-6 text-left text-xs text-foreground-muted space-y-1">
                <div className="flex items-center gap-2 text-indicator-stale font-medium mb-2">
                  <Clock className="h-4 w-4" />Cooldown: 30 Days
                </div>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Stake remains locked during cooldown</li>
                  <li>Node marked as draining</li>
                  <li>New job assignments suspended</li>
                  <li>Funds released after cooldown</li>
                </ul>
              </div>
              {txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indicator-active hover:underline mb-6"
                >
                  View on Etherscan <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <Button onClick={handleClose} className="w-full">Done</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-md mx-4">
        <Card className="bg-bg-surface border-hairline">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-indicator-stale" />
                Initiate Unstaking
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-bg-base rounded-lg space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Current Stake</span>
                  <span className="font-mono-data">{pCurrent.toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Minimum Required</span>
                  <span className="font-mono-data">{MIN_KEEP.toFixed(4)} ETH</span>
                </div>
              </div>

              <input
                type="number"
                placeholder="0.0000 ETH"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-bg-base border border-hairline rounded-md text-sm font-mono-data text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-indicator-active"
              />
              {errMsg && <p className="text-xs text-indicator-slashed">{errMsg}</p>}

              <div className="flex gap-2">
                {[0.25, 0.5, 0.75].map((f) => {
                  const v = pCurrent * f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setAmount(v.toFixed(4))}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-mono-data rounded border transition-colors",
                        Math.abs(pAmount - v) < 0.0001
                          ? "border-indicator-stale bg-indicator-stale/10 text-indicator-stale"
                          : "border-hairline text-foreground-muted hover:border-zinc-600"
                      )}
                    >
                      {f * 100}%
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setAmount(Math.max(0, pCurrent - MIN_KEEP).toFixed(4))}
                  className="flex-1 py-1.5 text-xs font-mono-data rounded border border-hairline text-foreground-muted hover:border-zinc-600"
                >
                  MIN KEEP
                </button>
              </div>

              {pAmount > 0 && remaining >= 0 && (
                <div className="p-3 bg-indicator-stale/5 border border-indicator-stale/20 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground-muted">Remaining Stake</span>
                    <span className="font-mono-data text-indicator-stale font-medium">{remaining.toFixed(4)} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Will Receive</span>
                    <span className="font-mono-data text-indicator-active">{pAmount.toFixed(4)} ETH</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="unstake-ack"
                  checked={ack}
                  onChange={(e) => setAck(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border-hairline bg-bg-base text-indicator-active"
                />
                <label htmlFor="unstake-ack" className="text-xs text-foreground-muted">
                  I understand unstaking requires a 30-day cooldown. During this time my node
                  will be draining and stake will remain locked.
                </label>
              </div>

              {writeError && (
                <div className="flex items-start gap-2 p-3 bg-indicator-slashed/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-indicator-slashed shrink-0 mt-0.5" />
                  <span className="text-xs text-indicator-slashed">{String(writeError?.message || "Transaction failed")}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
                <Button type="submit" variant="destructive" className="flex-1" disabled={!canSubmit}>
                  {isSigning || isConfirming ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />{isConfirming ? "Confirming..." : "Sign..."}</>
                  ) : (
                    <><Clock className="h-4 w-4 mr-2" />Initiate Unstaking</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Connected Wallet View ────────────────────────────────────────────────────

function ConnectedWalletView() {
  const { address } = useAccount();
  const [stakeOpen, setStakeOpen] = useState(false);
  const [unstakeOpen, setUnstakeOpen] = useState(false);

  // ── On-chain reads ────────────────────────────────────────────────────────

  const { data: balanceData } = useBalance({ address });
  const balanceEth = balanceData ? formatEther(balanceData.value) : "0";

  const { data: myStakeRaw } = useReadContract({
    address: CONTRACT_ADDRESSES.Escrow,
    abi: ESCROW_ABI,
    functionName: "getStake",
    args: [address!],
    query: { enabled: !!address },
  });
  const myStakeEth = myStakeRaw ? formatEther(myStakeRaw) : "0";

  const { data: totalStakedRaw } = useReadContract({
    address: CONTRACT_ADDRESSES.Escrow,
    abi: ESCROW_ABI,
    functionName: "getTotalStaked",
    query: { enabled: true },
  });
  const totalStakedEth = totalStakedRaw ? formatEther(totalStakedRaw) : "0";

  const { data: minStakeRaw } = useReadContract({
    address: CONTRACT_ADDRESSES.Escrow,
    abi: ESCROW_ABI,
    functionName: "getMinStake",
    query: { enabled: true },
  });
  const minStakeEth = minStakeRaw ? formatEther(minStakeRaw) : "0";

  // ── Supabase reads ─────────────────────────────────────────────────────────

  const { data: txns, isLoading: txnsLoading } = useWalletTransactions();
  const { data: escrowPositions } = useEscrowPositions();

  const formattedTxns: Transaction[] = useMemo(() => {
    if (!txns?.length) return [];
    return txns.map((t) => ({
      id: t.id,
      type: t.type as Transaction["type"],
      amount_usd: t.amount_usd,
      timestamp: new Date(t.created_at).getTime(),
      status: "confirmed" as const,
      hash: t.tx_hash || "",
      description: TX_DESCRIPTIONS[t.type as Transaction["type"]] || t.type,
    }));
  }, [txns]);

  // ── Stats ────────────────────────────────────────────────────────────────

  const pStake = parseFloat(myStakeEth) || 0;
  const pBalance = parseFloat(balanceEth) || 0;
  const pTotal = parseFloat(totalStakedEth) || 0;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 3600 * 1000;
  const recentRewards = formattedTxns
    .filter((t) => t.timestamp > thirtyDaysAgo && t.type === "reward")
    .reduce((s, t) => s + t.amount_usd, 0);

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Wallet</h1>
          <p className="text-sm text-foreground-muted">Node provider stake management</p>
        </div>
        <Badge variant="outline" className="font-mono-data">
          <span className="w-2 h-2 rounded-full bg-indicator-active mr-2" />
          Connected
        </Badge>
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
                <div className="text-xs text-foreground-muted mb-0.5">Connected Wallet</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono-data text-foreground">{truncatedAddress}</span>
                  <button
                    className="p-1 hover:bg-bg-base rounded transition-colors"
                    onClick={() => address && navigator.clipboard.writeText(address)}
                  >
                    <Copy className="h-3 w-3 text-foreground-muted" />
                  </button>
                </div>
              </div>
            </div>
            <a
              href={`https://sepolia.etherscan.io/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md font-medium border bg-transparent text-foreground border-border-hairline hover:bg-bg-surface h-8 px-3 text-xs gap-1.5 transition-all"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Etherscan
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Top Metrics */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="ETH Balance"
          value={`${pBalance.toFixed(4)} ETH`}
          trend="neutral"
          trendValue="wallet"
          glowColor="none"
          className="bg-bg-surface/80"
        />
        <MetricCard
          label="My Escrow Stake"
          value={`${pStake.toFixed(4)} ETH`}
          trend="neutral"
          trendValue="in protocol"
          glowColor={pStake > 0 ? "active" : "none"}
          className="bg-bg-surface/80"
        />
        <MetricCard
          label="Protocol Total Stake"
          value={`${pTotal.toFixed(1)} ETH`}
          trend="neutral"
          trendValue="total staked"
          glowColor="none"
          className="bg-bg-surface/80"
        />
        <MetricCard
          label="Last 30d Rewards"
          value={`${recentRewards.toFixed(3)} ETH`}
          trend={recentRewards > 0 ? "up" : "neutral"}
          trendValue="from jobs"
          glowColor={recentRewards > 0 ? "active" : "none"}
          className="bg-bg-surface/80"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button className="flex-1" onClick={() => setStakeOpen(true)}>
          <ArrowDownRight className="h-4 w-4 mr-2" />
          Add Stake
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => setUnstakeOpen(true)}>
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
          {!escrowPositions?.length ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-zinc-800 rounded-lg">
              <div className="text-xs text-foreground-muted mb-1">No escrow positions found</div>
              <div className="text-xs text-foreground-muted">Add stake to register your node in the protocol</div>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {escrowPositions.map((pos) => {
                const amtEth = typeof pos.amount_eth === "string"
                  ? parseFloat(pos.amount_eth)
                  : (pos.amount_eth || 0);
                const status = amtEth > 0 ? "active" : "closed";
                return (
                  <div key={pos.id} className="p-4 bg-bg-base/50 rounded-lg border border-hairline">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-mono-data text-foreground">
                          Node {pos.node_id ? pos.node_id.slice(0, 8) : "—"}
                        </span>
                        <span className="text-xs text-foreground-muted">
                          Since {formatDate(pos.created_at)}
                        </span>
                      </div>
                      <Badge variant={status === "active" ? "success" : "warning"} className="text-xs">
                        {status}
                      </Badge>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-xs text-foreground-muted">Escrowed</span>
                        <div className="text-xl font-mono-data text-indicator-active">
                          {amtEth > 0 ? amtEth.toFixed(3) : pStake.toFixed(3)} ETH
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
          {txnsLoading ? (
            <div className="p-6 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 bg-bg-base/50 rounded animate-pulse" />
              ))}
            </div>
          ) : formattedTxns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-zinc-800 rounded-lg mx-4 mb-4">
              <div className="text-xs text-foreground-muted mb-1">No transactions yet</div>
              <div className="text-xs text-foreground-muted">Your on-chain activity will appear here</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline">
                    <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">Transaction</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">Time</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {formattedTxns.map((tx) => (
                    <tr key={tx.id} className="hover:bg-bg-base/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {txIcon(tx.type)}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-mono-data text-foreground">{tx.description}</span>
                            {tx.hash && (
                              <span className="text-[10px] text-foreground-muted font-mono-data">
                                {tx.hash.slice(0, 10)}...{tx.hash.slice(-4)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground-muted">{formatRelativeTime(tx.timestamp)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={tx.status === "confirmed" ? "success" : tx.status === "pending" ? "warning" : "danger"}
                          className="text-xs"
                        >
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            "text-sm font-mono-data",
                            tx.type === "slashing" ? "text-indicator-slashed" : "text-indicator-active"
                          )}
                        >
                          {tx.type === "slashing" ? "" : "+"}{tx.amount_usd.toFixed(4)} ETH
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals — wagmi hooks called unconditionally at component top level */}
      <StakeModal
        open={stakeOpen}
        onClose={() => setStakeOpen(false)}
        currentStakeEth={myStakeEth}
        balanceEth={balanceEth}
      />
      <UnstakeModal
        open={unstakeOpen}
        onClose={() => setUnstakeOpen(false)}
        currentStakeEth={myStakeEth}
      />
    </div>
  );
}

// ─── Disconnected Wallet View ─────────────────────────────────────────────────

function DisconnectedWalletView() {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Wallet</h1>
          <p className="text-sm text-foreground-muted">
            Connect your wallet to manage stakes and view transactions
          </p>
        </div>
      </header>

      <Card className="bg-bg-surface/80">
        <CardContent className="py-16">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-indicator-active/10 rounded-full mb-4">
              <Wallet className="h-12 w-12 text-indicator-active" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-sm text-foreground-muted mb-6 max-w-sm">
              Connect your Ethereum wallet to manage your stakes in the Tentrist
              GPU network and track your transaction history.
            </p>
            <ConnectButton />
            <p className="text-xs text-foreground-muted mt-4">
              By connecting, you agree to the{" "}
              <button className="text-indicator-active hover:underline">Terms of Service</button>{" "}
              and acknowledge the risks of staking cryptocurrency.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────

export default function WalletPage() {
  const { isConnected } = useAccount();
  return isConnected ? <ConnectedWalletView /> : <DisconnectedWalletView />;
}
