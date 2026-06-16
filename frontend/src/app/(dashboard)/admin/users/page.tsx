"use client";

import * as React from "react";
import {
  Search,
  Shield,
  Ban,
  Trash2,
  CheckCircle2,
  XCircle,
  Edit,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RequireAuth } from "@/components/providers/require-auth";
import { useAuthStore } from "@/stores/auth-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "billing";
  status: "active" | "suspended";
  jobsSubmitted: number;
  joinedAt: number;
  lastActive: number;
}

function generateMockUsers(): User[] {
  return [
    {
      id: "user_001",
      name: "Alex Chen",
      email: "alex@nexus-ai.com",
      role: "admin",
      status: "active",
      jobsSubmitted: 156,
      joinedAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
      lastActive: Date.now() - 60000,
    },
    {
      id: "user_002",
      name: "Sarah Miller",
      email: "sarah@renderfarm.io",
      role: "admin",
      status: "active",
      jobsSubmitted: 243,
      joinedAt: Date.now() - 150 * 24 * 60 * 60 * 1000,
      lastActive: Date.now() - 3600000,
    },
    {
      id: "user_003",
      name: "James Wilson",
      email: "james@synthwave.dev",
      role: "member",
      status: "active",
      jobsSubmitted: 89,
      joinedAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
      lastActive: Date.now() - 7200000,
    },
    {
      id: "user_004",
      name: "Emily Davis",
      email: "emily@neuralforge.ai",
      role: "billing",
      status: "active",
      jobsSubmitted: 67,
      joinedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
      lastActive: Date.now() - 14400000,
    },
    {
      id: "user_005",
      name: "Michael Brown",
      email: "michael@deepscale.com",
      role: "member",
      status: "suspended",
      jobsSubmitted: 12,
      joinedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      lastActive: Date.now() - 5 * 24 * 60 * 60 * 1000,
    },
    {
      id: "user_006",
      name: "Lisa Wang",
      email: "lisa@pixelflow.studio",
      role: "member",
      status: "active",
      jobsSubmitted: 201,
      joinedAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
      lastActive: Date.now() - 1800000,
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

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

const roleColors = {
  admin: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  member: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  billing: "bg-indicator-active/10 text-indicator-active border-indicator-active/30",
};

export default function AdminUsersPage() {
  return (
    <RequireAuth requiredRole="admin">
      <AdminUsersContent />
    </RequireAuth>
  );
}

function AdminUsersContent() {
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = React.useState<User[]>(generateMockUsers());
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showSuspendModal, setShowSuspendModal] = React.useState(false);
  const [editRole, setEditRole] = React.useState<string>("member");
  const [suspendAction, setSuspendAction] = React.useState<"suspend" | "activate">("suspend");

  const filteredUsers = users.filter((user) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !user.name.toLowerCase().includes(query) &&
        !user.email.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (roleFilter && user.role !== roleFilter) return false;
    if (statusFilter && user.status !== statusFilter) return false;
    return true;
  });

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setShowEditModal(true);
  };

  const saveUserEdit = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, role: editRole as User["role"] } : u))
    );
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const openSuspendModal = (user: User) => {
    setSelectedUser(user);
    setSuspendAction(user.status === "active" ? "suspend" : "activate");
    setShowSuspendModal(true);
  };

  const confirmSuspend = () => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, status: suspendAction === "suspend" ? "suspended" : "active" }
          : u
      )
    );
    setShowSuspendModal(false);
    setSelectedUser(null);
  };

  const removeUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            User Management
          </h1>
          <p className="text-sm text-foreground-muted">
            Manage user accounts and permissions — {filteredUsers.length} users
          </p>
        </div>
        <Badge variant="outline" className="text-indicator-active">
          <UserCheck className="h-3 w-3 mr-1" />
          Admin Access
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
              {users.filter((u) => u.status === "active").length}
            </div>
            <div className="text-xs text-foreground-muted">Active</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data text-indicator-stale">
              {users.filter((u) => u.status === "suspended").length}
            </div>
            <div className="text-xs text-foreground-muted">Suspended</div>
          </CardContent>
        </Card>
        <Card className="bg-bg-surface/80">
          <CardContent className="p-4">
            <div className="text-2xl font-semibold font-mono-data text-amber-400">
              {users.filter((u) => u.role === "admin").length}
            </div>
            <div className="text-xs text-foreground-muted">Admins</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-bg-surface/80">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                type="search"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter || ""}
                onChange={(e) => setRoleFilter(e.target.value || null)}
                className={cn(
                  "flex h-9 rounded-md border bg-bg-base px-3 py-2 text-sm",
                  "border-border-hairline focus-visible:outline-none"
                )}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="billing">Billing</option>
              </select>
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className={cn(
                  "flex h-9 rounded-md border bg-bg-base px-3 py-2 text-sm",
                  "border-border-hairline focus-visible:outline-none"
                )}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
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
                    User
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Jobs
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-bg-base/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indicator-active/20 rounded-full flex items-center justify-center text-xs font-semibold text-indicator-active">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {user.name}
                            {currentUser?.id === user.id && (
                              <span className="ml-2 text-xs text-indicator-active">(you)</span>
                            )}
                          </div>
                          <div className="text-xs text-foreground-muted font-mono-data">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn("text-xs", roleColors[user.role])}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {user.status === "active" ? (
                        <Badge variant="success" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="danger" className="text-xs">
                          <XCircle className="h-3 w-3 mr-1" />
                          Suspended
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono-data text-foreground">
                        {user.jobsSubmitted}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground-muted">
                        {formatDate(user.joinedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground-muted">
                        {formatRelativeTime(user.lastActive)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditModal(user)}
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4 text-blue-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openSuspendModal(user)}
                          title={user.status === "active" ? "Suspend user" : "Activate user"}
                        >
                          {user.status === "active" ? (
                            <Ban className="h-4 w-4 text-indicator-stale" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-indicator-active" />
                          )}
                        </Button>
                        {currentUser?.id !== user.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-indicator-slashed hover:text-indicator-slashed"
                            onClick={() => removeUser(user.id)}
                            title="Remove user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.name}. Role changes take effect immediately.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-bg-base rounded-lg">
                <div className="w-10 h-10 bg-indicator-active/20 rounded-full flex items-center justify-center text-sm font-semibold text-indicator-active">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium">{selectedUser.name}</div>
                  <div className="text-xs text-foreground-muted font-mono-data">
                    {selectedUser.email}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Assign Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["admin", "member", "billing"] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setEditRole(role)}
                      className={cn(
                        "p-3 rounded-lg border text-sm font-medium transition-colors",
                        editRole === role
                          ? "border-indicator-active bg-indicator-active/10 text-indicator-active"
                          : "border-border-hairline hover:border-zinc-600"
                      )}
                    >
                      <Shield className="h-4 w-4 mx-auto mb-1" />
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={saveUserEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend/Activate User Modal */}
      <Dialog open={showSuspendModal} onOpenChange={setShowSuspendModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {suspendAction === "suspend" ? "Suspend User" : "Activate User"}
            </DialogTitle>
            <DialogDescription>
              {suspendAction === "suspend"
                ? `Are you sure you want to suspend ${selectedUser?.name}? They will lose access to the platform.`
                : `Are you sure you want to activate ${selectedUser?.name}? They will regain access to the platform.`}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-3 py-4">
              <div className="flex items-center gap-3 p-3 bg-bg-base rounded-lg">
                <div className="w-10 h-10 bg-indicator-active/20 rounded-full flex items-center justify-center text-sm font-semibold text-indicator-active">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium">{selectedUser.name}</div>
                  <div className="text-xs text-foreground-muted font-mono-data">
                    {selectedUser.email}
                  </div>
                </div>
              </div>
              <div className="text-sm text-foreground-muted">
                <div className="font-medium text-foreground mb-1">Impact:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Current session will be terminated</li>
                  <li>API keys will remain active</li>
                  <li>Jobs in progress will continue</li>
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendModal(false)}>
              Cancel
            </Button>
            <Button
              variant={suspendAction === "suspend" ? "destructive" : "primary"}
              onClick={confirmSuspend}
            >
              {suspendAction === "suspend" ? "Suspend User" : "Activate User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
