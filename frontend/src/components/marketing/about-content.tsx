"use client";

import { Target, Eye, Compass, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/context/i18n-context";

export function AboutContent() {
  const { dict } = useI18n();

  const VALUES = [
    { icon: Target, title: dict.about.mission.title, body: dict.about.mission.body },
    { icon: Eye, title: dict.about.vision.title, body: dict.about.vision.body },
    { icon: Compass, title: dict.about.philosophy.title, body: dict.about.philosophy.body },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold">
          {dict.about.titleLine1} <span className="gold-gradient-text">{dict.about.titleLine2}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-foreground/60">{dict.about.intro}</p>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {VALUES.map((value) => (
          <Card key={value.title} className="glass-card">
            <CardContent className="p-8 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-400">
                <value.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">{value.title}</h3>
              <p className="mt-3 text-sm leading-6 text-foreground/60">{value.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div id="risk-disclaimer" className="mt-20 rounded-2xl border border-warning/20 bg-warning/5 p-8">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-warning" />
          <h2 className="font-display text-xl font-semibold text-warning">{dict.about.riskDisclaimerTitle}</h2>
        </div>
        <p className="mt-4 text-sm leading-7 text-foreground/60">{dict.about.riskDisclaimerP1}</p>
        <p className="mt-4 text-sm leading-7 text-foreground/60">{dict.about.riskDisclaimerP2}</p>
      </div>
    </div>
  );
}
