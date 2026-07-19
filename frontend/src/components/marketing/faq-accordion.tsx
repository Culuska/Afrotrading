"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useI18n } from "@/context/i18n-context";

export function FaqAccordion({ title }: { title?: string }) {
  const { dict } = useI18n();
  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-center font-display text-2xl font-bold">{title ?? dict.pricing.faqTitle}</h2>
      <div className="mt-8">
        <Accordion type="single" collapsible className="w-full">
          {dict.faq.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
