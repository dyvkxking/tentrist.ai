"use client";

import * as React from "react";
import {
  Bell,
  Mail,
  Globe,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NotificationSettings {
  email: boolean;
  browser: boolean;
  jobCompleted: boolean;
  jobFailed: boolean;
  slaBreached: boolean;
  nodeOffline: boolean;
  slashEvent: boolean;
  weeklyReport: boolean;
}

export default function NotificationsPage() {
  const [settings, setSettings] = React.useState<NotificationSettings>({
    email: true,
    browser: true,
    jobCompleted: true,
    jobFailed: true,
    slaBreached: true,
    nodeOffline: true,
    slashEvent: true,
    weeklyReport: false,
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const notificationItems = [
    {
      key: "jobCompleted" as const,
      label: "Job Completed",
      description: "Get notified when a job finishes successfully",
      icon: CheckCircle2,
      color: "text-indicator-active",
    },
    {
      key: "jobFailed" as const,
      label: "Job Failed",
      description: "Get notified when a job fails or is cancelled",
      icon: AlertCircle,
      color: "text-indicator-slashed",
    },
    {
      key: "slaBreached" as const,
      label: "SLA Breached",
      description: "Get notified when SLA benchmarks are not met",
      icon: AlertCircle,
      color: "text-indicator-stale",
    },
    {
      key: "nodeOffline" as const,
      label: "Node Offline",
      description: "Get notified when one of your nodes goes offline",
      icon: AlertCircle,
      color: "text-indicator-stale",
    },
    {
      key: "slashEvent" as const,
      label: "Slash Event",
      description: "Get notified when a slash is executed on your nodes",
      icon: AlertCircle,
      color: "text-indicator-slashed",
    },
    {
      key: "weeklyReport" as const,
      label: "Weekly Report",
      description: "Receive a weekly summary of your job activity",
      icon: CheckCircle2,
      color: "text-indicator-active",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Notifications
          </h1>
          <p className="text-sm text-foreground-muted">
            Configure how you receive alerts and updates
          </p>
        </div>
      </div>

      {/* Channel Settings */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-indicator-active" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose which channels to use for notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Email */}
            <div className="flex items-center justify-between p-4 bg-bg-base/50 rounded-lg border border-hairline">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indicator-active/10 rounded-lg">
                  <Mail className="h-5 w-5 text-indicator-active" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">Email</div>
                  <div className="text-xs text-foreground-muted">
                    alex@nexus-ai.com
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email}
                  onChange={() => toggleSetting("email")}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-bg-base peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indicator-active"></div>
              </label>
            </div>

            {/* Browser */}
            <div className="flex items-center justify-between p-4 bg-bg-base/50 rounded-lg border border-hairline">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Globe className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">Browser</div>
                  <div className="text-xs text-foreground-muted">
                    Desktop and mobile
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.browser}
                  onChange={() => toggleSetting("browser")}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-bg-base peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indicator-active"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Settings */}
      <Card className="bg-bg-surface/80">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-indicator-active" />
            Event Notifications
          </CardTitle>
          <CardDescription>
            Choose which events trigger notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notificationItems.map((item) => {
            const Icon = item.icon;
            const isEnabled = settings[item.key];
            return (
              <div
                key={item.key}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-colors",
                  isEnabled
                    ? "bg-bg-base/50 border-hairline"
                    : "bg-bg-base/30 border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", `${item.color}/10`)}>
                    <Icon className={cn("h-5 w-5", item.color)} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {item.label}
                    </div>
                    <div className="text-xs text-foreground-muted">
                      {item.description}
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[item.key]}
                    onChange={() => toggleSetting(item.key)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-bg-base peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indicator-active"></div>
                </label>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end items-center gap-3">
        {saved && (
          <span className="text-sm text-indicator-active flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            Settings saved
          </span>
        )}
        <Button onClick={handleSave} isLoading={isSaving}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
