"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, Wallet, XCircle, CheckCircle } from "lucide-react";

export default function UnregisterNodePage() {
  const params = useParams();
  const router = useRouter();
  const nodeId = params.id as string;

  const [isUnregistering, setIsUnregistering] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleUnregister = async () => {
    setIsUnregistering(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsUnregistering(false);
    setIsSuccess(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push("/node/nodes");
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 max-w-md">
        <Link
          href="/node/nodes"
          className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Nodes
        </Link>

        <Card className="border-[#22c55e]/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-[#22c55e]" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Node Unregistered</h2>
            <p className="text-[#71717a]">
              Your node has been successfully removed from the Tentrist network.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Back link */}
      <Link
        href={`/node/nodes/${nodeId}/settings`}
        className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Unregister Node</h1>
        <p className="text-sm text-[#71717a] mt-1">
          Remove node {nodeId} from the Tentrist network
        </p>
      </div>

      {/* Warning Card */}
      <Card className="border-[#ef4444]/20 bg-[#ef4444]/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ef4444]/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-6 w-6 text-[#ef4444]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Are you sure?</h3>
              <p className="text-sm text-[#71717a] mt-2">
                This action will immediately stop all job assignments to this node. Consider
                this action carefully as it cannot be undone easily.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consequences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">What happens when you unregister:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-[#ef4444]" />
            <span className="text-sm text-white">No more job assignments to this node</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-[#ef4444]" />
            <span className="text-sm text-white">Heartbeat monitoring will stop</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[#22c55e]" />
            <span className="text-sm text-white">Your stake will remain locked until manually withdrawn</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[#22c55e]" />
            <span className="text-sm text-white">Historical earnings and reputation data will be preserved</span>
          </div>
        </CardContent>
      </Card>

      {/* Stake Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[#71717a]" />
              <span className="text-sm text-[#71717a]">Current Stake Balance</span>
            </div>
            <span className="text-lg font-bold font-mono text-white">12.5 ETH</span>
          </div>
          <p className="text-xs text-[#71717a] mt-2">
            Your stake will remain in escrow and can be withdrawn after a cooldown period.
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link href={`/node/nodes/${nodeId}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button
          variant="destructive"
          onClick={handleUnregister}
          isLoading={isUnregistering}
        >
          <XCircle className="h-4 w-4 mr-1" />
          Unregister Node
        </Button>
      </div>
    </div>
  );
}
