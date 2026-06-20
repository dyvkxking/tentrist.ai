"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Globe,
  Bell,
  Shield,
  Wallet,
  Save,
  Trash2,
  AlertTriangle,
  Key,
  Zap,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useAccount } from "wagmi";
import { signOut as authSignOut } from "@/stores/auth-store";
import { profileApi, prefsApi, type NotificationPrefs } from "@/lib/supabase";

// ─── Notification toggles ─────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
          checked ? "bg-indicator-active" : "bg-bg-base border border-hairline"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

// ─── Delete Account Modal ──────────────────────────────────────────────────────

function DeleteAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [confirmText, setConfirmText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleDelete = async () => {
    if (confirmText !== user?.email) return;
    setIsDeleting(true);
    try {
      // Call backend to delete account
      await fetch("/api/v1/users/me", { method: "DELETE" });
      await authSignOut();
      setDone(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch {
      setIsDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4">
        <Card className="bg-bg-surface border-indicator-slashed/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indicator-slashed/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-indicator-slashed" />
              </div>
              <div>
                <CardTitle className="text-base text-indicator-slashed">Delete Account</CardTitle>
                <CardDescription className="text-xs">
                  This action cannot be undone
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {done ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-12 w-12 text-indicator-active mx-auto mb-3" />
                <p className="text-sm text-foreground">Account deleted. Redirecting...</p>
              </div>
            ) : (
              <>
                <div className="p-3 bg-indicator-slashed/10 border border-indicator-slashed/20 rounded-lg">
                  <p className="text-xs text-foreground-muted">
                    All your data including profile, jobs, API keys, and stake positions will be
                    permanently removed. Any active stakes will be slashed per SLA terms.
                  </p>
                </div>
                <div>
                  <label className="text-xs text-foreground-muted mb-1 block">
                    Type your email <span className="font-mono-data text-foreground">{user?.email}</span> to confirm:
                  </label>
                  <input
                    type="text"
                    placeholder={user?.email}
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-base border border-hairline rounded-md text-sm font-mono-data text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-indicator-slashed"
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={confirmText !== user?.email || isDeleting}
                    onClick={handleDelete}
                  >
                    {isDeleting ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" />Deleting...</>
                    ) : (
                      <><Trash2 className="h-4 w-4 mr-2" />Delete Forever</>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user } = useAuth();
  const { address, isConnected } = useAccount();
  const [activeSection, setActiveSection] = React.useState("profile");

  // Profile state
  const [displayName, setDisplayName] = React.useState("");
  const [timezone, setTimezone] = React.useState("UTC");
  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = React.useState<NotificationPrefs>({
    jobCompleted: true,
    jobFailed: true,
    slaBreached: true,
    nodeOffline: true,
    slashEvent: true,
    weeklyReport: false,
    priceAlerts: true,
    newJobOffer: false,
  });

  // Node provider prefs
  const [uptimeSLA, setUptimeSLA] = React.useState("99.5");
  const [minJobPrice, setMinJobPrice] = React.useState("0.001");
  const [autoAccept, setAutoAccept] = React.useState(false);
  const [region, setRegion] = React.useState("auto");

  // Loading state for prefs
  const [prefsLoading, setPrefsLoading] = React.useState(true);

  // Danger zone
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setDisplayName(
        user.name ||
        user.email?.split("@")[0] ||
        ""
      );
    }
  }, [user]);

  // Load prefs from Supabase on mount
  React.useEffect(() => {
    if (!user) return;
    async function loadPrefs() {
      try {
        const [notif, nodeProvider] = await Promise.all([
          prefsApi.getNotificationPrefs(),
          prefsApi.getNodeProviderPrefs(),
        ]);
        setNotifPrefs(notif);
        setUptimeSLA(nodeProvider.uptimeSLA);
        setMinJobPrice(nodeProvider.minJobPrice);
        setAutoAccept(nodeProvider.autoAccept);
        setRegion(nodeProvider.region);
      } catch {
        // Use defaults on error
      } finally {
        setPrefsLoading(false);
      }
    }
    loadPrefs();
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (user) {
        await profileApi.update({ display_name: displayName });
        // Save notification prefs individually
        await Promise.all([
          prefsApi.setNotificationPref('jobCompleted', notifPrefs.jobCompleted),
          prefsApi.setNotificationPref('jobFailed', notifPrefs.jobFailed),
          prefsApi.setNotificationPref('slaBreached', notifPrefs.slaBreached),
          prefsApi.setNotificationPref('nodeOffline', notifPrefs.nodeOffline),
          prefsApi.setNotificationPref('slashEvent', notifPrefs.slashEvent),
          prefsApi.setNotificationPref('weeklyReport', notifPrefs.weeklyReport),
          prefsApi.setNotificationPref('priceAlerts', notifPrefs.priceAlerts),
          prefsApi.setNotificationPref('newJobOffer', notifPrefs.newJobOffer),
        ]);
        // Save node provider prefs
        await prefsApi.saveNodeProviderPrefs({ uptimeSLA, minJobPrice, autoAccept, region });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  const timezones = [
    "UTC", "America/New_York", "America/Chicago", "America/Denver",
    "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Europe/Paris",
    "Asia/Tokyo", "Asia/Singapore", "Asia/Shanghai", "Australia/Sydney",
  ];

  const regions = [
    { value: "auto", label: "Auto (Best Available)" },
    { value: "us-east", label: "US East" },
    { value: "us-west", label: "US West" },
    { value: "eu-central", label: "EU Central" },
    { value: "asia-pacific", label: "Asia Pacific" },
  ];

  const navItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "node", label: "Node Provider", icon: Zap },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-sm text-foreground-muted">
            Manage your account, node provider preferences, and security
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left nav */}
        <div className="hidden md:flex flex-col gap-1 w-48 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors",
                  activeSection === item.id
                    ? "bg-indicator-active/10 text-indicator-active"
                    : "text-foreground-muted hover:text-foreground hover:bg-zinc-800/50"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right content */}
        <div className="flex-1 space-y-4 min-w-0">

          {/* ── Profile ── */}
          {activeSection === "profile" && (
            <>
              <Card className="bg-bg-surface/80">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-indicator-active" />
                    Profile
                  </CardTitle>
                  <CardDescription>Public profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Display Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      helperText="Email managed through OAuth provider"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-indicator-active/20 rounded-full flex items-center justify-center text-2xl font-semibold text-indicator-active">
                      {displayName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-bg-surface/80">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4 text-indicator-active" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-foreground">Timezone</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className={cn(
                          "flex h-10 w-full rounded-md border bg-bg-base px-3 py-2 text-sm",
                          "border-border-hairline focus-visible:outline-none focus-visible:ring-2",
                          "focus-visible:ring-indicator-active/50"
                        )}
                      >
                        {timezones.map((tz) => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-foreground">Display Currency</label>
                      <select
                        defaultValue="ETH"
                        className={cn(
                          "flex h-10 w-full rounded-md border bg-bg-base px-3 py-2 text-sm",
                          "border-border-hairline focus-visible:outline-none focus-visible:ring-2",
                          "focus-visible:ring-indicator-active/50"
                        )}
                      >
                        <option value="ETH">ETH</option>
                        <option value="USD">USD</option>
                        <option value="USDC">USDC</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* ── Node Provider ── */}
          {activeSection === "node" && (
            <>
              <Card className="bg-bg-surface/80">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-indicator-active" />
                    Node Configuration
                  </CardTitle>
                  <CardDescription>Default settings for job acceptance and SLA</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Minimum Uptime SLA (%)"
                      type="number"
                      value={uptimeSLA}
                      onChange={(e) => setUptimeSLA(e.target.value)}
                      helperText="Reject jobs with lower SLA requirements"
                    />
                    <Input
                      label="Minimum Job Price (ETH/min)"
                      type="number"
                      value={minJobPrice}
                      onChange={(e) => setMinJobPrice(e.target.value)}
                      helperText="Minimum price per minute to accept a job"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-foreground">Preferred Region</label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className={cn(
                          "flex h-10 w-full rounded-md border bg-bg-base px-3 py-2 text-sm",
                          "border-border-hairline focus-visible:outline-none focus-visible:ring-2",
                          "focus-visible:ring-indicator-active/50"
                        )}
                      >
                        {regions.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-foreground">Auto-Accept Jobs</label>
                      <div className="flex items-center h-10">
                        <Toggle
                          checked={autoAccept}
                          onChange={setAutoAccept}
                          label=""
                        />
                        <span className="text-xs text-foreground-muted ml-2">
                          {autoAccept ? "Enabled — jobs auto-assign when SLA matches" : "Disabled — manual job approval"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-bg-surface/80">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Key className="h-4 w-4 text-indicator-active" />
                    API Keys
                  </CardTitle>
                  <CardDescription>Manage your API keys for programmatic access</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => window.location.href = "/settings/api-keys"}>
                    <Key className="h-4 w-4 mr-2" />
                    Manage API Keys
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* ── Notifications ── */}
          {activeSection === "notifications" && (
            <Card className="bg-bg-surface/80">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-indicator-active" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose what events trigger notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Job Events</p>
                  <Toggle checked={notifPrefs.jobCompleted} onChange={(v) => setNotifPrefs(p => ({ ...p, jobCompleted: v }))} label="Job completed successfully" />
                  <Toggle checked={notifPrefs.jobFailed} onChange={(v) => setNotifPrefs(p => ({ ...p, jobFailed: v }))} label="Job failed or breached SLA" />
                  <Toggle checked={notifPrefs.newJobOffer} onChange={(v) => setNotifPrefs(p => ({ ...p, newJobOffer: v }))} label="New job offer available" />
                </div>
                <div className="border-t border-hairline pt-4 space-y-3">
                  <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Node Events</p>
                  <Toggle checked={notifPrefs.nodeOffline} onChange={(v) => setNotifPrefs(p => ({ ...p, nodeOffline: v }))} label="Node goes offline" />
                  <Toggle checked={notifPrefs.slashEvent} onChange={(v) => setNotifPrefs(p => ({ ...p, slashEvent: v }))} label="Slash event triggered" />
                  <Toggle checked={notifPrefs.slaBreached} onChange={(v) => setNotifPrefs(p => ({ ...p, slaBreached: v }))} label="SLA threshold warning" />
                </div>
                <div className="border-t border-hairline pt-4 space-y-3">
                  <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Other</p>
                  <Toggle checked={notifPrefs.weeklyReport} onChange={(v) => setNotifPrefs(p => ({ ...p, weeklyReport: v }))} label="Weekly performance summary" />
                  <Toggle checked={notifPrefs.priceAlerts} onChange={(v) => setNotifPrefs(p => ({ ...p, priceAlerts: v }))} label="Price alerts and market updates" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Security ── */}
          {activeSection === "security" && (
            <>
              <Card className="bg-bg-surface/80">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-indicator-active" />
                    Connected Wallet
                  </CardTitle>
                  <CardDescription>Your linked Ethereum wallet address</CardDescription>
                </CardHeader>
                <CardContent>
                  {isConnected && address ? (
                    <div className="flex items-center justify-between p-3 bg-bg-base rounded-lg">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-indicator-active" />
                        <span className="text-sm font-mono-data">{address}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(address)}
                          className="p-1 hover:bg-zinc-700 rounded"
                        >
                          <Copy className="h-3 w-3 text-foreground-muted" />
                        </button>
                      </div>
                      <Badge variant="success" className="text-xs">Linked</Badge>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground-muted">
                      No wallet connected. Connect via the{" "}
                      <a href="/wallet" className="text-indicator-active hover:underline">Wallet</a>{" "}
                      page.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-bg-surface/80">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-indicator-active" />
                    Session & Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">Active sessions</p>
                      <p className="text-xs text-foreground-muted">1 session active on this device</p>
                    </div>
                    <Button variant="outline" size="sm">Revoke All</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">Two-factor authentication</p>
                      <p className="text-xs text-foreground-muted">Add 2FA via TOTP app</p>
                    </div>
                    <Button variant="outline" size="sm">Enable 2FA</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* ── Danger Zone ── */}
          {activeSection === "danger" && (
            <Card className="bg-bg-surface/80 border-indicator-slashed/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-indicator-slashed" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-indicator-slashed/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">Delete Account</p>
                    <p className="text-xs text-foreground-muted">
                      Permanently remove your account and all associated data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save button */}
          {activeSection !== "danger" && (
            <div className="flex justify-end">
              <Button onClick={handleSave} isLoading={isSaving}>
                {saved ? (
                  <><Check className="h-4 w-4 mr-2" />Saved</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />Save Changes</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <DeleteAccountModal open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </div>
  );
}
