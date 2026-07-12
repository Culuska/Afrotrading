"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Send, ShieldCheck, Users, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TradingViewChart } from "@/components/marketing/tradingview-chart";
import { GoldPriceWidget } from "@/components/marketing/gold-price-widget";
import { TELEGRAM_GROUP_URL } from "@/lib/config";

export function Hero() {
  return (
    <section className="section-glow relative overflow-hidden border-b border-white/5 pb-20 pt-16 sm:pt-24">
      <div className="absolute inset-0 -z-10">
        <Image src="/images/hero-banner.jpg" alt="" fill priority className="object-cover object-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 via-navy-950/85 to-navy-950" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-400">
              <TrendingUp className="h-3.5 w-3.5" /> #1 Gold Signal Provider
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Trade Gold <span className="gold-gradient-text">Like a Pro</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-foreground/60">
              Premium XAUUSD signals, real-time market analysis, and a disciplined trading
              community. Join thousands of traders following our verified gold signals every day.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Get Started Free <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={TELEGRAM_GROUP_URL} target="_blank" rel="noopener noreferrer">
                  <Send className="h-4 w-4" /> Join Telegram
                </a>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-foreground/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold-400" /> Verified Track Record
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gold-400" /> 10,000+ Traders
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="space-y-4"
          >
            <GoldPriceWidget />
            <TradingViewChart height={360} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function BuySellButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button className="flex items-center justify-center gap-2 rounded-xl border border-danger/40 bg-danger/10 py-3 text-sm font-bold text-danger transition-colors hover:bg-danger/20">
        <ArrowDownRight className="h-4 w-4" /> SELL
      </button>
      <button className="flex items-center justify-center gap-2 rounded-xl border border-success/40 bg-success/10 py-3 text-sm font-bold text-success transition-colors hover:bg-success/20">
        <ArrowUpRight className="h-4 w-4" /> BUY
      </button>
    </div>
  );
}
