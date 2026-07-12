"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PlayCircle, FileText, Image as ImageIcon, BookOpen, Headphones, Lock } from "lucide-react";

import { api } from "@/lib/api";
import type { EducationContent, EducationCategory } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORIES: { value: EducationCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "GOLD_ANALYSIS", label: "Gold Analysis" },
  { value: "FOREX_EDUCATION", label: "Forex Education" },
  { value: "RISK_MANAGEMENT", label: "Risk Management" },
  { value: "TRADING_PSYCHOLOGY", label: "Trading Psychology" },
  { value: "WEEKLY_ANALYSIS", label: "Weekly Analysis" },
  { value: "VIDEO_LESSONS", label: "Video Lessons" },
  { value: "ARTICLES", label: "Articles" },
  { value: "TRADING_JOURNAL", label: "Trading Journal" },
  { value: "MARKET_ANALYSIS", label: "Market Analysis" },
];

const TYPE_ICON = {
  VIDEO: PlayCircle,
  AUDIO: Headphones,
  PDF: FileText,
  IMAGE: ImageIcon,
  ARTICLE: BookOpen,
};

export default function EducationPage() {
  const [category, setCategory] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["education", category],
    queryFn: () =>
      api.get<{ content: EducationContent[] }>(
        `/api/education${category !== "all" ? `?category=${category}` : ""}`,
        { auth: false }
      ),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold">
          Education <span className="gold-gradient-text">Center</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-foreground/60">
          Videos, articles, and guides to sharpen your gold trading edge.
        </p>
      </div>

      <div className="mt-10 flex justify-center">
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="max-w-full flex-wrap justify-center">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c.value} value={c.value}>
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl border border-white/5 bg-navy-800/50" />
          ))}
        {data?.content.map((item) => {
          const Icon = TYPE_ICON[item.type] || BookOpen;
          return (
            <Link key={item.id} href={`/education/${item.slug}`}>
              <Card className="group h-full transition-transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex gap-2">
                      {item.featured && <Badge variant="warning">Featured</Badge>}
                      {item.vipOnly && (
                        <Badge>
                          <Lock className="h-3 w-3" /> VIP
                        </Badge>
                      )}
                    </div>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold group-hover:text-gold-400">{item.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-foreground/60">{item.description}</p>
                  <Badge variant="neutral" className="mt-4">
                    {item.category.replace(/_/g, " ")}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {data?.content.length === 0 && (
          <p className="col-span-full py-12 text-center text-foreground/50">No content in this category yet.</p>
        )}
      </div>
    </div>
  );
}
