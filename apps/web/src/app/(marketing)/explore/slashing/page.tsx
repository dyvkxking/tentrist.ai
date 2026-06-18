"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ExternalLink } from "lucide-react";

const SLASHES = [
  { id: "sl_001", node: "0xBcD1...8f2e", job: "job_7b2e", amount: "0.010 ETH", reason: "Missed 15 consecutive heartbeats", timestamp: "Jun 15, 2024 08:42", refunded: "0.007 ETH" },
  { id: "sl_002", node: "0x1234...90ab", job: "job_6c1a", amount: "0.025 ETH", reason: "VRAM exhaustion — node flagged critical", timestamp: "Jun 10, 2024 14:22", refunded: "0.0175 ETH" },
  { id: "sl_003", node: "0xEfA2...a6B7", job: "job_5d0b", amount: "0.008 ETH", reason: "Latency spike exceeded 500ms threshold", timestamp: "Jun 8, 2024 22:01", refunded: "0.0056 ETH" },
  { id: "sl_004", node: "0xBcD1...8f2e", job: "job_4e9c", amount: "0.015 ETH", reason: "SLA breach — uptime 94.2% vs 99% required", timestamp: "Jun 5, 2024 11:30", refunded: "0.0105 ETH" },
];

export default function SlashingPage() {
  const totalSlashed = SLASHES.reduce((sum, s) => sum + parseFloat(s.amount), 0);
  const totalRefunded = SLASHES.reduce((sum, s) => sum + parseFloat(s.refunded), 0);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <PageHeader title="Slash Events" description="On-chain slashing events across the Tentrist network" />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-bg-surface/80 border-indicator-slashed/30">
          <CardContent className="p-4">
            <div className="text-xs text-foreground-muted mb-1">Total Slashed (all time)</div>
            <div className="text-2xl font-mono-data font-semibold text-indicator-slashed">{totalSlashed.toFixed(3)} ETH</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-xs text-foreground-muted mb-1">Total Refunded to Clients</div>
            <div className="text-2xl font-mono-data font-semibold text-indicator-active">{totalRefunded.toFixed(3)} ETH</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-bg-surface/80">
        <CardHeader><CardTitle>Slash Event Log</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-hairline">
            {SLASHES.map((s) => (
              <div key={s.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono text-foreground">{s.node}</code>
                      <span className="text-foreground-muted">·</span>
                      <code className="text-sm font-mono text-foreground-muted">{s.job.slice(0, 12)}…</code>
                    </div>
                    <div className="text-sm text-foreground-muted">{s.reason}</div>
                    <div className="text-xs text-foreground-muted mt-1">{s.timestamp}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono-data font-semibold text-indicator-slashed">-{s.amount}</div>
                    <div className="text-xs text-indicator-active">+{s.refunded} refunded</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
