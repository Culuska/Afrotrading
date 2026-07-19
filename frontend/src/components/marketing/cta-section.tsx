"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Send, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TELEGRAM_GROUP_URL } from "@/lib/config";
import { useI18n } from "@/context/i18n-context";

export function CtaSection() {
  const { dict } = useI18n();
  return (
    <section className="mx-auto max-w-[90rem] px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-gold-500/20 gold-gradient-bg px-8 py-16 text-center sm:px-16"
      >
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold text-navy-950 sm:text-4xl">
            {dict.home.cta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-navy-900/80">{dict.home.cta.description}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-navy-950 text-gold-400 hover:bg-navy-900 shadow-none">
              <Link href="/register">
                {dict.home.cta.createAccount} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-navy-950/30 text-navy-950 hover:bg-navy-950/10">
              <a href={TELEGRAM_GROUP_URL} target="_blank" rel="noopener noreferrer">
                <Send className="h-4 w-4" /> {dict.home.cta.joinTelegram}
              </a>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
