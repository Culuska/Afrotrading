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
import { useI18n } from "@/context/i18n-context";

const TYPE_ICON = {
  VIDEO: PlayCircle,
  AUDIO: Headphones,
  PDF: FileText,
  IMAGE: ImageIcon,
  ARTICLE: BookOpen,
};

export default function EducationPage() {
  const { dict } = useI18n();
  const [category, setCategory] = useState<string>("all");

  const CATEGORIES: { value: EducationCategory | "all"; label: string }[] = [
    { value: "all", label: dict.education.categories.all },
    { value: "GOLD_ANALYSIS", label: dict.education.categories.goldAnalysis },
    { value: "FOREX_EDUCATION", label: dict.education.categories.forexEducation },
    { value: "RISK_MANAGEMENT", label: dict.education.categories.riskManagement },
    { value: "TRADING_PSYCHOLOGY", label: dict.education.categories.tradingPsychology },
    { value: "WEEKLY_ANALYSIS", label: dict.education.categories.weeklyAnalysis },
    { value: "VIDEO_LESSONS", label: dict.education.categories.videoLessons },
    { value: "ARTICLES", label: dict.education.categories.articles },
    { value: "TRADING_JOURNAL", label: dict.education.categories.tradingJournal },
    { value: "MARKET_ANALYSIS", label: dict.education.categories.marketAnalysis },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ["education", category],
    queryFn: () =>
      api.get<{ content: EducationContent[] }>(
        `/api/education${category !== "all" ? `?category=${category}` : ""}`,
        { auth: false }
      ),
  });

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold">
          {dict.education.titleLine1} <span className="gold-gradient-text">{dict.education.titleLine2}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-foreground/60">
          {dict.education.subtitle}
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
            <div key={i} className="h-56 animate-pulse rounded-2xl border border-black/5 bg-navy-800/50" />
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
                      {item.featured && <Badge variant="warning">{dict.education.featured}</Badge>}
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
          <p className="col-span-full py-12 text-center text-foreground/50">{dict.education.noResults}</p>
        )}
      </div>
    </div>
  );
}
