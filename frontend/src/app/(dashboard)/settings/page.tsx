"use client";

import * as React from "react";
import {
  User,
  Globe,
  Bell,
  Shield,
  Clock,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [displayName, setDisplayName] = React.useState("Alex Chen");
  const [email, setEmail] = React.useState("alex@nexus-ai.com");
  const [timezone, setTimezone] = React.useState("America/New_York");
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
  };

  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Berlin",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Singapore",
    "Asia/Shanghai",
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
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Profile Section */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-indicator-active" />
            Profile
          </CardTitle>
          <CardDescription>
            Your public profile information
          </CardDescription>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
              helperText="Email cannot be changed"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-indicator-active/20 rounded-full flex items-center justify-center text-2xl font-semibold text-indicator-active">
              A
            </div>
            <Button variant="outline" size="sm">
              Change Avatar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-indicator-active" />
            Preferences
          </CardTitle>
          <CardDescription>
            Default settings for jobs and notifications
          </CardDescription>
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
                  "border-border-hairline focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-indicator-active/50"
                )}
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Default SLA Settings</label>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Required Uptime (%)"
                type="number"
                defaultValue={95}
                min={90}
                max={100}
              />
              <Input
                label="Required Throughput (ops/s)"
                type="number"
                defaultValue={100}
                min={1}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-indicator-active" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose what events trigger notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {[
              { id: "job_completed", label: "Job completed", defaultChecked: true },
              { id: "job_failed", label: "Job failed", defaultChecked: true },
              { id: "sla_breached", label: "SLA breached", defaultChecked: true },
              { id: "node_offline", label: "Node goes offline", defaultChecked: true },
              { id: "slash_event", label: "Slash event", defaultChecked: true },
              { id: "weekly_report", label: "Weekly summary report", defaultChecked: false },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={item.defaultChecked}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-bg-base peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indicator-active"></div>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
