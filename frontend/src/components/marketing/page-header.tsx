"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  kicker,
  icon: Icon,
  titleLine1,
  titleLine2,
  subtitle,
  className,
  subtitleClassName,
}: {
  kicker: string;
  icon?: LucideIcon;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  className?: string;
  subtitleClassName?: string;
}) {
  return (
    <div className={cn("text-center", className)}>
      <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-400">
        {Icon && <Icon className="h-3.5 w-3.5" />} {kicker}
      </span>
      <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground">
        {titleLine1} <span className="gold-gradient-text">{titleLine2}</span>
      </h1>
      <p className={cn("mx-auto mt-3 max-w-xl text-foreground/60", subtitleClassName)}>{subtitle}</p>
    </div>
  );
}
