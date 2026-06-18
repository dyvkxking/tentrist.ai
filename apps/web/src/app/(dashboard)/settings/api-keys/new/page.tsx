"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Key, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { useAuthStore } from "@/stores/auth-store";
import { apiKeysApi } from "@/lib/supabase";

const PERMISSIONS = [
  { id: "jobs:read", label: "Read Jobs" },
  { id: "jobs:write", label: "Write Jobs" },
  { id: "nodes:read", label: "Read Nodes" },
  { id: "nodes:write", label: "Write Nodes" },
];

export default function NewApiKeyPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [name, setName] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>(["jobs:read"]);
  const [isCreating, setIsCreating] = React.useState(false);
  const [createdKey, setCreatedKey] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function handleCreate() {
    if (!name.trim() || !user) return;
    setIsCreating(true);
    try {
      const result = await apiKeysApi.create(name);
      // The API returns the unhashed key once
      setCreatedKey((result as unknown as { key: string }).key ?? result.key_prefix + "_...");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch {
      setIsCreating(false);
    }
  }

  async function handleCopy() {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (createdKey) {
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto">
        <PageHeader
          title="API Key Created"
          description="Copy your new API key now — it will not be shown again"
        />
        <Card className="bg-bg-surface/80 border-indicator-active/30">
          <CardContent className="p-6 space-y-4">
            <div className="p-4 bg-bg-base rounded-lg border border-hairline">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-foreground-muted">Your API Key</span>
                <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-indicator-active hover:underline">
                  {copied ? <><Check className="h-3 w-3 mr-1" />Copied!</> : <><Copy className="h-3 w-3 mr-1" />Copy</>}
                </button>
              </div>
              <code className="text-sm font-mono break-all text-foreground">{createdKey}</code>
            </div>
            <p className="text-xs text-indicator-stale">
              Store this key securely. It will not be shown again.
            </p>
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Link href="/settings/api-keys">
            <Button>Done</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <PageHeader
        title="Create API Key"
        description="Generate a new API key for programmatic access"
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "API Keys", href: "/settings/api-keys" },
          { label: "New" },
        ]}
      />

      <Card className="bg-bg-surface/80">
        <CardHeader>
          <CardTitle>New API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Key Name</label>
            <Input
              placeholder="e.g., Production API Key"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Permissions</label>
            <div className="flex flex-wrap gap-2">
              {PERMISSIONS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-full border transition-colors",
                    selected.includes(p.id)
                      ? "border-indicator-active bg-indicator-active/10 text-indicator-active"
                      : "border-border-hairline text-foreground-muted hover:border-zinc-600"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Link href="/settings/api-keys">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleCreate} isLoading={isCreating} disabled={!name.trim()}>
              <Key className="h-4 w-4 mr-2" />
              Generate Key
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
