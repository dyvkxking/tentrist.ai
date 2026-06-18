"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Mail, Bell, Webhook, Trash2, Save } from "lucide-react";

export default function AccountSettingsPage() {
  const [formData, setFormData] = React.useState({
    displayName: "Node Provider",
    email: "provider@tentrist.ai",
    emailNotifications: true,
    webhookNotifications: false,
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
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Account Settings</h1>
        <p className="text-sm text-[#71717a] mt-1">
          Manage your node operator account
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
              <label className="text-sm text-[#71717a]">Email</label>
              <Input
                value={formData.email}
                readOnly
                disabled
                className="bg-[#0f1011] border-[#27272a] text-[#71717a] cursor-not-allowed"
              />
              <p className="text-xs text-[#71717a]">
                Email cannot be changed. Contact support if you need to update it.
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
              Configure how you receive notifications across all nodes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#71717a]" />
                <div>
                  <p className="text-sm text-white">Email Notifications</p>
                  <p className="text-xs text-[#71717a]">Receive updates via email</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, emailNotifications: !formData.emailNotifications })}
                className={`w-10 h-5 rounded-full transition-colors ${
                  formData.emailNotifications ? "bg-[#22c55e]" : "bg-[#27272a]"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.emailNotifications ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Webhook className="h-4 w-4 text-[#71717a]" />
                <div>
                  <p className="text-sm text-white">Webhook Notifications</p>
                  <p className="text-xs text-[#71717a]">Send events to your webhook endpoint</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, webhookNotifications: !formData.webhookNotifications })}
                className={`w-10 h-5 rounded-full transition-colors ${
                  formData.webhookNotifications ? "bg-[#22c55e]" : "bg-[#27272a]"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.webhookNotifications ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-[#ef4444]/20">
          <CardHeader>
            <CardTitle className="text-sm text-[#ef4444]">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Delete Account</p>
                <p className="text-xs text-[#71717a]">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end">
          <Button type="submit" isLoading={isSaving}>
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
