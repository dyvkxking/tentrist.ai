"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  User,
  Eye,
  CheckCircle2,
  XCircle,
  Server,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RequireAuth } from "@/components/providers/require-auth";
import { adminListUsers } from "@/lib/supabase-admin";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

interface User {
  address: string;
  type: "client" | "provider";
  jobsSubmitted: number;
  nodesRegistered: number;
  totalSpend: number;
  totalEarned: number;
  joinedAt: number;
  status: "active" | "suspended";
}

interface ProfileRow {
  id: string;
  wallet_address: string;
  user_type: string;
  status: string;
  created_at: string;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminUsersPage() {
  return (
    <RequireAuth requiredRole="admin">
      <AdminUsersContent />
    </RequireAuth>
  );
}

function AdminUsersContent() {
  const [users, setUsers] = React.useState<User[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    adminListUsers(100)
      .then((profiles: ProfileRow[]) => {
        const mapped: User[] = profiles.map((p) => ({
          address: p.wallet_address,
          type: p.user_type as "client" | "provider",
          jobsSubmitted: 0,
          nodesRegistered: 0,
          totalSpend: 0,
          totalEarned: 0,
          joinedAt: new Date(p.created_at).getTime(),
          status: p.status as "active" | "suspended",
        }));
        setUsers(mapped);
      })
      .catch((err) => {
        setError(err.message || "Failed to load users");
      });
  }, []);

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="bg-bg-surface/80 p-6">
          <div className="flex items-center gap-3 text-indicator-slashed">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm">{error}</span>
          </div>
        </Card>
      </div>
    );
  }

  if (!users) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-bg-surface/80">
              <CardContent className="p-4">
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-0 px-4 py-3">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const clientCount = users.filter((u) => u.type === "client").length;
  const providerCount = users.filter((u) => u.type === "provider").length;
  const totalVolume = users.reduce((sum, u) => sum + u.totalSpend + u.totalEarned, 0);

  const filteredUsers = users.filter((user) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!user.address.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Registered Users
          </h1>
          <p className="text-sm text-foreground-muted">
            All registered wallets — clients and providers — {filteredUsers.length} users
          </p>
        </div>
        <Badge variant="outline" className="text-indicator-active">
          <User className="h-3 w-3 mr-1" />
          {users.length} Wallets
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data">{users.length}</div>
            <div className="text-xs text-foreground-muted">Total Users</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data text-indicator-active">
              {clientCount}
            </div>
            <div className="text-xs text-foreground-muted">Clients</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data text-blue-400">
              {providerCount}
            </div>
            <div className="text-xs text-foreground-muted">Providers</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data">
              {totalVolume.toFixed(1)} ETH
            </div>
            <div className="text-xs text-foreground-muted">Total Volume</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-bg-surface/80">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                type="search"
                placeholder="Search by wallet address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-bg-surface/80">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Address
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Jobs / Nodes
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Spend / Earned
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredUsers.map((user) => (
                  <tr key={user.address} className="hover:bg-bg-base/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-foreground-muted" />
                        <span className="text-xs font-mono-data text-foreground">
                          {user.address.slice(0, 8)}...{user.address.slice(-6)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          user.type === "client"
                            ? "bg-indicator-active/10 text-indicator-active border-indicator-active/30"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        )}
                      >
                        {user.type === "client" ? (
                          <><Briefcase className="h-3 w-3 mr-1" />Client</>
                        ) : (
                          <><Server className="h-3 w-3 mr-1" />Provider</>
                        )}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-xs font-mono-data">
                        <span className="text-foreground">{user.jobsSubmitted}</span>
                        <span className="text-foreground-muted">/</span>
                        <span className="text-blue-400">{user.nodesRegistered}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 text-xs font-mono-data">
                        {user.totalSpend > 0 ? (
                          <span className="text-indicator-stale">{user.totalSpend.toFixed(1)} ETH</span>
                        ) : (
                          <span className="text-indicator-active">{user.totalEarned.toFixed(1)} ETH</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground-muted">
                        {formatDate(user.joinedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.status === "active" ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="h-3 w-3 mr-0.5" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="sm">
                          <XCircle className="h-3 w-3 mr-0.5" />
                          Suspended
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${user.address}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
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
