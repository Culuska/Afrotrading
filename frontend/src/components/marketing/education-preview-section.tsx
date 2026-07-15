"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, PlayCircle, FileText, Image as ImageIcon, BookOpen, Headphones } from "lucide-react";
import { api } from "@/lib/api";
import type { EducationContent } from "@/lib/types";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TYPE_ICON = {
  VIDEO: PlayCircle,
  AUDIO: Headphones,
  PDF: FileText,
  IMAGE: ImageIcon,
  ARTICLE: BookOpen,
};

export function EducationPreviewSection() {
  const { data } = useQuery({
    queryKey: ["education", "featured"],
    queryFn: () => api.get<{ content: EducationContent[] }>("/api/education?limit=3", { auth: false }),
  });

  return (
    <section className="mx-auto max-w-[90rem] px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Education Center" title="Learn to Trade Gold the Right Way" description="Videos, articles, and guides covering technical analysis, risk management, and trading psychology." />

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {data?.content.slice(0, 3).map((item) => {
          const Icon = TYPE_ICON[item.type] || BookOpen;
          return (
            <Card key={item.id} className="group overflow-hidden transition-transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  {item.vipOnly && <Badge>VIP</Badge>}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold group-hover:text-gold-400">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-foreground/60">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/education">
            Explore Education Center <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
