"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

const SAMPLE_PAYLOADS: Record<string, object> = {
  "job.completed": {
    event: "job.completed",
    timestamp: Date.now(),
    job_id: "job_8a3f2e1c4d",
    status: "completed",
    completed_at: new Date().toISOString(),
  },
  "job.failed": {
    event: "job.failed",
    timestamp: Date.now(),
    job_id: "job_9b4d3e2f5a",
    status: "failed",
    reason: "Node disconnected",
  },
  "sla.breached": {
    event: "sla.breached",
    timestamp: Date.now(),
    job_id: "job_0c5f4a3b2d",
    breach_type: "uptime",
    required: 99.0,
    actual: 97.5,
    credit_issued: "0.001 ETH",
  },
};

export default function TestWebhookPage() {
  const { id } = useParams();
  const router = useRouter();
  const [eventType, setEventType] = React.useState("job.completed");
  const [sending, setSending] = React.useState(false);
  const [result, setResult] = React.useState<{ ok: boolean; status: number; duration: number } | null>(null);

  async function handleSend() {
    setSending(true);
    setResult(null);
    try {
      // Simulate sending a test payload
      await new Promise((r) => setTimeout(r, 1200));
      setResult({ ok: true, status: 200, duration: 187 });
    } catch {
      setResult({ ok: false, status: 500, duration: 0 });
    } finally {
      setSending(false);
    }
  }

  const payload = SAMPLE_PAYLOADS[eventType] ?? {};

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <PageHeader
        title="Send Test Payload"
        description="Send a sample webhook payload to verify your endpoint"
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Webhooks", href: "/settings/webhooks" },
          { label: "Test" },
        ]}
      />

      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Event Type</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full px-3 py-2 bg-bg-base border border-hairline rounded-lg text-sm text-foreground focus:outline-none focus:border-indicator-active"
          >
            <option value="job.completed">Job Completed</option>
            <option value="job.failed">Job Failed</option>
            <option value="sla.breached">SLA Breached</option>
          </select>
        </CardContent>
      </Card>

      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Payload Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs font-mono text-foreground-muted bg-bg-base p-4 rounded-lg overflow-auto max-h-48">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {result && (
        <Card className={cn("bg-bg-surface/80", result.ok ? "border-indicator-active/30" : "border-indicator-slashed/30")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {result.ok ? (
                <div className="w-8 h-8 rounded-full bg-indicator-active/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-indicator-active" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-indicator-slashed/10 flex items-center justify-center">
                  <span className="text-indicator-slashed text-sm font-bold">!</span>
                </div>
              )}
              <div>
                <p className={cn("text-sm font-medium", result.ok ? "text-indicator-active" : "text-indicator-slashed")}>
                  {result.ok ? `Delivered — ${result.status}` : `Failed — ${result.status}`}
                </p>
                <p className="text-xs text-foreground-muted font-mono">{result.duration}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Link href={`/settings/webhooks/${id}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={handleSend} isLoading={sending}>
          {sending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {sending ? "Sending…" : "Send Test Payload"}
        </Button>
      </div>
    </div>
  );
}
