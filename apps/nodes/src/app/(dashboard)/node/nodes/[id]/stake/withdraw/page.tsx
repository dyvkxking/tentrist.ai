"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Wallet, Zap, CheckCircle, AlertTriangle } from "lucide-react";

const MAX_WITHDRAWABLE = "11.5 ETH";

export default function WithdrawStakePage() {
  const params = useParams();
  const router = useRouter();
  const nodeId = params.id as string;

  const [amount, setAmount] = React.useState("");
  const [isSigning, setIsSigning] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsSigning(true);
    // Mock wallet signing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSigning(false);
    setIsSuccess(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push(`/node/nodes/${nodeId}/stake`);
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 max-w-md">
        <Link
          href={`/node/nodes/${nodeId}/stake`}
          className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Stake Management
        </Link>

        <Card className="border-[#22c55e]/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-[#22c55e]" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Withdrawal Successful</h2>
            <p className="text-[#71717a]">
              Successfully withdrew {amount} ETH from your node stake.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md">
      {/* Back link */}
      <Link
        href={`/node/nodes/${nodeId}/stake`}
        className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Stake Management
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Withdraw Stake</h1>
        <p className="text-sm text-[#71717a] mt-1">
          Withdraw collateral from node {nodeId}
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-[#f59e0b]/20 bg-[#f59e0b]/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#f59e0b] mt-0.5" />
            <div className="text-sm">
              <p className="text-white font-medium">Minimum stake required</p>
              <p className="text-[#71717a] mt-1">
                You must maintain at least 1.0 ETH in stake. Maximum withdrawable: {MAX_WITHDRAWABLE}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Wallet className="h-4 w-4 text-[#71717a]" />
            Withdraw Amount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-[#71717a]">Amount (ETH)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="11.5"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-[#010102] border-[#27272a] font-mono text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[#71717a]">Quick amounts</label>
            <div className="flex gap-2">
              {["1.0", "2.5", "5.0", MAX_WITHDRAWABLE].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.replace(" ETH", ""))}
                  className="flex-1 px-3 py-2 text-sm font-mono bg-[#0f1011] border border-[#27272a] rounded hover:border-[#22c55e]/50 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={handleWithdraw}
          isLoading={isSigning}
          disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > 11.5}
          className="w-full"
          variant="outline"
        >
          <Zap className="h-4 w-4 mr-1" />
          {isSigning ? "Sign Transaction..." : "Sign Transaction"}
        </Button>

        <p className="text-xs text-center text-[#71717a]">
          You will be asked to sign this transaction with your connected wallet
        </p>
      </div>
    </div>
  );
}
