"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wallet, Copy, CheckCircle, RefreshCw, ExternalLink } from "lucide-react";

const mockWalletData = {
  address: "0x742d35Cc6634C0532925a3b844Bc9e7595f8fE12",
  chain: "Ethereum Mainnet",
  status: "connected" as const,
};

export default function WalletManagementPage() {
  const [copied, setCopied] = React.useState(false);
  const [isSwitching, setIsSwitching] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(mockWalletData.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwitchWallet = async () => {
    setIsSwitching(true);
    // Mock wallet switch flow
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSwitching(false);
  };

  const truncatedAddress = `${mockWalletData.address.slice(0, 6)}...${mockWalletData.address.slice(-4)}`;

  return (
    <div className="space-y-6 max-w-lg">
      {/* Back link */}
      <Link
        href="/node/settings"
        className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Wallet Management</h1>
        <p className="text-sm text-[#71717a] mt-1">
          Manage your connected wallet
        </p>
      </div>

      {/* Wallet Info */}
      <Card className="border-[#22c55e]/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-[#22c55e]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Connected Wallet</p>
                <p className="text-xs text-[#71717a]">{mockWalletData.chain}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">
              <CheckCircle className="h-3 w-3" />
              {mockWalletData.status.charAt(0).toUpperCase() + mockWalletData.status.slice(1)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 bg-[#010102] border border-[#27272a] rounded font-mono text-white">
              {truncatedAddress}
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <CheckCircle className="h-4 w-4 text-[#22c55e]" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://etherscan.io/address/${mockWalletData.address}`, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Full Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-[#010102] border border-[#27272a] rounded font-mono text-sm text-white break-all">
            {mockWalletData.address}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button onClick={handleSwitchWallet} isLoading={isSwitching} className="w-full">
          <RefreshCw className="h-4 w-4 mr-1" />
          {isSwitching ? "Connecting..." : "Switch Wallet"}
        </Button>

        <p className="text-xs text-center text-[#71717a]">
          Switching wallet will require re-verification of ownership
        </p>
      </div>
    </div>
  );
}
