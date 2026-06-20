"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FileText,
  ChevronLeft,
  ExternalLink,
  Eye,
  Edit3,
  RefreshCw,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequireAuth } from "@/components/providers/require-auth";
import { adminGetContract } from "@/lib/supabase-admin";

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function AdminContractDetailPage() {
  const params = useParams();
  const contractName = params.name as string;

  return (
    <RequireAuth requiredRole="admin">
      <AdminContractDetailContent contractName={contractName} />
    </RequireAuth>
  );
}

interface AdminContractDetailContentProps {
  contractName: string;
}

function AdminContractDetailContent({ contractName }: AdminContractDetailContentProps) {
  const [contract, setContract] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("read");

  React.useEffect(() => {
    adminGetContract(contractName)
      .then((data) => {
        setContract(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load contract");
        setLoading(false);
      });
  }, [contractName]);

  const displayName = contractName.charAt(0).toUpperCase() + contractName.slice(1);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-8 w-8 bg-bg-surface rounded animate-pulse" />
            <div className="flex flex-col gap-1">
              <div className="h-8 w-48 bg-bg-surface rounded animate-pulse" />
              <div className="h-4 w-64 bg-bg-surface rounded animate-pulse mt-1" />
            </div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-bg-surface rounded animate-pulse" />
          ))}
        </div>
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

  if (!contract) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/admin/contracts">
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-1">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {displayName}.sol
              </h1>
              <Badge variant="outline" className="text-indicator-active">
                <FileText className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>
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
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync
          </Button>
        </div>
      </div>

      {/* Contract Info */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-xs text-foreground-muted mb-1">Network</div>
            <div className="text-sm font-medium">{contract.network}</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-xs text-foreground-muted mb-1">Contract Address</div>
            <div className="text-xs font-mono-data truncate">{contract.address}</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-xs text-foreground-muted mb-1">Last Synced</div>
            <div className="flex items-center gap-1 text-sm text-indicator-active">
              <Clock className="h-3 w-3" />
              <span>Just now</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Read/Write Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-bg-surface border border-hairline">
          <TabsTrigger value="read" className="gap-2">
            <Eye className="h-4 w-4" />
            Read
          </TabsTrigger>
          <TabsTrigger value="write" disabled className="gap-2">
            <Edit3 className="h-4 w-4" />
            Write
          </TabsTrigger>
        </TabsList>

        <TabsContent value="read" className="mt-4">
          <Card className="bg-bg-surface/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Current Parameter Values</CardTitle>
              <CardDescription>
                Live values read directly from the contract
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-hairline">
                {contract.parameters.map((param: { name: string; value: string; type: string }) => (
                  <div key={param.name} className="flex items-center justify-between p-4 hover:bg-bg-base/50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-foreground">{param.name}</div>
                      <div className="text-xs text-foreground-muted font-mono-data">{param.type}</div>
                    </div>
                    <div className="text-sm font-mono-data text-indicator-active">
                      {param.value}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="write" className="mt-4">
          <Card className="bg-bg-surface/80">
            <CardContent className="p-8 text-center">
              <Edit3 className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
              <p className="text-sm text-foreground-muted">
                Write operations are disabled for read-only admin view.
                <br />
                Use a wallet connection to interact with this contract.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contract ABI Reference */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Contract ABI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-bg-base rounded-lg border border-hairline overflow-x-auto">
            <pre className="text-xs font-mono-data text-foreground-muted whitespace-pre-wrap">
{`[
  {
    "inputs": [],
    "name": "slashPercentage",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minStake",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "node", "type": "address" }],
    "name": "slashNode",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
