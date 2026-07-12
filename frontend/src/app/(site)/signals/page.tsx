"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { api } from "@/lib/api";
import type { Signal } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignalCard } from "@/components/signal-card";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "pending", label: "Pending" },
  { value: "winning", label: "Winning" },
  { value: "losing", label: "Losing" },
];

export default function SignalsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["signals", filter, search],
    queryFn: () =>
      api.get<{ signals: Signal[] }>(
        `/api/signals?${new URLSearchParams({
          ...(filter !== "all" ? { filter } : {}),
          ...(search ? { search } : {}),
          limit: "50",
        })}`
      ),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold">
          Live Gold <span className="gold-gradient-text">Signals</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-foreground/60">
          Every signal we publish, in real time — entries, stop loss, take profits, and results.
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f.value} value={f.value}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
          <Input
            placeholder="Search signals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl border border-white/5 bg-navy-800/50" />
          ))}
        {data?.signals.map((signal, i) => <SignalCard key={signal.id} signal={signal} index={i} />)}
        {data?.signals.length === 0 && (
          <p className="col-span-full py-12 text-center text-foreground/50">No signals match your filters.</p>
        )}
      </div>
    </div>
  );
}
