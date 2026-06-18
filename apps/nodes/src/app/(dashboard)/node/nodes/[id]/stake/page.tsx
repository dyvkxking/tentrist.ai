"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Clock, DollarSign } from "lucide-react";

const mockStakeData = {
  currentStake: "12.5 ETH",
  minimumThreshold: "1.0 ETH",
  availableToWithdraw: "11.5 ETH",
  totalDeposited: "15.0 ETH",
  totalWithdrawn: "2.5 ETH",
  recentChanges: [
    { id: "1", amount: "-0.5 ETH", type: "withdrawal", timestamp: "2 hours ago", txHash: "0xabc123..." },
    { id: "2", amount: "+3.0 ETH", type: "deposit", timestamp: "1 day ago", txHash: "0xdef456..." },
    { id: "3", amount: "+2.5 ETH", type: "deposit", timestamp: "3 days ago", txHash: "0xghi789..." },
    { id: "4", amount: "-1.0 ETH", type: "withdrawal", timestamp: "5 days ago", txHash: "0xjkl012..." },
    { id: "5", amount: "+6.0 ETH", type: "deposit", timestamp: "1 week ago", txHash: "0xmno345..." },
  ],
};

export default function StakeManagementPage() {
  const params = useParams();
  const nodeId = params.id as string;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/node/nodes/${nodeId}`}
        className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Node Overview
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Stake Management</h1>
        <p className="text-sm text-[#71717a] mt-1">
          Manage collateral for node {nodeId}
        </p>
      </div>

      {/* Stake Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-[#22c55e]/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#71717a]">Current Stake</p>
                <p className="text-3xl font-bold font-mono text-white mt-1">
                  {mockStakeData.currentStake}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-[#22c55e]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#71717a]">Minimum Threshold</p>
                <p className="text-3xl font-bold font-mono text-white mt-1">
                  {mockStakeData.minimumThreshold}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#f59e0b]/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-[#f59e0b]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#71717a]">Available to Withdraw</p>
                <p className="text-3xl font-bold font-mono text-[#22c55e] mt-1">
                  {mockStakeData.availableToWithdraw}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[#22c55e]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href={`/node/nodes/${nodeId}/stake/deposit`}>
          <Button variant="default">
            <DollarSign className="h-4 w-4 mr-1" />
            Deposit
          </Button>
        </Link>
        <Link href={`/node/nodes/${nodeId}/stake/withdraw`}>
          <Button variant="outline">
            <Wallet className="h-4 w-4 mr-1" />
            Withdraw
          </Button>
        </Link>
      </div>

      {/* Warning */}
      <Card className="border-[#f59e0b]/20 bg-[#f59e0b]/5">
        <CardContent className="p-4">
          <p className="text-sm text-[#f59e0b]">
            <strong>Note:</strong> Minimum stake of {mockStakeData.minimumThreshold} must be maintained to
            remain eligible for workloads. Withdrawing below this threshold will pause job assignments.
          </p>
        </CardContent>
      </Card>

      {/* Recent Stake Changes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-[#71717a]" />
            Recent Stake Changes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left text-xs text-[#71717a] font-medium px-6 py-3">
                  Amount
                </th>
                <th className="text-left text-xs text-[#71717a] font-medium px-4 py-3">
                  Type
                </th>
                <th className="text-left text-xs text-[#71717a] font-medium px-4 py-3">
                  Timestamp
                </th>
                <th className="text-right text-xs text-[#71717a] font-medium px-6 py-3">
                  Transaction
                </th>
              </tr>
            </thead>
            <tbody>
              {mockStakeData.recentChanges.map((change) => (
                <tr
                  key={change.id}
                  className="border-b border-[#27272a] last:border-0"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-mono ${
                        change.type === "deposit"
                          ? "text-[#22c55e]"
                          : "text-[#ef4444]"
                      }`}
                    >
                      {change.amount}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        change.type === "deposit"
                          ? "bg-[#22c55e]/10 text-[#22c55e]"
                          : "bg-[#ef4444]/10 text-[#ef4444]"
                      }`}
                    >
                      {change.type.charAt(0).toUpperCase() + change.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-[#71717a] font-mono">
                      {change.timestamp}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-[#71717a] font-mono">
                      {change.txHash}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
