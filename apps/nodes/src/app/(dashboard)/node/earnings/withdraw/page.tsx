"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wallet, Zap, CheckCircle } from "lucide-react";

const mockWithdrawData = {
  totalWithdrawable: "18.42 ETH",
  nodes: [
    { id: "0x1a2b3c4d", name: "GPU-Rig-Alpha", excessStake: "11.5 ETH" },
    { id: "0x5e6f7a8b", name: "GPU-Cluster-Beta", excessStake: "5.0 ETH" },
    { id: "0x3a4b5c6d", name: "Dev-GPU-Node", excessStake: "1.92 ETH" },
  ],
};

export default function BulkWithdrawPage() {
  const router = useRouter();
  const [isSigning, setIsSigning] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleWithdraw = async () => {
    setIsSigning(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSigning(false);
    setIsSuccess(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push("/node/earnings");
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 max-w-md">
        <Link
          href="/node/earnings"
          className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Earnings
        </Link>

        <Card className="border-[#22c55e]/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-[#22c55e]" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Withdrawal Successful</h2>
            <p className="text-[#71717a]">
              Successfully withdrew {mockWithdrawData.totalWithdrawable} from your node stakes.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Back link */}
      <Link
        href="/node/earnings"
        className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Earnings
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Bulk Withdraw</h1>
        <p className="text-sm text-[#71717a] mt-1">
          Withdraw excess stake from all your nodes at once
        </p>
      </div>

      {/* Total */}
      <Card className="border-[#22c55e]/20">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-[#71717a]">Total Withdrawable</p>
          <p className="text-4xl font-bold font-mono text-[#22c55e] mt-2">
            {mockWithdrawData.totalWithdrawable}
          </p>
        </CardContent>
      </Card>

      {/* Per-Node Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Withdrawal Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left text-xs text-[#71717a] font-medium px-6 py-3">Node</th>
                <th className="text-right text-xs text-[#71717a] font-medium px-6 py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {mockWithdrawData.nodes.map((node) => (
                <tr key={node.id} className="border-b border-[#27272a] last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{node.name}</span>
                      <span className="text-xs text-[#71717a] font-mono">{node.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-mono text-[#22c55e]">{node.excessStake}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={handleWithdraw}
          isLoading={isSigning}
          className="w-full"
        >
          <Zap className="h-4 w-4 mr-1" />
          {isSigning ? "Sign Transaction..." : "Sign Transaction"}
        </Button>

        <p className="text-xs text-center text-[#71717a]">
          You will be asked to sign a batch transaction with your connected wallet
        </p>
      </div>
    </div>
  );
}
