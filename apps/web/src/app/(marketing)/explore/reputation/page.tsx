"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReputationBadge } from "@/components/ui/ReputationBadge";
import { PageHeader } from "@/components/shared/page-header";

const LEADERS = [
  { rank: 1, address: "0xEfA2b4C8d3E9F1a6B7", score: 215, tier: "gold", stake: "5.0 ETH", region: "us-west-2" },
  { rank: 2, address: "0x4A5e9F2c1D8b3A7e6f", score: 142, tier: "gold", stake: "2.5 ETH", region: "us-east-1" },
  { rank: 3, address: "0xBcD1a3F9e2B7c8D4e5", score: 87, tier: "silver", stake: "1.2 ETH", region: "eu-west-1" },
  { rank: 4, address: "0x9A8b7C6d5e4F3a2B1c", score: 64, tier: "silver", stake: "1.0 ETH", region: "ap-southeast-1" },
  { rank: 5, address: "0x1A2b3C4d5e6F7a8B9c", score: 43, tier: "bronze", stake: "0.8 ETH", region: "us-east-1" },
];

export default function ReputationLeaderboardPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <PageHeader title="Reputation Leaderboard" description="Top nodes ranked by reputation score" />

      <Card className="bg-bg-surface/80">
        <CardContent className="p-0">
          <div className="divide-y divide-hairline">
            {LEADERS.map((n) => (
              <Link
                key={n.rank}
                href={`/explore/nodes/${n.address}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-bg-base/30 transition-colors"
              >
                <span className="w-8 text-center font-mono text-foreground-muted font-bold">{n.rank}</span>
                <ReputationBadge score={n.score} />
                <code className="text-sm font-mono text-foreground flex-1">{n.address.slice(0, 12)}…</code>
                <span className="text-sm font-mono text-foreground-muted">{n.stake}</span>
                <span className="text-sm text-foreground-muted">{n.region}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
