"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Wallet, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { useAuthStore } from "@/stores/auth-store";

const AMOUNTS = [0.1, 0.25, 0.5, 1.0, 2.5, 5.0];

export default function TopupPage() {
  const user = useAuthStore((s) => s.user);
  const [amount, setAmount] = React.useState<number | null>(null);
  const [custom, setCustom] = React.useState("");
  const [step, setStep] = React.useState<"select" | "signing" | "done">("select");
  const [walletAddr, setWalletAddr] = React.useState<string | null>(null);

  const selected = amount ?? (parseFloat(custom) || 0);

  async function handleTopup() {
    if (selected <= 0) return;
    setStep("signing");
    // Simulate wallet signing
    await new Promise((r) => setTimeout(r, 1500));
    const mock = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setWalletAddr(mock);
    setStep("done");
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <PageHeader
        title="Add Funds"
        description="Top up your prepaid compute balance"
        breadcrumbs={[
          { label: "Billing", href: "/dashboard/billing" },
          { label: "Add Funds" },
        ]}
      />

      {step === "done" && walletAddr ? (
        <Card className="bg-bg-surface/80 border-indicator-active/30">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-indicator-active/20 flex items-center justify-center mx-auto">
              <Check className="h-6 w-6 text-indicator-active" />
            </div>
            <div>
              <p className="text-foreground font-medium">Top-up Initiated</p>
              <p className="text-foreground-muted text-sm mt-1">
                Sending <strong className="text-foreground font-mono">{selected} ETH</strong> from your wallet
              </p>
            </div>
            <div className="p-3 bg-bg-base rounded-lg border border-hairline">
              <div className="text-xs text-foreground-muted mb-1">From wallet</div>
              <code className="text-sm font-mono text-foreground">
                {walletAddr.slice(0, 6)}…{walletAddr.slice(-4)}
              </code>
            </div>
            <p className="text-xs text-foreground-muted">
              Funds will appear in your balance after the transaction confirms on-chain.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link href="/dashboard/billing">
                <Button variant="outline">Back to Billing</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-bg-surface/80">
            <CardHeader>
              <CardTitle>Select Amount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                {AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setAmount(a); setCustom(""); }}
                    className={cn(
                      "p-4 rounded-lg border text-center transition-all font-mono-data font-semibold text-lg",
                      selected === a && a !== parseFloat(custom || "0")
                        ? "border-indicator-active bg-indicator-active/10 text-indicator-active"
                        : "border-hairline text-foreground hover:border-indicator-active/50"
                    )}
                  >
                    {a} ETH
                  </button>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Or enter custom amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.001"
                  placeholder="0.00"
                  value={custom}
                  onChange={(e) => { setCustom(e.target.value); setAmount(null); }}
                  className="w-full px-3 py-2 bg-bg-base border border-hairline rounded-lg text-sm font-mono text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-indicator-active"
                />
              </div>
            </CardContent>
          </Card>

          {selected > 0 && (
            <Card className="bg-bg-surface/80">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 bg-bg-base rounded-lg border border-hairline">
                  <Wallet className="h-5 w-5 text-indicator-stale" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">Connected Wallet</div>
                    <div className="text-xs text-foreground-muted">MetaMask / WalletConnect</div>
                  </div>
                  <span className="text-xs text-indicator-active">Connected</span>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "signing" ? (
            <div className="flex items-center gap-3 p-4 bg-bg-surface/80 rounded-lg border border-hairline">
              <Loader2 className="h-5 w-5 text-indicator-stale animate-spin" />
              <span className="text-foreground-muted text-sm">Waiting for wallet signature…</span>
            </div>
          ) : null}

          <div className="flex gap-3">
            <Link href="/dashboard/billing">
              <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Cancel</Button>
            </Link>
            <Button
              onClick={handleTopup}
              disabled={selected <= 0 || step === "signing"}
              isLoading={step === "signing"}
              className="bg-indicator-active text-bg-base hover:bg-indicator-active/90"
            >
              {step === "signing" ? "Signing…" : `Top Up ${selected > 0 ? selected + " ETH" : ""}`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
