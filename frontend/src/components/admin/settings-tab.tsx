"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AdminSettingsTab() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<{ settings: SiteSettings }>("/api/settings", { auth: false }),
  });

  const [form, setForm] = useState<SiteSettings>({});

  useEffect(() => {
    if (data?.settings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync of editable form defaults from fetched settings
      setForm(data.settings);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: SiteSettings) => api.put("/api/settings", payload),
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to save settings"),
  });

  return (
    <Card>
      <CardContent className="max-w-2xl space-y-6 p-6">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(form);
          }}
        >
          <div className="space-y-2">
            <Label>Homepage Hero Title</Label>
            <Input value={form.heroTitle || ""} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Homepage Hero Subtitle</Label>
            <Textarea rows={2} value={form.heroSubtitle || ""} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>SEO Title</Label>
            <Input value={form.seoTitle || ""} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>SEO Description</Label>
            <Textarea rows={2} value={form.seoDescription || ""} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Telegram Group URL</Label>
              <Input value={form.telegramGroupUrl || ""} onChange={(e) => setForm({ ...form, telegramGroupUrl: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Telegram VIP Channel URL</Label>
              <Input value={form.telegramChannelUrl || ""} onChange={(e) => setForm({ ...form, telegramChannelUrl: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>WhatsApp Number</Label>
              <Input value={form.whatsappNumber || ""} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input value={form.contactPhone || ""} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input value={form.contactEmail || ""} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
