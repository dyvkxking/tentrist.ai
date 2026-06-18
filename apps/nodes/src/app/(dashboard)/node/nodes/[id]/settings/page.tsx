"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Settings, Bell, Mail, Save } from "lucide-react";

export default function NodeSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const nodeId = params.id as string;

  const [formData, setFormData] = React.useState({
    displayName: "GPU-Rig-Alpha",
    emailAlerts: true,
    slashingAlerts: true,
  });
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

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
        <h1 className="text-xl font-semibold text-white">Node Settings</h1>
        <p className="text-sm text-[#71717a] mt-1">
          Configure settings for node {nodeId}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Settings className="h-4 w-4 text-[#71717a]" />
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-[#71717a]">Display Name</label>
              <Input
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="bg-[#010102] border-[#27272a]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#71717a]">GPU Model</label>
              <Input
                value="NVIDIA H100 80GB"
                readOnly
                disabled
                className="bg-[#0f1011] border-[#27272a] text-[#71717a] cursor-not-allowed"
              />
              <p className="text-xs text-[#71717a]">
                GPU model cannot be changed after registration
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4 text-[#71717a]" />
              Notification Preferences
            </CardTitle>
            <CardDescription className="text-[#71717a]">
              Configure when you receive alerts for this node
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#71717a]" />
                <div>
                  <p className="text-sm text-white">Job Alerts</p>
                  <p className="text-xs text-[#71717a]">Get notified when new jobs are assigned</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, emailAlerts: !formData.emailAlerts })}
                className={`w-10 h-5 rounded-full transition-colors ${
                  formData.emailAlerts ? "bg-[#22c55e]" : "bg-[#27272a]"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.emailAlerts ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#71717a]" />
                <div>
                  <p className="text-sm text-white">Slashing Alerts</p>
                  <p className="text-xs text-[#71717a]">Get notified immediately on slashing events</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, slashingAlerts: !formData.slashingAlerts })}
                className={`w-10 h-5 rounded-full transition-colors ${
                  formData.slashingAlerts ? "bg-[#22c55e]" : "bg-[#27272a]"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.slashingAlerts ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link href={`/node/nodes/${nodeId}/unregister`}>
            <Button variant="destructive" size="sm" type="button">
              Unregister Node
            </Button>
          </Link>
          <Button type="submit" isLoading={isSaving}>
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
