"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Webhook, RefreshCw, Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

interface DeliveryAttempt {
  id: string;
  timestamp: number;
  status: "success" | "failed";
  responseCode: number;
  duration: number;
  error?: string;
}

const EVENT_LABELS: Record<string, string> = {
  "job.completed": "Job Completed",
  "job.failed": "Job Failed",
  "sla.breached": "SLA Breached",
};

const MOCK_WH: Record<string, { url: string; events: string[]; active: boolean; deliveries: DeliveryAttempt[] }> = {
  "wh_001": {
    url: "https://api.myapp.com/tentrist/events",
    events: ["job.completed", "job.failed", "sla.breached"],
    active: true,
    deliveries: [
      { id: "dl_001", timestamp: Date.now() - 3600000, status: "success", responseCode: 200, duration: 142 },
      { id: "dl_002", timestamp: Date.now() - 7200000, status: "success", responseCode: 200, duration: 118 },
      { id: "dl_003", timestamp: Date.now() - 86400000, status: "failed", responseCode: 503, duration: 5000, error: "Service Unavailable" },
    ],
  },
};

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function WebhookDetailPage() {
  const { id } = useParams();
  const wh = MOCK_WH[id as string] ?? { url: "https://example.com/webhook", events: [], active: false, deliveries: [] };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <PageHeader
        title="Webhook Detail"
        description={wh.url}
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Webhooks", href: "/settings/webhooks" },
          { label: "Detail" },
        ]}
      />

      {/* Config */}
      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between py-2 border-b border-hairline">
            <span className="text-foreground-muted">URL</span>
            <code className="text-sm font-mono text-foreground">{wh.url}</code>
          </div>
          <div className="flex justify-between py-2 border-b border-hairline">
            <span className="text-foreground-muted">Status</span>
            <span className={cn("text-sm font-medium", wh.active ? "text-indicator-active" : "text-foreground-muted")}>
              {wh.active ? "Active" : "Disabled"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {wh.events.map((e) => (
              <span key={e} className="px-2 py-0.5 text-xs bg-bg-base border border-hairline rounded text-foreground-muted">
                {EVENT_LABELS[e] ?? e}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Log */}
      <Card className="bg-bg-surface/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Deliveries</CardTitle>
            <Link href={`/settings/webhooks/${id}/test`}>
              <Button variant="ghost" size="sm">Send Test</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {wh.deliveries.length === 0 ? (
            <p className="text-sm text-foreground-muted text-center py-6">No delivery attempts yet.</p>
          ) : (
            <div className="space-y-2">
              {wh.deliveries.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-3 bg-bg-base rounded-lg border border-hairline">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", d.status === "success" ? "bg-indicator-active/10" : "bg-indicator-slashed/10")}>
                    {d.status === "success" ? <Check className="h-4 w-4 text-indicator-active" /> : <X className="h-4 w-4 text-indicator-slashed" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-foreground">{d.responseCode}</span>
                      <span className="text-xs text-foreground-muted">{formatTimestamp(d.timestamp)}</span>
                      {d.error && <span className="text-xs text-indicator-slashed">{d.error}</span>}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-foreground-muted shrink-0">{d.duration}ms</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-bg-surface/80 border-indicator-slashed/30">
        <CardHeader>
          <CardTitle className="text-indicator-slashed">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-foreground-muted">Permanently delete this webhook endpoint.</p>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Webhook
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Link href="/settings/webhooks">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Webhooks
          </Button>
        </Link>
      </div>
    </div>
  );
}
