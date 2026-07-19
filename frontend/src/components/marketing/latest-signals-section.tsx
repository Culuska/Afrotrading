"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import { api } from "@/lib/api";
import type { Signal } from "@/lib/types";
import { SectionHeading } from "@/components/marketing/section-heading";
import { SignalCard } from "@/components/signal-card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/i18n-context";

export function LatestSignalsSection() {
  const { dict } = useI18n();
  const { data, isLoading } = useQuery({
    queryKey: ["signals", "latest"],
    queryFn: () => api.get<{ signals: Signal[] }>("/api/signals?limit=4"),
  });

  return (
    <section className="mx-auto max-w-[90rem] px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading eyebrow={dict.home.signals.eyebrow} title={dict.home.signals.title} description={dict.home.signals.description} />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl border border-black/5 bg-navy-800/50" />
          ))}
        {data?.signals.map((signal, i) => <SignalCard key={signal.id} signal={signal} index={i} />)}
      </div>

      <div className="mt-10 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/signals">
            {dict.home.signals.viewAll} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
