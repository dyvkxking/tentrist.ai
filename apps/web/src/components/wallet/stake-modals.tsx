"use client";

import * as React from "react";
import {
  X,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Info,
  ExternalLink,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { formatEther, parseEther } from "viem";
import { ESCROW_ABI, CONTRACT_ADDRESSES } from "@/lib/contracts";

// Validation errors type
interface ValidationErrors {
  amount?: string;
  general?: string;
}

// Modal base component
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <Card className="bg-bg-surface border-hairline">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {title}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mr-2"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}

// Stake Modal
interface StakeModalProps {
  open: boolean;
  onClose: () => void;
  currentStake: string; // in ETH (string for formatting)
  minStake: string;     // min stake required (string)
  balance: string;       // ETH wallet balance (string)
}

export function StakeModal({
  open,
  onClose,
  currentStake = "0",
  minStake = "0",
  balance = "0",
}: StakeModalProps) {
  const { address } = useAccount();
  const [amount, setAmount] = React.useState("");
  const [txHash, setTxHash] = React.useState<`0x${string}` | undefined>(undefined);

  const {
    writeContract,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const parsedAmount = parseFloat(amount) || 0;
  const parsedCurrentStake = parseFloat(currentStake) || 0;
  const parsedBalance = parseFloat(balance) || 0;
  const parsedMinStake = parseFloat(minStake) || 0;
  const newStake = parsedCurrentStake + parsedAmount;

  const errors: ValidationErrors = {};

  if (amount && parsedAmount <= 0) {
    errors.amount = "Enter a valid amount greater than 0";
  }
  if (parsedAmount > parsedBalance) {
    errors.amount = "Insufficient wallet balance";
  }
  if (newStake < parsedMinStake && newStake > parsedCurrentStake) {
    errors.amount = `Minimum stake of ${parsedMinStake} ETH required`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !amount || parsedAmount <= 0) return;

    writeContract({
      address: CONTRACT_ADDRESSES.Escrow,
      abi: ESCROW_ABI,
      functionName: "stake",
      value: parseEther(amount),
    });
  };

  const handleClose = () => {
    setAmount("");
    setTxHash(undefined);
    onClose();
  };


  if (isConfirmed) {
    return (
      <Modal open={open} onClose={handleClose} title="Stake Added">
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-indicator-active" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Stake Successful</h3>
          <p className="text-foreground-muted mb-4">
            You have successfully added{" "}
            <span className="font-mono-data text-indicator-active">
              {parsedAmount.toFixed(4)} ETH
            </span>{" "}
            to your stake.
          </p>
          <div className="p-3 bg-bg-base rounded-lg mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground-muted">Previous Stake</span>
              <span className="font-mono-data">{parsedCurrentStake.toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground-muted">Added</span>
              <span className="font-mono-data text-indicator-active">+{parsedAmount.toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between text-sm font-medium border-t border-hairline pt-1 mt-1">
              <span className="text-foreground">New Stake</span>
              <span className="font-mono-data text-indicator-active">{newStake.toFixed(4)} ETH</span>
            </div>
          </div>
          {txHash && (
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indicator-active hover:underline mb-4"
            >
              View on Etherscan <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <Button onClick={handleClose} className="w-full">
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add to Stake">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current stake info */}
        <div className="p-3 bg-bg-base rounded-lg">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-foreground-muted">Current Stake</span>
            <span className="font-mono-data">{parsedCurrentStake.toFixed(4)} ETH</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-foreground-muted">Wallet Balance</span>
            <span className="font-mono-data">{parsedBalance.toFixed(4)} ETH</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground-muted">Min Required</span>
            <span className="font-mono-data">{parsedMinStake.toFixed(4)} ETH</span>
          </div>
        </div>

        {/* Amount input */}
        <Input
          label="Amount to Stake (ETH)"
          type="number"
          placeholder="0.0000"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
          }}
          error={!!errors.amount}
          helperText={errors.amount}
        />

        {/* Quick amount buttons */}
        <div className="flex gap-2">
          {[1, 5, 10].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(String(val))}
              className={cn(
                "flex-1 py-2 text-xs font-mono-data rounded-md border transition-colors",
                parsedAmount === val
                  ? "border-indicator-active bg-indicator-active/10 text-indicator-active"
                  : "border-hairline text-foreground-muted hover:border-zinc-600"
              )}
            >
              +{val} ETH
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAmount(String(parsedBalance.toFixed(4)))}
            className="flex-1 py-2 text-xs font-mono-data rounded-md border border-hairline text-foreground-muted hover:border-zinc-600"
          >
            MAX
          </button>
        </div>

        {/* New stake preview */}
        {parsedAmount > 0 && (
          <div className="p-3 bg-indicator-active/5 border border-indicator-active/20 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-foreground-muted">New Total Stake</span>
              <span className="font-mono-data text-indicator-active font-medium">
                {newStake.toFixed(4)} ETH
              </span>
            </div>
          </div>
        )}

        {/* Error from tx */}
        {writeError && (
          <div className="flex items-start gap-2 p-3 bg-indicator-slashed/10 border border-indicator-slashed/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-indicator-slashed flex-shrink-0 mt-0.5" />
            <span className="text-xs text-indicator-slashed">
              {writeError.message.includes("0x") ? "Transaction rejected" : String(writeError?.message || "Transaction failed")}
            </span>
          </div>
        )}

        {/* Warnings */}
        <div className="flex items-start gap-2 p-3 bg-indicator-stale/10 border border-indicator-stale/20 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-indicator-stale flex-shrink-0 mt-0.5" />
          <div className="text-xs text-foreground-muted">
            <p className="mb-1">
              Staked funds are locked in the Escrow contract and subject to
              slashing under SLA breach conditions.
            </p>
            <p>30-day unstaking cooldown applies when initiating unstaking.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isWritePending || isConfirming || !amount || !!errors.amount}
          >
            {isWritePending || isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {isConfirming ? "Confirming..." : "Sign Transaction..."}
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Confirm Stake
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Unstake Modal
interface UnstakeModalProps {
  open: boolean;
  onClose: () => void;
  currentStake: string; // in ETH (string)
}

export function UnstakeModal({
  open,
  onClose,
  currentStake = "0",
}: UnstakeModalProps) {
  const { address } = useAccount();
  const [amount, setAmount] = React.useState("");
  const [txHash, setTxHash] = React.useState<`0x${string}` | undefined>(undefined);
  const [hasCooldownAcknowledged, setHasCooldownAcknowledged] = React.useState(false);

  const {
    writeContract,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const parsedAmount = parseFloat(amount) || 0;
  const parsedCurrentStake = parseFloat(currentStake) || 0;
  const remainingStake = parsedCurrentStake - parsedAmount;
  const MIN_KEEP = 10; // 10 ETH minimum keep

  const errors: ValidationErrors = {};

  if (amount && parsedAmount <= 0) {
    errors.amount = "Enter a valid amount greater than 0";
  }
  if (parsedAmount > parsedCurrentStake) {
    errors.amount = "Cannot exceed current stake";
  }
  if (remainingStake < MIN_KEEP && remainingStake >= 0) {
    errors.amount = `Minimum stake of ${MIN_KEEP} ETH must be maintained`;
  }
  if (!hasCooldownAcknowledged) {
    // Don't show error by default; just disable submit
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !amount || parsedAmount <= 0) return;

    writeContract({
      address: CONTRACT_ADDRESSES.Escrow,
      abi: ESCROW_ABI,
      functionName: "withdraw",
      args: [parseEther(amount)],
    });
  };

  const handleClose = () => {
    setAmount("");
    setTxHash(undefined);
    setHasCooldownAcknowledged(false);
    onClose();
  };

  if (isConfirmed) {
    return (
      <Modal open={open} onClose={handleClose} title="Unstaking Initiated">
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            <Clock className="h-16 w-16 text-indicator-stale" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Unstaking Initiated</h3>
          <p className="text-foreground-muted mb-4">
            Your unstaking request for{" "}
            <span className="font-mono-data text-indicator-stale">
              {parsedAmount.toFixed(4)} ETH
            </span>{" "}
            has been submitted.
          </p>
          <div className="p-3 bg-bg-base rounded-lg mb-6 text-left">
            <div className="flex items-center gap-2 text-indicator-stale mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Cooldown Period: 30 Days</span>
            </div>
            <p className="text-xs text-foreground-muted mb-2">
              During the cooldown period:
            </p>
            <ul className="text-xs text-foreground-muted space-y-1 ml-4 list-disc">
              <li>Your stake remains locked in escrow</li>
              <li>Node will be marked as draining</li>
              <li>New job assignments will be suspended</li>
              <li>Funds will be released after cooldown expires</li>
            </ul>
          </div>
          {txHash && (
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indicator-active hover:underline mb-4"
            >
              View on Etherscan <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <Button onClick={handleClose} className="w-full">
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  const canSubmit =
    amount &&
    parsedAmount > 0 &&
    parsedAmount <= parsedCurrentStake &&
    remainingStake >= MIN_KEEP &&
    hasCooldownAcknowledged &&
    !isWritePending &&
    !isConfirming;

  return (
    <Modal open={open} onClose={handleClose} title="Initiate Unstaking">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current stake info */}
        <div className="p-3 bg-bg-base rounded-lg">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-foreground-muted">Current Stake</span>
            <span className="font-mono-data">{parsedCurrentStake.toFixed(4)} ETH</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground-muted">Minimum Required</span>
            <span className="font-mono-data">{MIN_KEEP.toFixed(4)} ETH</span>
          </div>
        </div>

        {/* Amount input */}
        <Input
          label="Amount to Unstake (ETH)"
          type="number"
          placeholder="0.0000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={!!errors.amount}
          helperText={errors.amount}
        />

        {/* Quick amount buttons */}
        <div className="flex gap-2">
          {[0.25, 0.5, 0.75].map((fraction) => {
            const val = parsedCurrentStake * fraction;
            return (
              <button
                key={fraction}
                type="button"
                onClick={() => setAmount(String(val.toFixed(4)))}
                className={cn(
                  "flex-1 py-2 text-xs font-mono-data rounded-md border transition-colors",
                  Math.abs(parsedAmount - val) < 0.0001
                    ? "border-indicator-stale bg-indicator-stale/10 text-indicator-stale"
                    : "border-hairline text-foreground-muted hover:border-zinc-600"
                )}
              >
                {fraction * 100}%
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setAmount(String(Math.max(0, parsedCurrentStake - MIN_KEEP).toFixed(4)))}
            className="flex-1 py-2 text-xs font-mono-data rounded-md border border-hairline text-foreground-muted hover:border-zinc-600"
          >
            MIN KEEP
          </button>
        </div>

        {/* New stake preview */}
        {parsedAmount > 0 && remainingStake >= 0 && (
          <div className="p-3 bg-indicator-stale/5 border border-indicator-stale/20 rounded-lg">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground-muted">Remaining Stake</span>
              <span className="font-mono-data text-indicator-stale font-medium">
                {remainingStake.toFixed(4)} ETH
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground-muted">Will Receive</span>
              <span className="font-mono-data text-indicator-active">
                {parsedAmount.toFixed(4)} ETH
              </span>
            </div>
          </div>
        )}

        {/* Cooldown acknowledgment */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="cooldown-ack"
            checked={hasCooldownAcknowledged}
            onChange={(e) => setHasCooldownAcknowledged(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border-hairline bg-bg-base text-indicator-active focus-visible:ring-indicator-active/50"
          />
          <label htmlFor="cooldown-ack" className="text-xs text-foreground-muted">
            I understand that unstaking requires a 30-day cooldown period. During
            this time, my node will be marked as draining and my stake will
            remain locked until the cooldown expires.
          </label>
        </div>

        {/* Error from tx */}
        {writeError && (
          <div className="flex items-start gap-2 p-3 bg-indicator-slashed/10 border border-indicator-slashed/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-indicator-slashed flex-shrink-0 mt-0.5" />
            <span className="text-xs text-indicator-slashed">
              {String(writeError?.message || "Transaction failed")}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            className="flex-1"
            disabled={!canSubmit}
          >
            {isWritePending || isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {isConfirming ? "Confirming..." : "Sign Transaction..."}
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Initiate Unstaking
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
