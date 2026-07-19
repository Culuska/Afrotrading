"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

import { api } from "@/lib/api";
import type { Signal, PerformanceStats } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SignalStatusBadge } from "@/components/signal-status-badge";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/context/i18n-context";

export default function SignalHistoryPage() {
  const { dict } = useI18n();
  const [range, setRange] = useState("monthly");

  const RANGES = [
    { value: "weekly", label: dict.signalHistory.ranges.weekly },
    { value: "monthly", label: dict.signalHistory.ranges.monthly },
    { value: "yearly", label: dict.signalHistory.ranges.yearly },
  ];

  const { data: historyData, isLoading } = useQuery({
    queryKey: ["signals", "history", range],
    queryFn: () => api.get<{ signals: Signal[] }>(`/api/signals/history?range=${range}`),
  });

  const { data: stats } = useQuery({
    queryKey: ["stats", "performance"],
    queryFn: () => api.get<PerformanceStats>("/api/stats/performance", { auth: false }),
  });

  const signals = historyData?.signals || [];

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold">
          {dict.signalHistory.titleLine1} <span className="gold-gradient-text">{dict.signalHistory.titleLine2}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-foreground/60">
          {dict.signalHistory.subtitle}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={dict.signalHistory.stats.winRate} value={`${stats?.winRate ?? 0}%`} />
        <StatCard label={dict.signalHistory.stats.profitFactor} value={`${stats?.profitFactor ?? 0}`} />
        <StatCard label={dict.signalHistory.stats.avgRiskReward} value={`${stats?.averageRiskReward ?? 0}R`} />
        <StatCard label={dict.signalHistory.stats.totalSignals} value={`${stats?.totalSignals ?? 0}`} />
      </div>

      <div className="mt-10 flex justify-center">
        <Tabs value={range} onValueChange={setRange}>
          <TabsList>
            {RANGES.map((r) => (
              <TabsTrigger key={r.value} value={r.value}>
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dict.signalHistory.table.date}</TableHead>
              <TableHead>{dict.signalHistory.table.pair}</TableHead>
              <TableHead>{dict.signalHistory.table.direction}</TableHead>
              <TableHead>{dict.signalHistory.table.entry}</TableHead>
              <TableHead>{dict.signalHistory.table.sl}</TableHead>
              <TableHead>{dict.signalHistory.table.tp1}</TableHead>
              <TableHead>{dict.signalHistory.table.result}</TableHead>
              <TableHead>{dict.signalHistory.table.pips}</TableHead>
              <TableHead>{dict.signalHistory.table.rr}</TableHead>
              <TableHead>{dict.signalHistory.table.chart}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center text-foreground/50">
                  {dict.signalHistory.loading}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && signals.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center text-foreground/50">
                  {dict.signalHistory.noResults}
                </TableCell>
              </TableRow>
            )}
            {signals.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="whitespace-nowrap text-xs text-foreground/60">{formatDate(s.createdAt)}</TableCell>
                <TableCell className="font-semibold">{s.pair}</TableCell>
                <TableCell>
                  <span className={s.direction === "BUY" ? "text-success" : "text-danger"}>{s.direction}</span>
                </TableCell>
                <TableCell>{s.entryPrice}</TableCell>
                <TableCell className="text-danger">{s.stopLoss}</TableCell>
                <TableCell className="text-success">{s.takeProfit1}</TableCell>
                <TableCell>
                  <SignalStatusBadge status={s.status} />
                </TableCell>
                <TableCell className={Number(s.resultPips) >= 0 ? "text-success" : "text-danger"}>
                  {s.resultPips ?? "—"}
                </TableCell>
                <TableCell>{s.riskReward ?? "—"}</TableCell>
                <TableCell>
                  {s.chartImageUrl ? (
                    <a href={s.chartImageUrl} target="_blank" rel="noopener noreferrer" className="inline-block h-10 w-14 overflow-hidden rounded-md border border-black/10">
                      <Image src={s.chartImageUrl} alt="Chart" width={56} height={40} className="h-full w-full object-cover" />
                    </a>
                  ) : (
                    <span className="text-foreground/30">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="glass-card text-center">
      <CardContent className="p-5">
        <p className="font-display text-2xl font-bold gold-gradient-text">{value}</p>
        <p className="mt-1 text-xs text-foreground/60">{label}</p>
      </CardContent>
    </Card>
  );
}
