"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Webhook, Trash2, Activity, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

interface WebhookRecord {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: number;
  lastDelivery: number | null;
  successRate: number;
}

const mockWebhooks: WebhookRecord[] = [
  {
    id: "wh_001",
    url: "https://api.myapp.com/tentrist/events",
    events: ["job.completed", "job.failed", "sla.breached"],
    active: true,
    createdAt: Date.now() - 30 * 86400000,
    lastDelivery: Date.now() - 3600000,
    successRate: 98.5,
  },
  {
    id: "wh_002",
    url: "https://hooks.myapp.com/tentrist",
    events: ["job.completed"],
    active: false,
    createdAt: Date.now() - 60 * 86400000,
    lastDelivery: Date.now() - 86400000 * 3,
    successRate: 72.1,
  },
];

const EVENT_LABELS: Record<string, string> = {
  "job.completed": "Job Completed",
  "job.failed": "Job Failed",
  "job.started": "Job Started",
  "sla.breached": "SLA Breached",
  "credit.issued": "Credit Issued",
  "node.online": "Node Online",
  "node.slashed": "Node Slashed",
};

function formatRelative(ts: number | null): string {
  if (!ts) return "Never";
  const diff = Date.now() - ts;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function WebhooksPage() {
  const router = useRouter();
  const [webhooks, setWebhooks] = React.useState(mockWebhooks);

  function deleteWebhook(id: string) {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Webhooks</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Receive real-time notifications when events occur
          </p>
        </div>
        <Link href="/settings/webhooks/new">
          <Button><Plus className="h-4 w-4 mr-2" />Add Webhook</Button>
        </Link>
      </div>

      {webhooks.length === 0 ? (
        <Card className="bg-bg-surface/80">
          <CardContent className="p-12 text-center">
            <Webhook className="h-10 w-10 text-foreground-muted mx-auto mb-4" />
            <p className="text-foreground-muted mb-4">No webhooks configured yet.</p>
            <Link href="/settings/webhooks/new">
              <Button>Add your first webhook</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map((wh) => (
            <Card key={wh.id} className="bg-bg-surface/80">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono text-foreground break-all">{wh.url}</code>
                      <span
                        className={cn(
                          "shrink-0 px-2 py-0.5 text-xs rounded-full",
                          wh.active
                            ? "bg-indicator-active/10 text-indicator-active border border-indicator-active/30"
                            : "bg-bg-base text-foreground-muted border border-hairline"
                        )}
                      >
                        {wh.active ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {wh.events.map((e) => (
                        <span key={e} className="px-2 py-0.5 text-xs bg-bg-base border border-hairline rounded text-foreground-muted">
                          {EVENT_LABELS[e] ?? e}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-foreground-muted">
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        Last: {formatRelative(wh.lastDelivery)}
                      </span>
                      <span className={cn(wh.successRate >= 90 ? "text-indicator-active" : "text-indicator-stale")}>
                        {wh.successRate.toFixed(1)}% delivery
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/settings/webhooks/${wh.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-indicator-slashed"
                      onClick={() => deleteWebhook(wh.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
