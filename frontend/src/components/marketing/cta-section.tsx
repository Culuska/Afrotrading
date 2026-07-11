"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Send, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-gold-500/20 gold-gradient-bg px-8 py-16 text-center sm:px-16"
      >
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold text-navy-950 sm:text-4xl">
            Ready to Trade Smarter?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-navy-900/80">
            Join AfroTrading today and get instant access to premium gold signals, expert analysis,
            and a community of serious traders.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-navy-950 text-gold-400 hover:bg-navy-900 shadow-none">
              <Link href="/register">
                Create Free Account <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-navy-950/30 text-navy-950 hover:bg-navy-950/10">
              <a href="https://t.me/afrotrading_community" target="_blank" rel="noopener noreferrer">
                <Send className="h-4 w-4" /> Join Telegram
              </a>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
