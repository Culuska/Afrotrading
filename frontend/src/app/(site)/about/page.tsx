import { Target, Eye, Compass, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "About Us",
  description: "Learn about AfroTrading's mission, vision, and trading philosophy as a premium gold signal provider.",
};

const VALUES = [
  {
    icon: Target,
    title: "Our Mission",
    body: "To empower traders across Africa and beyond with reliable, transparent, and profitable gold trading signals — backed by disciplined risk management and continuous education.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    body: "To become the most trusted gold signal provider on the continent, known for verified performance, honest communication, and a thriving community of successful traders.",
  },
  {
    icon: Compass,
    title: "Trading Philosophy",
    body: "We believe in quality over quantity. Every signal is the result of rigorous technical and fundamental analysis, with strict risk management applied to every trade idea we publish.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold">
          About <span className="gold-gradient-text">AfroTrading</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-foreground/60">
          AfroTrading was founded to bridge the gap between retail traders and professional-grade gold
          trading insight. We combine technical precision, fundamental awareness, and community-driven
          education to help our members trade with confidence.
        </p>
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
          <h2 className="font-display text-xl font-semibold text-warning">Risk Disclaimer</h2>
        </div>
        <p className="mt-4 text-sm leading-7 text-foreground/60">
          Trading gold (XAUUSD), forex, and other leveraged financial instruments carries a high level of
          risk and may not be suitable for all investors. The high degree of leverage can work against you
          as well as for you. Before deciding to trade, you should carefully consider your investment
          objectives, level of experience, and risk appetite. There is a possibility that you could sustain
          a loss of some or all of your initial investment. You should be aware of all the risks associated
          with leveraged trading and seek advice from an independent financial advisor if you have any
          doubts.
        </p>
        <p className="mt-4 text-sm leading-7 text-foreground/60">
          AfroTrading provides trading signals, market analysis, and education for informational and
          educational purposes only. Nothing on this platform constitutes financial, investment, legal, or
          tax advice. Past performance of any signal or strategy is not indicative of future results.
        </p>
      </div>
    </div>
  );
}
