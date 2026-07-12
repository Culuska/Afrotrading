"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import { api } from "@/lib/api";
import type { Signal } from "@/lib/types";
import { SectionHeading } from "@/components/marketing/section-heading";
import { SignalCard } from "@/components/signal-card";
import { Button } from "@/components/ui/button";

export function LatestSignalsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["signals", "latest"],
    queryFn: () => api.get<{ signals: Signal[] }>("/api/signals?limit=4"),
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Live Signals" title="Latest Gold Signals" description="Real trade setups, published in real time with full transparency." />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl border border-white/5 bg-navy-800/50" />
          ))}
        {data?.signals.map((signal, i) => <SignalCard key={signal.id} signal={signal} index={i} />)}
      </div>

      <div className="mt-10 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/signals">
            View All Signals <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
