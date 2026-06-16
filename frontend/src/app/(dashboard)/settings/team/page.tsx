"use client";

import * as React from "react";
import {
  Users,
  Plus,
  Mail,
  Shield,
  Trash2,
  MoreHorizontal,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "billing";
  status: "active" | "pending";
  joinedAt: number;
}

function generateMockTeam(): TeamMember[] {
  return [
    {
      id: "user_001",
      name: "Alex Chen",
      email: "alex@nexus-ai.com",
      role: "admin",
      status: "active",
      joinedAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
    },
    {
      id: "user_002",
      name: "Sarah Miller",
      email: "sarah@nexus-ai.com",
      role: "admin",
      status: "active",
      joinedAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
    },
    {
      id: "user_003",
      name: "James Wilson",
      email: "james@nexus-ai.com",
      role: "member",
      status: "active",
      joinedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    },
    {
      id: "user_004",
      name: "Emily Davis",
      email: "emily@nexus-ai.com",
      role: "billing",
      status: "active",
      joinedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    },
    {
      id: "user_005",
      name: "Michael Brown",
      email: "michael@nexus-ai.com",
      role: "member",
      status: "pending",
      joinedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
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

const roleColors = {
  admin: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  member: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  billing: "bg-indicator-active/10 text-indicator-active border-indicator-active/30",
};

const roleLabels = {
  admin: "Admin",
  member: "Member",
  billing: "Billing",
};

export default function TeamPage() {
  const [team, setTeam] = React.useState<TeamMember[]>(generateMockTeam());
  const [showInvite, setShowInvite] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<TeamMember["role"]>("member");
  const [isInviting, setIsInviting] = React.useState(false);

  const removeMember = (id: string) => {
    setTeam((prev) => prev.filter((m) => m.id !== id));
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    await new Promise((r) => setTimeout(r, 1000));
    const newMember: TeamMember = {
      id: `user_${Math.random().toString(36).slice(2, 8)}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      status: "pending",
      joinedAt: Date.now(),
    };
    setTeam((prev) => [...prev, newMember]);
    setInviteEmail("");
    setInviteRole("member");
    setIsInviting(false);
    setShowInvite(false);
  };

  const activeMembers = team.filter((m) => m.status === "active");
  const pendingMembers = team.filter((m) => m.status === "pending");

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Team
          </h1>
          <p className="text-sm text-foreground-muted">
            Manage your team members and their roles
          </p>
        </div>
        <Button onClick={() => setShowInvite(true)}>
          <Mail className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <Card className="bg-bg-surface/80 border-indicator-active/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Invite New Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Email Address"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TeamMember["role"])}
                  className={cn(
                    "flex h-10 w-full rounded-md border bg-bg-base px-3 py-2 text-sm",
                    "border-border-hairline focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-indicator-active/50"
                  )}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="billing">Billing</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowInvite(false)}>
                Cancel
              </Button>
              <Button onClick={inviteMember} isLoading={isInviting}>
                <Mail className="h-4 w-4 mr-2" />
                Send Invite
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Members */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-indicator-active" />
            Team Members
            <Badge variant="outline" className="ml-2">
              {activeMembers.length} active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-hairline">
            {activeMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 hover:bg-bg-base/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indicator-active/20 rounded-full flex items-center justify-center text-sm font-semibold text-indicator-active">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {member.name}
                      </span>
                      {member.role === "admin" && (
                        <Crown className="h-3 w-3 text-amber-400" />
                      )}
                    </div>
                    <div className="text-xs text-foreground-muted">
                      {member.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn("text-xs", roleColors[member.role])}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {roleLabels[member.role]}
                  </Badge>
                  <span className="text-xs text-foreground-muted">
                    Joined {formatDate(member.joinedAt)}
                  </span>
                  {member.role !== "admin" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-indicator-slashed hover:text-indicator-slashed"
                      onClick={() => removeMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {pendingMembers.length > 0 && (
        <Card className="bg-bg-surface/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4 text-indicator-stale" />
              Pending Invites
              <Badge variant="warning" className="ml-2">
                {pendingMembers.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-hairline">
              {pendingMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 hover:bg-bg-base/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indicator-stale/20 rounded-full flex items-center justify-center text-sm font-semibold text-indicator-stale">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {member.name}
                      </div>
                      <div className="text-xs text-foreground-muted">
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs text-indicator-stale">
                      Pending
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-indicator-slashed hover:text-indicator-slashed"
                      onClick={() => removeMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
