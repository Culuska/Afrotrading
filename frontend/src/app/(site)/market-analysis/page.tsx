"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { api } from "@/lib/api";
import type { MarketAnalysis } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { TradingViewTechnical } from "@/components/marketing/tradingview-technical";
import { useI18n } from "@/context/i18n-context";

export default function MarketAnalysisPage() {
  const { dict } = useI18n();
  const [timeframe, setTimeframe] = useState("all");

  const TIMEFRAMES = [
    { value: "all", label: dict.marketAnalysis.timeframes.all },
    { value: "DAILY", label: dict.marketAnalysis.timeframes.daily },
    { value: "WEEKLY", label: dict.marketAnalysis.timeframes.weekly },
    { value: "MONTHLY", label: dict.marketAnalysis.timeframes.monthly },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ["market-analysis", timeframe],
    queryFn: () =>
      api.get<{ analysis: MarketAnalysis[] }>(
        `/api/market-analysis${timeframe !== "all" ? `?timeframe=${timeframe}` : ""}`,
        { auth: false }
      ),
  });

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold">
          {dict.marketAnalysis.titleLine1} <span className="gold-gradient-text">{dict.marketAnalysis.titleLine2}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-foreground/60">
          {dict.marketAnalysis.subtitle}
        </p>
      </div>

      <div className="mt-10">
        <TradingViewTechnical />
      </div>

      <div className="mt-10 flex justify-center">
        <Tabs value={timeframe} onValueChange={setTimeframe}>
          <TabsList>
            {TIMEFRAMES.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl border border-black/5 bg-navy-800/50" />
          ))}
        {data?.analysis.map((item) => (
          <Link key={item.id} href={`/market-analysis/${item.slug}`}>
            <Card className="h-full transition-transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">{item.timeframe}</Badge>
                  <Badge variant="outline">{item.type}</Badge>
                  {item.vipOnly && <Badge>VIP</Badge>}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-foreground/60">{item.summary}</p>
                <p className="mt-4 text-xs text-foreground/30">{formatDate(item.createdAt)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
        {data?.analysis.length === 0 && (
          <p className="col-span-full py-12 text-center text-foreground/50">{dict.marketAnalysis.noResults}</p>
        )}
      </div>
    </div>
  );
}
