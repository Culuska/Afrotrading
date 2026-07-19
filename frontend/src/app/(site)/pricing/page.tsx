import { PricingCards } from "@/components/marketing/pricing-cards";
import { PricingHeader } from "@/components/marketing/pricing-header";
import { FaqAccordion } from "@/components/marketing/faq-accordion";

export const metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for AfroTrading gold signals. Free, VIP Monthly, and VIP Lifetime plans.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 lg:px-8">
      <PricingHeader />

      <div className="mt-14">
        <PricingCards />
      </div>

      <div className="mt-24">
        <FaqAccordion />
      </div>
    </div>
  );
}
