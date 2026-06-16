"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Server,
  Shield,
  Wallet,
  Cpu,
  HardDrive,
  Globe,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReputationBadge } from "@/components/ui/ReputationBadge";

// Form data interface
interface NodeRegistrationForm {
  // Node Identity
  nodeName: string;
  region: string;
  // Hardware
  cpuModel: string;
  cpuCores: string;
  vramTotal: string;
  // Wallet
  walletAddress: string;
  stakeAmount: string;
  stakeCurrency: string;
}

// Stake tier options with requirements
const stakeTiers = [
  {
    tier: "gold" as const,
    label: "Gold Tier",
    minStake: 40,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/30",
    benefits: ["Priority job routing", "Reduced slashing penalties", "Premium support"],
    icon: "◆",
  },
  {
    tier: "silver" as const,
    label: "Silver Tier",
    minStake: 25,
    color: "text-zinc-300",
    bgColor: "bg-zinc-300/10",
    borderColor: "border-zinc-400/30",
    benefits: ["Standard job routing", "Moderate slashing penalties", "Standard support"],
    icon: "◇",
  },
  {
    tier: "bronze" as const,
    label: "Bronze Tier",
    minStake: 10,
    color: "text-orange-600",
    bgColor: "bg-orange-600/10",
    borderColor: "border-orange-700/30",
    benefits: ["Basic job routing", "Standard slashing penalties", "Community support"],
    icon: "○",
  },
];

// Regions
const regions = [
  "us-east-1",
  "us-west-2",
  "eu-west-1",
  "eu-central-1",
  "ap-southeast-1",
  "ap-northeast-1",
];

// Form Section Component
function FormSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-bg-base border border-hairline">
          <Icon className="h-4 w-4 text-indicator-active" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-foreground-muted">{description}</p>
          )}
        </div>
      </div>
      <div className="pl-7 space-y-3">{children}</div>
    </div>
  );
}

// Tier Selection Card
function TierSelectionCard({
  tier,
  selected,
  onSelect,
  stakeAmount,
}: {
  tier: (typeof stakeTiers)[number];
  selected: boolean;
  onSelect: () => void;
  stakeAmount: string;
}) {
  const isValid = parseFloat(stakeAmount) >= tier.minStake;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full p-4 rounded-lg border text-left transition-all",
        selected
          ? `${tier.bgColor} ${tier.borderColor}`
          : "bg-bg-base border-hairline hover:border-zinc-700",
        !isValid && !selected && "opacity-50"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={cn("text-lg", tier.color)}>{tier.icon}</span>
          <span className={cn("font-semibold", tier.color)}>{tier.label}</span>
        </div>
        {selected && (
          <CheckCircle2 className={cn("h-5 w-5", tier.color)} />
        )}
      </div>
      <div className="text-xs text-foreground-muted mb-3">
        Min. Stake: {tier.minStake} ETH
      </div>
      <ul className="space-y-1">
        {tier.benefits.map((benefit, i) => (
          <li key={i} className="flex items-center gap-1.5 text-xs text-foreground-muted">
            <CheckCircle2 className={cn("h-3 w-3", tier.color)} />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

// Main Registration Form Component
function StakingRegistrationForm() {
  const [form, setForm] = React.useState<NodeRegistrationForm>({
    nodeName: "",
    region: "",
    cpuModel: "",
    cpuCores: "",
    vramTotal: "",
    walletAddress: "",
    stakeAmount: "",
    stakeCurrency: "ETH",
  });

  const [selectedTier, setSelectedTier] = React.useState<(typeof stakeTiers)[number]["tier"]>("silver");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);

  // Validation errors
  const [errors, setErrors] = React.useState<Partial<Record<keyof NodeRegistrationForm, string>>>({});

  // Calculate estimated tier based on stake amount
  const estimatedTier = React.useMemo(() => {
    const amount = parseFloat(form.stakeAmount) || 0;
    if (amount >= 40) return "gold";
    if (amount >= 25) return "silver";
    if (amount >= 10) return "bronze";
    return "bronze";
  }, [form.stakeAmount]);

  const handleChange = (field: keyof NodeRegistrationForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof NodeRegistrationForm, string>> = {};

    if (!form.nodeName.trim()) {
      newErrors.nodeName = "Node name is required";
    }
    if (!form.region) {
      newErrors.region = "Region is required";
    }
    if (!form.cpuModel.trim()) {
      newErrors.cpuModel = "CPU model is required";
    }
    if (!form.cpuCores || parseInt(form.cpuCores) < 1) {
      newErrors.cpuCores = "Valid core count is required";
    }
    if (!form.vramTotal || parseFloat(form.vramTotal) < 1) {
      newErrors.vramTotal = "Valid VRAM amount is required";
    }
    if (!form.walletAddress.trim()) {
      newErrors.walletAddress = "Wallet address is required";
    } else if (!/^0x[a-fA-F0-9]{10,}$/.test(form.walletAddress)) {
      newErrors.walletAddress = "Invalid Ethereum address format";
    }
    if (!form.stakeAmount || parseFloat(form.stakeAmount) < 10) {
      newErrors.stakeAmount = "Minimum stake of 10 ETH is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <Card className="bg-bg-surface/80 border-indicator-active/30">
        <CardContent className="py-12 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-indicator-active" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Registration Submitted</h2>
          <p className="text-foreground-muted mb-6 max-w-md mx-auto">
            Your node registration has been submitted. You will receive a confirmation
            once the stake is verified on-chain.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/nodes"
              className="inline-flex items-center justify-center rounded-md font-medium border bg-transparent text-foreground border-border-hairline hover:bg-bg-surface hover:border-zinc-700 h-8 px-3 text-xs gap-1.5 transition-all"
            >
              View Nodes
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md font-medium border bg-indicator-active/20 text-indicator-active border-indicator-active/40 hover:bg-indicator-active/30 h-8 px-3 text-xs gap-1.5 transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Node Identity */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4 text-indicator-active" />
            Node Identity
          </CardTitle>
          <CardDescription>
            Basic information about your GPU node
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Node Name"
              placeholder="e.g., gpu-node-us-east-01"
              value={form.nodeName}
              onChange={(e) => handleChange("nodeName", e.target.value)}
              error={!!errors.nodeName}
              helperText={errors.nodeName}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Region
              </label>
              <select
                value={form.region}
                onChange={(e) => handleChange("region", e.target.value)}
                className={cn(
                  "flex h-10 w-full rounded-md border bg-bg-base px-3 py-2 text-sm",
                  "border-border-hairline focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-indicator-active/50 focus-visible:border-indicator-active",
                  errors.region && "border-indicator-slashed/60"
                )}
              >
                <option value="">Select region...</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.region && (
                <span className="text-xs text-indicator-slashed">{errors.region}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hardware Configuration */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indicator-active" />
            Hardware Configuration
          </CardTitle>
          <CardDescription>
            GPU and CPU specifications of your node
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="CPU Model"
              placeholder="e.g., AMD EPYC 9654"
              value={form.cpuModel}
              onChange={(e) => handleChange("cpuModel", e.target.value)}
              error={!!errors.cpuModel}
              helperText={errors.cpuModel}
            />
            <Input
              label="CPU Cores"
              type="number"
              placeholder="e.g., 128"
              value={form.cpuCores}
              onChange={(e) => handleChange("cpuCores", e.target.value)}
              error={!!errors.cpuCores}
              helperText={errors.cpuCores}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Total VRAM (GB)"
              type="number"
              placeholder="e.g., 80"
              value={form.vramTotal}
              onChange={(e) => handleChange("vramTotal", e.target.value)}
              error={!!errors.vramTotal}
              helperText={errors.vramTotal || "Total GPU memory available for compute tasks"}
            />
            <div className="flex flex-col gap-1.5 p-3 bg-bg-base/50 rounded-lg border border-hairline">
              <div className="flex items-center gap-2 text-xs text-foreground-muted">
                <HardDrive className="h-3 w-3" />
                <span>VRAM Utilization</span>
              </div>
              <div className="text-2xl font-mono-data text-indicator-active">
                {form.vramTotal ? `${((parseFloat(form.vramTotal) || 0) * 0.8).toFixed(0)}GB available` : "—"}
              </div>
              <span className="text-xs text-foreground-muted">
                Estimated 80% allocatable to workloads
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet & Stake */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4 text-indicator-active" />
            Wallet & Staking
          </CardTitle>
          <CardDescription>
            Connect your wallet and specify stake amount
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Wallet Address"
            placeholder="0x..."
            value={form.walletAddress}
            onChange={(e) => handleChange("walletAddress", e.target.value)}
            error={!!errors.walletAddress}
            helperText={errors.walletAddress || "Ethereum address that will receive job payments"}
          />

          <div className="space-y-3">
            <Input
              label="Stake Amount"
              type="number"
              placeholder="e.g., 25"
              value={form.stakeAmount}
              onChange={(e) => handleChange("stakeAmount", e.target.value)}
              error={!!errors.stakeAmount}
              helperText={errors.stakeAmount || "Minimum 10 ETH required. Higher stake = better tier benefits."}
            />

            {/* Tier preview based on stake */}
            {form.stakeAmount && parseFloat(form.stakeAmount) >= 10 && (
              <div className={cn(
                "p-3 rounded-lg border",
                estimatedTier === "gold" && "bg-amber-400/10 border-amber-400/30",
                estimatedTier === "silver" && "bg-zinc-300/10 border-zinc-400/30",
                estimatedTier === "bronze" && "bg-orange-600/10 border-orange-700/30"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-foreground-muted" />
                  <span className="text-xs text-foreground-muted">
                    Estimated tier based on stake amount
                  </span>
                </div>
                <ReputationBadge tier={estimatedTier} showScore={false} />
              </div>
            )}
          </div>

          {/* Tier Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Select Stake Tier
            </label>
            <div className="grid gap-3 md:grid-cols-3">
              {stakeTiers.map((tier) => (
                <TierSelectionCard
                  key={tier.tier}
                  tier={tier}
                  selected={selectedTier === tier.tier}
                  onSelect={() => setSelectedTier(tier.tier)}
                  stakeAmount={form.stakeAmount}
                />
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t border-hairline pt-4">
          <div className="flex items-center gap-2 text-xs text-foreground-muted">
            <Shield className="h-4 w-4" />
            <span>Stake is locked in smart contract until node deregisters</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground-muted">Estimated APY:</span>
            <Badge variant="success" className="font-mono-data">
              12.4%
            </Badge>
          </div>
        </CardFooter>
      </Card>

      {/* Terms */}
      <Card className="bg-bg-surface/80">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 h-4 w-4 rounded border-border-hairline bg-bg-base text-indicator-active focus-visible:ring-indicator-active/50"
              required
            />
            <label htmlFor="terms" className="text-sm text-foreground-muted">
              I agree to the{" "}
              <button type="button" className="text-indicator-active hover:underline">
                Node Operator Terms of Service
              </button>{" "}
              and understand that staking involves slashing risks as defined in the SLA
              contract. I acknowledge that my node will be subject to 30-second heartbeat
              monitoring.
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href="/nodes"
          className="inline-flex items-center justify-center rounded-md font-medium border bg-transparent text-foreground border-border-hairline hover:bg-bg-surface hover:border-zinc-700 h-8 px-3 text-xs gap-1.5 transition-all"
        >
          Cancel
        </Link>
        <Button type="submit" isLoading={isSubmitting}>
          Register Node & Stake
        </Button>
      </div>
    </form>
  );
}

export default function NodeRegistrationPage() {
  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      {/* Back Button */}
      <Link
        href="/nodes"
        className="inline-flex items-center justify-center rounded-md font-medium border bg-transparent text-foreground-muted hover:bg-bg-surface hover:text-foreground h-8 px-3 text-xs gap-1.5 transition-all w-fit"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Nodes
      </Link>

      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Register Node
        </h1>
        <p className="text-sm text-foreground-muted">
          Join the Tentrist GPU network by registering your compute node
        </p>
      </div>

      {/* Registration Form */}
      <StakingRegistrationForm />
    </div>
  );
}
