"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  ExternalLink,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RequireAuth } from "@/components/providers/require-auth";
import { adminListContracts } from "@/lib/supabase-admin";

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function AdminContractsPage() {
  return (
    <RequireAuth requiredRole="admin">
      <AdminContractsContent />
    </RequireAuth>
  );
}

function AdminContractsContent() {
  const [contracts, setContracts] = React.useState<any[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    adminListContracts()
      .then((data) => {
        setContracts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load contracts");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="h-8 w-64 bg-bg-surface rounded animate-pulse" />
            <div className="h-4 w-48 bg-bg-surface rounded animate-pulse mt-1" />
          </div>
        </div>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-0">
            <div className="space-y-4 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-bg-base rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="bg-bg-surface/80 border-indicator-slashed">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-indicator-slashed">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!contracts) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Deployed Contracts
          </h1>
          <p className="text-sm text-foreground-muted">
            Read-only view of all platform smart contracts — {contracts.length} contracts
          </p>
        </div>
        <Badge variant="outline" className="text-indicator-active">
          <FileText className="h-3 w-3 mr-1" />
          {contracts.length} Deployed
        </Badge>
      </div>

      {/* Contracts Table */}
      <Card className="bg-bg-surface/80">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Contract
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Address
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Network
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {contracts.map((contract) => (
                  <tr key={contract.name} className="hover:bg-bg-base/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-foreground-muted" />
                        <span className="text-sm font-medium text-foreground">
                          {contract.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono-data bg-bg-base px-2 py-1 rounded text-indicator-active">
                          {contract.address}
                        </code>
                        <a
                          href={`https://etherscan.io/address/${contract.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground-muted hover:text-indicator-active"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" size="sm">
                        {contract.network}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-foreground-muted">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(contract.lastUpdated)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/contracts/${contract.name.toLowerCase()}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
