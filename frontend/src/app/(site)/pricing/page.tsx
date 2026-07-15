import { PricingCards } from "@/components/marketing/pricing-cards";
import { FaqAccordion } from "@/components/marketing/faq-accordion";

export const metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for AfroTrading gold signals. Free, VIP Monthly, and VIP Lifetime plans.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold">
          Simple, Transparent <span className="gold-gradient-text">Pricing</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-foreground/60">
          Choose the plan that fits your trading journey. Upgrade or cancel anytime.
        </p>
      </div>

      <div className="mt-14">
        <PricingCards />
      </div>

      <div className="mx-auto mt-24 max-w-3xl">
        <h2 className="text-center font-display text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="mt-8">
          <FaqAccordion />
        </div>
      </div>
    </div>
  );
}
