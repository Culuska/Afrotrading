"use client";

import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import type { Testimonial } from "@/lib/types";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TestimonialsSection() {
  const { data } = useQuery({
    queryKey: ["testimonials"],
    queryFn: () => api.get<{ testimonials: Testimonial[] }>("/api/testimonials", { auth: false }),
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Testimonials" title="Trusted by Traders Across Africa" />

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {data?.testimonials.map((t) => (
          <Card key={t.id} className="glass-card">
            <CardContent className="p-6">
              <div className="flex gap-1 text-gold-400">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-foreground/70">&ldquo;{t.message}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{t.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-foreground/40">{t.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
