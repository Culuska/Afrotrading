"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Lock } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import type { MarketAnalysis } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default function MarketAnalysisDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["market-analysis", slug],
    queryFn: () => api.get<{ analysis: MarketAnalysis; locked: boolean }>(`/api/market-analysis/${slug}`),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-8 w-2/3 animate-pulse rounded bg-navy-800/50" />
        <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-navy-800/50" />
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-navy-800/50" />
      </div>
    );
  }

  if (error || !data?.analysis) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl font-bold">Analysis not found</h1>
        <p className="mt-2 text-foreground/60">
          {error instanceof ApiError ? error.message : "This analysis may have been removed or unpublished."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/market-analysis">
            <ArrowLeft className="h-4 w-4" /> Back to Market Analysis
          </Link>
        </Button>
      </div>
    );
  }

  const { analysis, locked } = data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href="/market-analysis" className="inline-flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Market Analysis
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge variant="neutral">{analysis.timeframe}</Badge>
        <Badge variant="outline">{analysis.type}</Badge>
        <Badge variant="outline">{analysis.pair}</Badge>
        {analysis.vipOnly && (
          <Badge>
            <Lock className="h-3 w-3" /> VIP
          </Badge>
        )}
      </div>

      <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">{analysis.title}</h1>
      <p className="mt-2 text-sm text-foreground/40">{formatDate(analysis.createdAt)}</p>

      {analysis.summary && <p className="mt-6 text-lg leading-8 text-foreground/70">{analysis.summary}</p>}

      {locked ? (
        <div className="mt-8 rounded-2xl border border-gold-500/20 bg-gold-500/5 p-8 text-center">
          <Lock className="mx-auto h-8 w-8 text-gold-400" />
          <h2 className="mt-4 font-display text-xl font-semibold">This is a VIP-only analysis</h2>
          <p className="mt-2 text-foreground/60">
            Upgrade to VIP membership to read the full breakdown, charts, and trade levels.
          </p>
          <Button asChild className="mt-6">
            <Link href="/pricing">View VIP Plans</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {analysis.chartImageUrl && (
            <div className="overflow-hidden rounded-2xl border border-black/10">
              <Image
                src={analysis.chartImageUrl}
                alt={analysis.title}
                width={1200}
                height={675}
                className="w-full object-cover"
              />
            </div>
          )}

          {analysis.videoUrl && (
            <div className="aspect-video overflow-hidden rounded-2xl border border-black/10">
              <iframe
                src={analysis.videoUrl}
                title={analysis.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {analysis.body && (
            <div className="whitespace-pre-line text-base leading-7 text-foreground/80">{analysis.body}</div>
          )}
        </div>
      )}
    </div>
  );
}
