import { Hero } from "@/components/marketing/hero";
import { TradingViewTicker } from "@/components/marketing/tradingview-ticker";
import { LatestSignalsSection } from "@/components/marketing/latest-signals-section";
import { EducationPreviewSection } from "@/components/marketing/education-preview-section";
import { MarketAnalysisPreviewSection } from "@/components/marketing/market-analysis-preview-section";
import { PerformanceStatsSection } from "@/components/marketing/performance-stats-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { SectionHeading } from "@/components/marketing/section-heading";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { CtaSection } from "@/components/marketing/cta-section";

export default function Home() {
  return (
    <>
      <Hero />
      <TradingViewTicker />
      <LatestSignalsSection />
      <PerformanceStatsSection />
      <EducationPreviewSection />
      <MarketAnalysisPreviewSection />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple, Transparent Pricing"
          description="Start free, upgrade anytime for unlimited signals and premium content."
        />
        <div className="mt-12">
          <PricingCards />
        </div>
      </section>

      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
