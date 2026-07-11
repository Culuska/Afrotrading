"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, TrendingUp, Trophy, Activity } from "lucide-react";
import { api } from "@/lib/api";
import type { PerformanceStats } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

export function AdminOverviewTab() {
  const { data: stats } = useQuery({
    queryKey: ["stats", "performance"],
    queryFn: () => api.get<PerformanceStats>("/api/stats/performance", { auth: false }),
  });

  const { data: usersData } = useQuery({
    queryKey: ["admin", "users", "count"],
    queryFn: () => api.get<{ total: number }>("/api/users?limit=1"),
  });

  const cards = [
    { label: "Total Users", value: usersData?.total ?? 0, icon: Users },
    { label: "Total Signals", value: stats?.totalSignals ?? 0, icon: TrendingUp },
    { label: "Win Rate", value: `${stats?.winRate ?? 0}%`, icon: Trophy },
    { label: "Running Signals", value: stats?.runningSignals ?? 0, icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="glass-card">
            <CardContent className="flex items-center gap-4 p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
                <card.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs text-foreground/50">{card.label}</p>
                <p className="font-display text-xl font-bold">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-foreground/50">Monthly Profit</p>
            <p className="mt-1 font-display text-2xl font-bold text-success">${stats?.monthlyProfit ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-foreground/50">Weekly Profit</p>
            <p className="mt-1 font-display text-2xl font-bold text-success">${stats?.weeklyProfit ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-foreground/50">Profit Factor</p>
            <p className="mt-1 font-display text-2xl font-bold">{stats?.profitFactor ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-foreground/50">Avg Risk:Reward</p>
            <p className="mt-1 font-display text-2xl font-bold">{stats?.averageRiskReward ?? 0}R</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
