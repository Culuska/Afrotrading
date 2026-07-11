"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import type { MarketAnalysis } from "@/lib/types";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export function MarketAnalysisPreviewSection() {
  const { data } = useQuery({
    queryKey: ["market-analysis", "latest"],
    queryFn: () => api.get<{ analysis: MarketAnalysis[] }>("/api/market-analysis?limit=3", { auth: false }),
  });

  return (
    <section className="border-y border-white/5 bg-navy-900/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Market Analysis" title="Daily, Weekly & Monthly Gold Outlook" description="Stay ahead of the market with our technical and fundamental analysis." />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {data?.analysis.slice(0, 3).map((item) => (
            <Card key={item.id} className="transition-transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">{item.timeframe}</Badge>
                  <Badge variant="outline">{item.type}</Badge>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-foreground/60">{item.summary}</p>
                <p className="mt-4 text-xs text-foreground/30">{formatDate(item.createdAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/market-analysis">
              View All Analysis <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
