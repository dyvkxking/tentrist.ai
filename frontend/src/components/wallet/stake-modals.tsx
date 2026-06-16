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
  currentStake: number;
  maxStake?: number;
  currency?: string;
}

export function StakeModal({
  open,
  onClose,
  currentStake = 0,
  maxStake = 100,
  currency = "ETH",
}: StakeModalProps) {
  const [amount, setAmount] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errors, setErrors] = React.useState<ValidationErrors>({});

  const parsedAmount = parseFloat(amount) || 0;
  const newStake = currentStake + parsedAmount;

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!amount || parsedAmount <= 0) {
      newErrors.amount = "Enter a valid amount greater than 0";
    } else if (parsedAmount > maxStake) {
      newErrors.amount = `Cannot exceed max stake of ${maxStake} ${currency}`;
    } else if (parsedAmount > 10) {
      // Check if they have sufficient balance (mock)
      newErrors.amount = "Insufficient balance for this stake amount";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate transaction
    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setAmount("");
    setErrors({});
    setIsSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  if (isSuccess) {
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
              {parsedAmount} {currency}
            </span>{" "}
            to your stake.
          </p>
          <div className="p-3 bg-bg-base rounded-lg mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground-muted">Previous Stake</span>
              <span className="font-mono-data">{currentStake.toFixed(3)} {currency}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground-muted">Added</span>
              <span className="font-mono-data text-indicator-active">+{parsedAmount.toFixed(3)} {currency}</span>
            </div>
            <div className="flex justify-between text-sm font-medium border-t border-hairline pt-1 mt-1">
              <span className="text-foreground">New Stake</span>
              <span className="font-mono-data text-indicator-active">{newStake.toFixed(3)} {currency}</span>
            </div>
          </div>
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
            <span className="font-mono-data">{currentStake.toFixed(3)} {currency}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground-muted">Max Allowed</span>
            <span className="font-mono-data">{maxStake.toFixed(3)} {currency}</span>
          </div>
        </div>

        {/* Amount input */}
        <Input
          label={`Amount to Stake (${currency})`}
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setErrors({});
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
                parseFloat(amount) === val
                  ? "border-indicator-active bg-indicator-active/10 text-indicator-active"
                  : "border-hairline text-foreground-muted hover:border-zinc-600"
              )}
            >
              +{val} {currency}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAmount(String(maxStake - currentStake))}
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
                {newStake.toFixed(3)} {currency}
              </span>
            </div>
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
            <p>
              30-day unstaking cooldown applies when initiating unstaking.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Confirming...
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
  currentStake: number;
  currency?: string;
}

export function UnstakeModal({
  open,
  onClose,
  currentStake = 0,
  currency = "ETH",
}: UnstakeModalProps) {
  const [amount, setAmount] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [hasCooldownAcknowledged, setHasCooldownAcknowledged] = React.useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const remainingStake = currentStake - parsedAmount;

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!amount || parsedAmount <= 0) {
      newErrors.amount = "Enter a valid amount greater than 0";
    } else if (parsedAmount > currentStake) {
      newErrors.amount = `Cannot exceed current stake of ${currentStake.toFixed(3)} ${currency}`;
    } else if (remainingStake < 10) {
      newErrors.amount = "Minimum stake of 10 ETH must be maintained";
    }

    // Check for active jobs (mock)
    const hasActiveJobs = parsedAmount >= currentStake;
    if (hasActiveJobs) {
      newErrors.general = "You have active jobs running. Complete or requeue them before unstaking all funds.";
    }

    if (!hasCooldownAcknowledged) {
      newErrors.general = "You must acknowledge the 30-day unstaking cooldown period";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate transaction
    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setAmount("");
    setErrors({});
    setIsSuccess(false);
    setIsSubmitting(false);
    setHasCooldownAcknowledged(false);
    onClose();
  };

  if (isSuccess) {
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
              {parsedAmount} {currency}
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
          <Button onClick={handleClose} className="w-full">
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Initiate Unstaking">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current stake info */}
        <div className="p-3 bg-bg-base rounded-lg">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-foreground-muted">Current Stake</span>
            <span className="font-mono-data">{currentStake.toFixed(3)} {currency}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground-muted">Minimum Required</span>
            <span className="font-mono-data">10.000 {currency}</span>
          </div>
        </div>

        {/* Amount input */}
        <Input
          label={`Amount to Unstake (${currency})`}
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setErrors({});
          }}
          error={!!errors.amount}
          helperText={errors.amount}
        />

        {/* Quick amount buttons */}
        <div className="flex gap-2">
          {[0.25, 0.5, 0.75].map((fraction) => {
            const val = currentStake * fraction;
            return (
              <button
                key={fraction}
                type="button"
                onClick={() => setAmount(String(val.toFixed(3)))}
                className={cn(
                  "flex-1 py-2 text-xs font-mono-data rounded-md border transition-colors",
                  Math.abs(parseFloat(amount) - val) < 0.001
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
            onClick={() => setAmount(String((currentStake - 10).toFixed(3)))}
            className="flex-1 py-2 text-xs font-mono-data rounded-md border border-hairline text-foreground-muted hover:border-zinc-600"
          >
            MIN KEEP
          </button>
        </div>

        {/* New stake preview */}
        {parsedAmount > 0 && (
          <div className="p-3 bg-indicator-stale/5 border border-indicator-stale/20 rounded-lg">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground-muted">Remaining Stake</span>
              <span className="font-mono-data text-indicator-stale font-medium">
                {remainingStake.toFixed(3)} {currency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground-muted">Will Receive</span>
              <span className="font-mono-data text-indicator-active">
                {parsedAmount.toFixed(3)} {currency}
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
            onChange={(e) => {
              setHasCooldownAcknowledged(e.target.checked);
              setErrors({});
            }}
            className="mt-1 h-4 w-4 rounded border-border-hairline bg-bg-base text-indicator-active focus-visible:ring-indicator-active/50"
          />
          <label htmlFor="cooldown-ack" className="text-xs text-foreground-muted">
            I understand that unstaking requires a 30-day cooldown period. During
            this time, my node will be marked as draining and my stake will
            remain locked until the cooldown expires.
          </label>
        </div>

        {/* Warnings */}
        {errors.general && (
          <div className="flex items-start gap-2 p-3 bg-indicator-slashed/10 border border-indicator-slashed/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-indicator-slashed flex-shrink-0 mt-0.5" />
            <span className="text-xs text-indicator-slashed">{errors.general}</span>
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Confirming...
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
