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

interface Contract {
  name: string;
  address: string;
  network: string;
  lastUpdated: number;
}

function generateMockContracts(): Contract[] {
  return [
    {
      name: "Escrow",
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      network: "Ethereum Mainnet",
      lastUpdated: Date.now() - 2 * 60 * 60 * 1000,
    },
    {
      name: "SLAContract",
      address: "0x862964cE01621d2F447D1A4d5d7dE0286FA8918f",
      network: "Ethereum Mainnet",
      lastUpdated: Date.now() - 5 * 60 * 60 * 1000,
    },
    {
      name: "SlashManager",
      address: "0x3d9dCB725C5B078cC8d2E8a4f4C7bD9e5f6a8b7c",
      network: "Ethereum Mainnet",
      lastUpdated: Date.now() - 1 * 60 * 60 * 1000,
    },
    {
      name: "ReputationLedger",
      address: "0xfedc0987654321abcdef0123456789abcdef0123",
      network: "Ethereum Mainnet",
      lastUpdated: Date.now() - 3 * 60 * 60 * 1000,
    },
    {
      name: "Governance",
      address: "0x2468ace13579bdfc0246f8db9310019283746fab",
      network: "Ethereum Mainnet",
      lastUpdated: Date.now() - 24 * 60 * 60 * 1000,
    },
  ];
}

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
  const [contracts] = React.useState<Contract[]>(generateMockContracts());

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
