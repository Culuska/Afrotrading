"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Send, ShieldCheck, Users, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeroSlideshow } from "@/components/marketing/hero-slideshow";
import { BrandSeal } from "@/components/marketing/brand-seal";
import { TELEGRAM_GROUP_URL } from "@/lib/config";
import { useI18n } from "@/context/i18n-context";

export function Hero() {
  const { dict } = useI18n();
  return (
    <section className="section-glow relative overflow-hidden border-b border-black/5 bg-gradient-to-b from-navy-800 via-navy-900 to-background pb-20 pt-16 sm:pt-24">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="mb-5 flex flex-wrap items-center gap-4">
              <BrandSeal className="h-20 w-20 sm:h-28 sm:w-28" />
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-400">
                <TrendingUp className="h-3.5 w-3.5" /> {dict.hero.badge}
              </span>
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {dict.hero.titleLine1} <span className="gold-gradient-text">{dict.hero.titleLine2}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-foreground/60">{dict.hero.subtitle}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  {dict.hero.getStartedFree} <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={TELEGRAM_GROUP_URL} target="_blank" rel="noopener noreferrer">
                  <Send className="h-4 w-4" /> {dict.hero.joinTelegram}
                </a>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-foreground/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold-400" /> {dict.hero.verifiedTrackRecord}
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gold-400" /> {dict.hero.tradersCount}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          >
            <HeroSlideshow />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
