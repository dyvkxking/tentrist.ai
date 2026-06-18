"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Webhook } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";

const AVAILABLE_EVENTS = [
  { id: "job.completed", label: "Job Completed" },
  { id: "job.failed", label: "Job Failed" },
  { id: "job.started", label: "Job Started" },
  { id: "job.cancelled", label: "Job Cancelled" },
  { id: "sla.breached", label: "SLA Breached" },
  { id: "credit.issued", label: "Credit Issued" },
  { id: "node.online", label: "Node Online" },
  { id: "node.slashed", label: "Node Slashed" },
];

export default function NewWebhookPage() {
  const router = useRouter();
  const [url, setUrl] = React.useState("");
  const [selectedEvents, setSelectedEvents] = React.useState<string[]>(["job.completed"]);
  const [isCreating, setIsCreating] = React.useState(false);

  function toggleEvent(id: string) {
    setSelectedEvents((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }

  async function handleCreate() {
    if (!url.trim() || selectedEvents.length === 0) return;
    setIsCreating(true);
    // In production, POST to backend to save webhook
    await new Promise((r) => setTimeout(r, 800));
    router.push("/settings/webhooks");
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <PageHeader
        title="Add Webhook"
        description="Configure an endpoint to receive real-time event notifications"
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Webhooks", href: "/settings/webhooks" },
          { label: "New" },
        ]}
      />

      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Endpoint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Webhook URL</label>
            <Input
              type="url"
              placeholder="https://api.example.com/tentrist/events"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-foreground-muted mt-1">
              POST requests will be sent to this URL with event payloads
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {AVAILABLE_EVENTS.map((evt) => (
              <label key={evt.id} className="flex items-center gap-3 p-3 rounded-lg border border-hairline hover:bg-bg-base/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selectedEvents.includes(evt.id)}
                  onChange={() => toggleEvent(evt.id)}
                  className="h-4 w-4 rounded border-border-hairline text-indicator-active focus:ring-indicator-active/50"
                />
                <span className="text-sm text-foreground">{evt.label}</span>
                <code className="text-xs font-mono text-foreground-muted ml-auto">{evt.id}</code>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href="/settings/webhooks">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button
          onClick={handleCreate}
          isLoading={isCreating}
          disabled={!url.trim() || selectedEvents.length === 0}
        >
          <Webhook className="h-4 w-4 mr-2" />
          Create Webhook
        </Button>
      </div>
    </div>
  );
}
