import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const FAQS = [
  {
    question: "What is AfroTrading?",
    answer:
      "AfroTrading is a premium gold (XAUUSD) signal provider offering real-time trade signals, market analysis, and trading education for traders of all levels.",
  },
  {
    question: "How do I receive signals?",
    answer:
      "Signals are published on your dashboard and instantly broadcast to our Telegram community and VIP channel. VIP members receive instant alerts; free members receive limited weekly signals.",
  },
  {
    question: "Is trading gold risky?",
    answer:
      "Yes. Gold and leveraged trading carry significant risk. Our signals are for educational purposes and should not be considered financial advice. Always use proper risk management.",
  },
  {
    question: "Can I cancel my VIP subscription anytime?",
    answer: "Yes, VIP Monthly subscriptions can be cancelled anytime from your dashboard. VIP Lifetime is a one-time payment with permanent access.",
  },
  {
    question: "Do you offer a free trial?",
    answer: "Yes, our Free plan gives you access to limited signals and basic education content so you can experience the platform before upgrading.",
  },
  {
    question: "How accurate are your signals?",
    answer: "We publish full transparent statistics including win rate, profit factor, and risk-reward on our Signal History page — no cherry-picked results.",
  },
];

export function FaqAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {FAQS.map((faq, i) => (
        <AccordionItem key={i} value={`item-${i}`}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
