"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Scale,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Server,
  FileText,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RequireAuth } from "@/components/providers/require-auth";
import { adminGetDispute } from "@/lib/supabase-admin";

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDisputeDetailPage() {
  const params = useParams();
  const disputeId = params.id as string;

  return (
    <RequireAuth requiredRole="admin">
      <AdminDisputeDetailContent disputeId={disputeId} />
    </RequireAuth>
  );
}

interface AdminDisputeDetailContentProps {
  disputeId: string;
}

function AdminDisputeDetailContent({ disputeId }: AdminDisputeDetailContentProps) {
  const [dispute, setDispute] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [adminNotes, setAdminNotes] = React.useState("");

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await adminGetDispute(disputeId);
        setDispute(data);
        setAdminNotes(data.admin_notes || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dispute");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [disputeId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-12 w-64 bg-bg-base rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-48 bg-bg-surface/80 rounded" />
          <div className="h-48 bg-bg-surface/80 rounded" />
        </div>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="flex flex-col gap-4">
        <div className="p-8 text-center text-indicator-slashed">
          {error || "Dispute not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/admin/slashing/disputes">
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-1">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Dispute: {dispute.id}
              </h1>
              <Badge
                variant={dispute.status === "pending" ? "warning" : dispute.status === "resolved" ? "success" : "danger"}
              >
                {dispute.status}
              </Badge>
            </div>
            <p className="text-sm text-foreground-muted">
              Filed {formatDate(dispute.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Slash Event Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4 text-indicator-slashed" />
              Slash Event
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Event ID</span>
                <span className="font-mono-data text-foreground">{dispute.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Slash Amount</span>
                <span className="font-mono-data text-indicator-slashed font-semibold">
                  -{dispute.slash_amount.toFixed(3)} ETH
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Reason</span>
                <span className="text-foreground">{dispute.reason}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Created</span>
                <span className="text-foreground">{formatDate(dispute.created_at)}</span>
              </div>
            </div>

            {dispute.tx_hash && (
              <div className="pt-3 border-t border-hairline">
                <div className="text-xs text-foreground-muted mb-1">On-Chain Reference</div>
                <div className="p-2 bg-bg-base rounded font-mono-data text-xs text-indicator-active">
                  {dispute.tx_hash}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Node Info */}
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4 text-foreground-muted" />
              Node Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Node ID</span>
                <Link href={`/admin/nodes/${dispute.node_id}`}>
                  <span className="font-mono-data text-indicator-active hover:underline cursor-pointer">
                    {dispute.node_id}
                  </span>
                </Link>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Operator Address</span>
                <span className="font-mono-data text-xs text-foreground">
                  {dispute.node_address.slice(0, 8)}...{dispute.node_address.slice(-6)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-hairline">
              <div className="text-xs text-foreground-muted mb-2">SLA Breach Details</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-bg-base rounded text-center">
                  <div className="text-xs text-foreground-muted">Uptime</div>
                  <div className="font-mono-data text-sm">
                    {dispute.sla_details.actual_uptime.toFixed(1)}%
                    <span className="text-indicator-slashed text-xs">
                      {" "}/ {dispute.sla_details.required_uptime}%
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-bg-base rounded text-center">
                  <div className="text-xs text-foreground-muted">Throughput</div>
                  <div className="font-mono-data text-sm">
                    {dispute.sla_details.actual_throughput}
                    <span className="text-indicator-slashed text-xs">
                      {" "}/ {dispute.sla_details.required_throughput}
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-bg-base rounded text-center col-span-2">
                  <div className="text-xs text-foreground-muted">Missed Heartbeats</div>
                  <div className="font-mono-data text-indicator-slashed">
                    {dispute.sla_details.missed_heartbeats}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Info */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-foreground-muted" />
            Job Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-xs text-foreground-muted">Job ID</div>
                <Link href={`/admin/jobs/${dispute.job_id}`}>
                  <span className="text-sm font-mono-data text-indicator-active hover:underline cursor-pointer">
                    {dispute.job_id}
                  </span>
                </Link>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/jobs/${dispute.job_id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  View Job
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resolution Actions */}
      {dispute.status === "pending" && (
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-foreground-muted" />
              Admin Notes & Resolution
            </CardTitle>
            <CardDescription>
              Review the dispute and record your decision
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Internal Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add administrative notes about this dispute..."
                className={cn(
                  "w-full h-24 rounded-md border bg-bg-base px-3 py-2 text-sm",
                  "border-border-hairline focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-indicator-active/50"
                )}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 gap-2">
                <XCircle className="h-4 w-4" />
                Resolve: Reject Slash (Refund Node)
              </Button>
              <Button variant="destructive" className="flex-1 gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Resolve: Approve Slash
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* On-Chain Data Reference */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-foreground-muted" />
            On-Chain Data Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-bg-base rounded-lg border border-hairline">
            <div className="space-y-2 font-mono-data text-xs">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Contract:</span>
                <span className="text-indicator-active">SlashManager.sol</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Event:</span>
                <span className="text-foreground">NodeSlashed(bytes32 jobId, address node, uint256 amount)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Transaction:</span>
                <span className="text-indicator-active">{dispute.tx_hash || "Pending"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Block:</span>
                <span className="text-foreground">18,450,234</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
