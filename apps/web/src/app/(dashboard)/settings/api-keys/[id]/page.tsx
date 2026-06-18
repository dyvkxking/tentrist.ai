"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Key, Copy, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { apiKeysApi } from "@/lib/supabase";

function formatDate(ts: string | null): string {
  if (!ts) return "Never";
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const MOCK_KEYS: Record<string, { name: string; prefix: string; created: string; lastUsed: string | null; permissions: string[] }> = {
  "key_001": { name: "Production API Key", prefix: "tentrist_prod", created: "2024-01-15T00:00:00Z", lastUsed: "2024-03-10T14:30:00Z", permissions: ["jobs:read", "jobs:write", "nodes:read"] },
  "key_002": { name: "Development Key", prefix: "tentrist_dev", created: "2024-02-20T00:00:00Z", lastUsed: null, permissions: ["jobs:read", "nodes:read"] },
};

export default function ApiKeyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const key = MOCK_KEYS[id as string] ?? { name: "Unknown Key", prefix: "—", created: "—", lastUsed: null, permissions: [] };

  async function handleRevoke() {
    setDeleting(true);
    try {
      await apiKeysApi.revoke(id as string);
      router.push("/settings/api-keys");
    } catch {
      setDeleting(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(key.prefix + "_...");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <PageHeader
        title={key.name}
        description="API key details"
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "API Keys", href: "/settings/api-keys" },
          { label: key.name },
        ]}
      />

      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Key Name", value: key.name },
            { label: "Key Prefix", value: key.prefix + "_..." },
            { label: "Created", value: formatDate(key.created) },
            { label: "Last Used", value: formatDate(key.lastUsed) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-hairline">
              <span className="text-foreground-muted">{label}</span>
              <span className="font-mono-data text-foreground">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {key.permissions.map((p) => (
              <span key={p} className="px-3 py-1 text-xs rounded-full border border-indicator-active/30 bg-indicator-active/10 text-indicator-active">
                {p}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-bg-surface/80 border-indicator-slashed/30">
        <CardHeader>
          <CardTitle className="text-indicator-slashed">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-foreground-muted">
            Revoking this key will immediately invalidate it. Any services using this key will lose access.
          </p>
          <Button
            variant="destructive"
            onClick={handleRevoke}
            isLoading={deleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Revoke Key
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Link href="/settings/api-keys">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to API Keys
          </Button>
        </Link>
      </div>
    </div>
  );
}
