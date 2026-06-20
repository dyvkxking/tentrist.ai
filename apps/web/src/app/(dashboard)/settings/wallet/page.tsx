"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Wallet, Copy, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

export default function WalletSettingsPage() {
  const [copied, setCopied] = React.useState(false);
  // Mock linked wallet
  const walletAddress = "0x4A5e9F2c1D8b3A7e6f3B2a1C9d4E5f8";

  async function handleCopy() {
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <PageHeader
        title="Wallet"
        description="Manage your linked Ethereum wallet"
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Wallet" },
        ]}
      />

      <Card className="bg-bg-surface/80 border-indicator-active/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-indicator-active" />
            Linked Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-bg-base rounded-lg border border-hairline">
            <div className="text-xs text-foreground-muted mb-1">Ethereum Address</div>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm font-mono text-foreground break-all">{walletAddress}</code>
              <button onClick={handleCopy} className="shrink-0 p-1 hover:bg-bg-surface rounded transition-colors">
                {copied ? <Check className="h-4 w-4 text-indicator-active" /> : <Copy className="h-4 w-4 text-foreground-muted" />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indicator-active" />
            <span className="text-sm text-indicator-active">Connected</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Switch Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-foreground-muted">
            Unlink your current wallet and connect a different one. You will need to re-verify ownership.
          </p>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Disconnect & Switch
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Link href="/settings">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
        </Link>
      </div>
    </div>
  );
}
