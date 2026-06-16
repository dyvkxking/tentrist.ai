"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Server,
  DollarSign,
  Activity,
  Shield,
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronRight,
  Scale,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/providers/require-auth";

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function AdminPage() {
  return (
    <RequireAuth requiredRole="admin">
      <AdminDashboard />
    </RequireAuth>
  );
}

function AdminDashboard() {
  // Mock stats
  const stats = {
    totalUsers: 1247,
    totalJobs: 8934,
    totalNodes: 312,
    totalSlashed: 47.8,
    pendingSlashes: 5,
    activeJobs: 89,
  };

  // Mock recent activity
  const recentActivity = [
    { type: "user_signup", message: "New user registered: neuralforge", timestamp: Date.now() - 300000 },
    { type: "slash", message: "Node node_0087 slashed 0.45 ETH for SLA breach", timestamp: Date.now() - 1800000 },
    { type: "job_submit", message: "Large job submitted: 50 nodes required", timestamp: Date.now() - 3600000 },
    { type: "node_register", message: "New node registered in eu-west-1", timestamp: Date.now() - 7200000 },
    { type: "dispute", message: "Node node_0056 filed dispute for checkpoint miss", timestamp: Date.now() - 10800000 },
  ];

  const activityIcons = {
    user_signup: <UserCheck className="h-4 w-4 text-indicator-active" />,
    slash: <Scale className="h-4 w-4 text-indicator-slashed" />,
    job_submit: <Server className="h-4 w-4 text-blue-400" />,
    node_register: <Activity className="h-4 w-4 text-indicator-stale" />,
    dispute: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Admin Panel
          </h1>
          <p className="text-sm text-foreground-muted">
            System overview and administrative controls
          </p>
        </div>
        <Badge variant="outline" className="text-indicator-active">
          <Shield className="h-3 w-3 mr-1" />
          Administrator
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          trend="up"
          trendValue="+12%"
          glowColor="active"
          className="bg-bg-surface/80"
        />
        <MetricCard
          label="Total Jobs"
          value={stats.totalJobs.toLocaleString()}
          trend="up"
          trendValue="+8.3%"
          glowColor="active"
          className="bg-bg-surface/80"
        />
        <MetricCard
          label="Active Nodes"
          value={stats.activeJobs.toString()}
          trend="neutral"
          trendValue={`of ${stats.totalNodes}`}
          glowColor="none"
          className="bg-bg-surface/80"
        />
        <MetricCard
          label="Total Slashed"
          value={`${stats.totalSlashed} ETH`}
          trend="down"
          trendValue="pending: 5"
          glowColor="slashed"
          className="bg-bg-surface/80"
        />
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/users">
          <Card className="bg-bg-surface/80 hover:border-zinc-700 transition-all cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      User Management
                    </div>
                    <div className="text-xs text-foreground-muted">
                      Manage users and roles
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-foreground-muted" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/slashing">
          <Card className="bg-bg-surface/80 hover:border-zinc-700 transition-all cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indicator-slashed/10 rounded-lg">
                    <Scale className="h-5 w-5 text-indicator-slashed" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      Slashing Review
                    </div>
                    <div className="text-xs text-indicator-stale">
                      {stats.pendingSlashes} pending disputes
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-foreground-muted" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indicator-active/10 rounded-lg">
                  <Activity className="h-5 w-5 text-indicator-active" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    System Status
                  </div>
                  <div className="text-xs text-indicator-active">
                    All systems operational
                  </div>
                </div>
              </div>
              <Badge variant="success" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Healthy
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-indicator-stale" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-hairline">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 hover:bg-bg-base/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-bg-base rounded">
                    {activityIcons[activity.type as keyof typeof activityIcons]}
                  </div>
                  <span className="text-sm text-foreground">
                    {activity.message}
                  </span>
                </div>
                <span className="text-xs text-foreground-muted">
                  {formatRelativeTime(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Network Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-muted">Active Nodes</span>
              <span className="text-sm font-mono-data text-indicator-active">
                {stats.totalNodes - 23} / {stats.totalNodes}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-muted">Avg Uptime (24h)</span>
              <span className="text-sm font-mono-data text-indicator-active">97.8%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-muted">Slash Rate</span>
              <span className="text-sm font-mono-data text-indicator-stale">2.3%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-muted">Dispute Rate</span>
              <span className="text-sm font-mono-data text-amber-400">0.8%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-muted">Total Staked</span>
              <span className="text-sm font-mono-data">12,847.32 ETH</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-muted">Total Slashed</span>
              <span className="text-sm font-mono-data text-indicator-slashed">
                {stats.totalSlashed} ETH
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-muted">Slash Override Rate</span>
              <span className="text-sm font-mono-data text-amber-400">12.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground-muted">Revenue (30d)</span>
              <span className="text-sm font-mono-data text-indicator-active">847.2 ETH</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
