"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

const EVENTS = [
  { ts: Date.now() - 120000, type: "job", color: "active", msg: "Job #job_8a3f completed on 0x4A5e...F82c — 0.023 ETH paid" },
  { ts: Date.now() - 300000, type: "slash", color: "slashed", msg: "Node 0xBcD1...8f2e slashed 0.010 ETH — missed heartbeat" },
  { ts: Date.now() - 660000, type: "node", color: "active", msg: "New node registered: RTX 4090 × 8 in eu-west-1" },
  { ts: Date.now() - 1080000, type: "job", color: "active", msg: "Job #job_7b2e submitted — LLM Fine-tuning" },
  { ts: Date.now() - 1860000, type: "sla", color: "stale", msg: "SLA credit issued: 0.0018 ETH to 0x1A2b..." },
  { ts: Date.now() - 2700000, type: "job", color: "active", msg: "Job #job_6c1a started on 0xEfA2...a6B7" },
  { ts: Date.now() - 3600000, type: "slash", color: "slashed", msg: "Node 0x1234...90ab slashed 0.025 ETH — VRAM exhaustion" },
  { ts: Date.now() - 5400000, type: "node", color: "active", msg: "Node 0x9A8b...1A2c came online: A100 80GB" },
];

const colorMap: Record<string, string> = {
  active: "bg-indicator-active",
  slashed: "bg-indicator-slashed",
  stale: "bg-indicator-stale",
};

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

export default function ActivityPage() {
  const [live, setLive] = React.useState(true);
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <PageHeader
        title="Live Activity"
        description="Real-time events on the Tentrist network"
      />

      <Card className="bg-bg-surface/80">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${live ? "bg-indicator-active animate-pulse" : "bg-foreground-muted"}`} />
            <span className="text-sm text-foreground-muted">{live ? "Live" : "Paused"}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {EVENTS.map((e, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-hairline/50 last:border-0">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${colorMap[e.color]}`} />
              <div className="flex-1">
                <span className="text-sm text-foreground">{e.msg}</span>
              </div>
              <span className="text-xs font-mono text-foreground-muted shrink-0">{formatTime(e.ts)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
