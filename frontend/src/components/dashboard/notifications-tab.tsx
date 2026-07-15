"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { api, ApiError } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function NotificationsTab() {
  const { user, refresh } = useAuth();
  const [saving, setSaving] = useState<string | null>(null);

  async function updateSetting(key: "notifyEmail" | "notifyTelegram" | "notifyPush", value: boolean) {
    setSaving(key);
    try {
      await api.patch("/api/users/me", { [key]: value });
      await refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update setting");
    } finally {
      setSaving(null);
    }
  }

  if (!user) return null;

  const settings: { key: "notifyEmail" | "notifyTelegram" | "notifyPush"; label: string; description: string; value: boolean }[] = [
    { key: "notifyEmail", label: "Email Notifications", description: "Signal alerts and updates via email.", value: user.notifyEmail },
    { key: "notifyTelegram", label: "Telegram Notifications", description: "Instant signal alerts via Telegram.", value: user.notifyTelegram },
    { key: "notifyPush", label: "Browser Push Notifications", description: "Real-time alerts in your browser.", value: user.notifyPush },
  ];

  return (
    <Card>
      <CardContent className="max-w-lg divide-y divide-black/5 p-6">
        {settings.map((setting) => (
          <div key={setting.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div>
              <Label>{setting.label}</Label>
              <p className="mt-1 text-xs text-foreground/50">{setting.description}</p>
            </div>
            <Switch
              checked={setting.value}
              disabled={saving === setting.key}
              onCheckedChange={(v) => updateSetting(setting.key, v)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
