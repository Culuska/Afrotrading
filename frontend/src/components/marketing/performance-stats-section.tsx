"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PerformanceStats } from "@/lib/types";
import { SectionHeading } from "@/components/marketing/section-heading";
import { AnimatedCounter } from "@/components/marketing/animated-counter";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/context/i18n-context";

export function PerformanceStatsSection() {
  const { dict } = useI18n();
  const { data } = useQuery({
    queryKey: ["stats", "performance"],
    queryFn: () => api.get<PerformanceStats>("/api/stats/performance", { auth: false }),
  });

  const stats = [
    { label: dict.home.stats.winRate, value: data?.winRate ?? 0, suffix: "%", decimals: 1 },
    { label: dict.home.stats.totalSignals, value: data?.totalSignals ?? 0, suffix: "+" },
    { label: dict.home.stats.profitFactor, value: data?.profitFactor ?? 0, decimals: 2 },
    { label: dict.home.stats.avgRiskReward, value: data?.averageRiskReward ?? 0, decimals: 2, suffix: "R" },
  ];

  return (
    <section className="border-y border-black/5 bg-navy-900/40 py-20">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={dict.home.stats.eyebrow}
          title={dict.home.stats.title}
          description={dict.home.stats.description}
        />

        <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="glass-card text-center">
              <CardContent className="p-8">
                <p className="font-display text-4xl font-bold gold-gradient-text">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                </p>
                <p className="mt-2 text-sm text-foreground/60">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
