"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { api } from "@/lib/api";
import type { PricingPlan } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PricingCards() {
  const { data, isLoading } = useQuery({
    queryKey: ["pricing"],
    queryFn: () => api.get<{ plans: PricingPlan[] }>("/api/pricing", { auth: false }),
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-96 animate-pulse rounded-2xl border border-white/5 bg-navy-800/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {data?.plans.map((plan) => (
        <Card
          key={plan.id}
          className={cn(
            "relative flex flex-col transition-transform hover:-translate-y-1",
            plan.isPopular && "border-gold-500/50 shadow-2xl shadow-gold-500/10"
          )}
        >
          {plan.isPopular && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
          )}
          <CardHeader className="text-center">
            <CardTitle className="font-display text-xl">{plan.name}</CardTitle>
            <div className="mt-2">
              <span className="font-display text-4xl font-bold gold-gradient-text">
                ${Number(plan.price).toFixed(0)}
              </span>
              {plan.billingCycle !== "free" && plan.billingCycle !== "lifetime" && (
                <span className="text-sm text-foreground/50">/{plan.billingCycle}</span>
              )}
              {plan.billingCycle === "lifetime" && <span className="text-sm text-foreground/50"> once</span>}
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-6">
            <ul className="flex-1 space-y-3">
              {(plan.features || []).map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-foreground/70">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" /> {feature}
                </li>
              ))}
            </ul>
            <Button asChild variant={plan.isPopular ? "default" : "outline"} className="w-full">
              <Link href="/register">{plan.price === "0.00" || Number(plan.price) === 0 ? "Start Free" : "Choose Plan"}</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
