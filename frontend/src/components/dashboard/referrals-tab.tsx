"use client";

import { useState } from "react";
import { Copy, Gift, Send, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ReferralsTab() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data } = useQuery({
    queryKey: ["me", "referrals"],
    queryFn: () => api.get<{ referralCount: number; rewardDays: number }>("/api/users/me/referrals"),
    enabled: !!user,
  });

  if (!user) return null;

  const referralLink =
    typeof window !== "undefined" ? `${window.location.origin}/register?ref=${user.referralCode}` : "";
  const rewardDays = data?.rewardDays ?? 3;
  const shareText = `Join me on AfroTrading for premium gold (XAUUSD) trading signals: ${referralLink}`;

  function handleCopy() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
              <Gift className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display font-semibold">Refer friends, earn free VIP</p>
              <p className="text-sm text-foreground/60">
                Get {rewardDays} free days of VIP membership for every friend who signs up with your link.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input readOnly value={referralLink} className="font-mono text-sm" />
            <Button type="button" variant="outline" onClick={handleCopy} className="shrink-0">
              <Copy className="h-4 w-4" /> {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Share on WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(
                  "Join me on AfroTrading for premium gold trading signals"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Send className="h-4 w-4" /> Share on Telegram
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="flex items-center gap-4 p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
            <Users className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs text-foreground/50">Friends referred</p>
            <p className="font-display text-2xl font-semibold">{data?.referralCount ?? 0}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
