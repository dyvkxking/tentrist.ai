"use client";

import * as React from "react";
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  MoreHorizontal,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: number;
  lastUsed: number | null;
  permissions: string[];
}

function generateMockApiKeys(): ApiKey[] {
  return [
    {
      id: "key_001",
      name: "Production API Key",
      key: "tentrist_prod_a1b2c3d4e5f6g7h8i9j0",
      createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
      lastUsed: Date.now() - 2 * 60 * 60 * 1000,
      permissions: ["jobs:read", "jobs:write", "nodes:read"],
    },
    {
      id: "key_002",
      name: "Development Key",
      key: "tentrist_dev_x1y2z3a4b5c6d7e8f9g0",
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      lastUsed: null,
      permissions: ["jobs:read", "nodes:read"],
    },
  ];
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) return "Never";
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>(generateMockApiKeys());
  const [showNewKey, setShowNewKey] = React.useState(false);
  const [newKeyName, setNewKeyName] = React.useState("");
  const [revealedKeys, setRevealedKeys] = React.useState<Set<string>>(new Set());
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>(["jobs:read"]);

  const allPermissions = [
    { id: "jobs:read", label: "Read Jobs" },
    { id: "jobs:write", label: "Write Jobs" },
    { id: "nodes:read", label: "Read Nodes" },
    { id: "nodes:write", label: "Write Nodes" },
  ];

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const toggleReveal = (keyId: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) {
        next.delete(keyId);
      } else {
        next.add(keyId);
      }
      return next;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const deleteKey = (keyId: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
  };

  const createKey = () => {
    if (!newKeyName.trim()) return;
    const newKey: ApiKey = {
      id: `key_${Math.random().toString(36).slice(2, 8)}`,
      name: newKeyName,
      key: `tentrist_new_${Math.random().toString(36).slice(2, 20)}`,
      createdAt: Date.now(),
      lastUsed: null,
      permissions: [...selectedPermissions],
    };
    setApiKeys((prev) => [newKey, ...prev]);
    setNewKeyName("");
    setSelectedPermissions(["jobs:read"]);
    setShowNewKey(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            API Keys
          </h1>
          <p className="text-sm text-foreground-muted">
            Manage API keys for programmatic access
          </p>
        </div>
        <Button onClick={() => setShowNewKey(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Key
        </Button>
      </div>

      {/* New Key Form */}
      {showNewKey && (
        <Card className="bg-bg-surface/80 border-indicator-active/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Create New API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Key Name"
              placeholder="e.g., Production API Key"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Permissions
              </label>
              <div className="flex flex-wrap gap-2">
                {allPermissions.map((perm) => (
                  <button
                    key={perm.id}
                    onClick={() => togglePermission(perm.id)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-full border transition-colors",
                      selectedPermissions.includes(perm.id)
                        ? "border-indicator-active bg-indicator-active/10 text-indicator-active"
                        : "border-border-hairline text-foreground-muted hover:border-zinc-600"
                    )}
                  >
                    {perm.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNewKey(false)}>
                Cancel
              </Button>
              <Button onClick={createKey} disabled={!newKeyName.trim()}>
                <Key className="h-4 w-4 mr-2" />
                Create Key
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Your API Keys</CardTitle>
          <CardDescription>
            Keep your API keys secure. They provide full access to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-hairline">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="p-4 hover:bg-bg-base/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {apiKey.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {apiKey.permissions.length} permissions
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-xs font-mono-data text-foreground-muted bg-bg-base px-2 py-1 rounded">
                        {revealedKeys.has(apiKey.id)
                          ? apiKey.key
                          : `${apiKey.key.slice(0, 20)}...`}
                      </code>
                      <button
                        onClick={() => toggleReveal(apiKey.id)}
                        className="p-1 hover:bg-bg-base rounded transition-colors"
                      >
                        {revealedKeys.has(apiKey.id) ? (
                          <EyeOff className="h-3.5 w-3.5 text-foreground-muted" />
                        ) : (
                          <Eye className="h-3.5 w-3.5 text-foreground-muted" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(apiKey.key)}
                        className="p-1 hover:bg-bg-base rounded transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5 text-foreground-muted" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-foreground-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created {formatDate(apiKey.createdAt)}
                      </span>
                      <span>
                        Last used {formatRelativeTime(apiKey.lastUsed)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-indicator-slashed hover:text-indicator-slashed"
                    onClick={() => deleteKey(apiKey.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
