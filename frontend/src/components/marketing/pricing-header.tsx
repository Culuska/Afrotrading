"use client";

import { Tag } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { useI18n } from "@/context/i18n-context";

export function PricingHeader() {
  const { dict } = useI18n();
  return (
    <PageHeader
      kicker={dict.nav.links.pricing}
      icon={Tag}
      titleLine1={dict.pricing.titleLine1}
      titleLine2={dict.pricing.titleLine2}
      subtitle={dict.pricing.subtitle}
    />
  );
}
