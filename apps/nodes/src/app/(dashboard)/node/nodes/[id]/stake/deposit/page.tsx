"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Wallet, Zap, CheckCircle } from "lucide-react";

export default function DepositStakePage() {
  const params = useParams();
  const router = useRouter();
  const nodeId = params.id as string;

  const [amount, setAmount] = React.useState("");
  const [isSigning, setIsSigning] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleDeposit = async () => {
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
            <h2 className="text-xl font-semibold text-white mb-2">Deposit Successful</h2>
            <p className="text-[#71717a]">
              Successfully deposited {amount} ETH to your node stake.
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
        <h1 className="text-xl font-semibold text-white">Deposit Stake</h1>
        <p className="text-sm text-[#71717a] mt-1">
          Add collateral to node {nodeId}
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Wallet className="h-4 w-4 text-[#71717a]" />
            Deposit Amount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-[#71717a]">Amount (ETH)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-[#010102] border-[#27272a] font-mono text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[#71717a]">Quick amounts</label>
            <div className="flex gap-2">
              {["1.0", "2.5", "5.0", "10.0"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className="flex-1 px-3 py-2 text-sm font-mono bg-[#0f1011] border border-[#27272a] rounded hover:border-[#22c55e]/50 transition-colors"
                >
                  {preset} ETH
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={handleDeposit}
          isLoading={isSigning}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full"
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
