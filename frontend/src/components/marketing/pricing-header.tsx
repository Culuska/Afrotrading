"use client";

import { useI18n } from "@/context/i18n-context";

export function PricingHeader() {
  const { dict } = useI18n();
  return (
    <div className="text-center">
      <h1 className="font-display text-4xl font-bold">
        {dict.pricing.titleLine1} <span className="gold-gradient-text">{dict.pricing.titleLine2}</span>
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-foreground/60">{dict.pricing.subtitle}</p>
    </div>
  );
}
