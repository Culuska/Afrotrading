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

const RANGES = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export default function SignalHistoryPage() {
  const [range, setRange] = useState("monthly");

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
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold">
          Signal <span className="gold-gradient-text">History</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-foreground/60">
          Complete transparency — every closed trade, with full statistics.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Win Rate" value={`${stats?.winRate ?? 0}%`} />
        <StatCard label="Profit Factor" value={`${stats?.profitFactor ?? 0}`} />
        <StatCard label="Avg. R:R" value={`${stats?.averageRiskReward ?? 0}R`} />
        <StatCard label="Total Signals" value={`${stats?.totalSignals ?? 0}`} />
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
              <TableHead>Date</TableHead>
              <TableHead>Pair</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Entry</TableHead>
              <TableHead>SL</TableHead>
              <TableHead>TP1</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Pips</TableHead>
              <TableHead>R:R</TableHead>
              <TableHead>Chart</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center text-foreground/50">
                  Loading history...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && signals.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center text-foreground/50">
                  No closed signals in this period.
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
