"use client";

import Link from "next/link";
import { Send, ShieldCheck, Crown, Mail } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MEMBERSHIP_LABEL: Record<string, string> = {
  FREE: "Free Plan",
  VIP_MONTHLY: "VIP Monthly",
  VIP_LIFETIME: "VIP Lifetime",
};

export function OverviewTab() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="glass-card">
        <CardContent className="flex items-center gap-4 p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
            <Crown className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs text-foreground/50">Membership</p>
            <p className="font-display font-semibold">{MEMBERSHIP_LABEL[user.membership]}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="flex items-center gap-4 p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
            <Mail className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs text-foreground/50">Email Status</p>
            <Badge variant={user.emailVerified ? "success" : "warning"}>
              {user.emailVerified ? "Verified" : "Pending Verification"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="flex items-center gap-4 p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
            <Send className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <p className="text-xs text-foreground/50">Telegram</p>
            <Badge variant={user.telegramJoined ? "success" : "neutral"}>
              {user.telegramJoined ? "Connected" : "Not Connected"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {user.membership === "FREE" && (
        <Card className="glass-card sm:col-span-2 lg:col-span-3">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-gold-400" />
              <div>
                <p className="font-display font-semibold">Upgrade to VIP</p>
                <p className="text-sm text-foreground/60">Unlock unlimited signals, daily analysis, and priority support.</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/pricing">View Plans</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
