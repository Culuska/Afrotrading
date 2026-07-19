"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, Phone, Send, MessageCircle } from "lucide-react";

import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { PageHeader } from "@/components/marketing/page-header";
import { useI18n } from "@/context/i18n-context";
import { TELEGRAM_GROUP_URL, WHATSAPP_URL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/config";

export default function ContactPage() {
  const { dict } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const CONTACT_METHODS = [
    { icon: Send, label: dict.contact.telegram, value: `@${TELEGRAM_GROUP_URL.replace(/^https?:\/\/t\.me\//, "")}`, href: TELEGRAM_GROUP_URL },
    { icon: MessageCircle, label: dict.contact.whatsapp, value: CONTACT_PHONE_DISPLAY, href: WHATSAPP_URL },
    { icon: Mail, label: dict.contact.email, value: "support@theafrotrading.com", href: "mailto:support@theafrotrading.com" },
    { icon: Phone, label: dict.contact.phone, value: CONTACT_PHONE_DISPLAY, href: CONTACT_PHONE_TEL },
  ];

  const mutation = useMutation({
    mutationFn: () => api.post("/api/contact", form, { auth: false }),
    onSuccess: () => {
      toast.success(dict.contact.sentSuccess);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    },
    onError: () => toast.error(dict.contact.sentError),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        kicker={dict.nav.links.support}
        icon={Mail}
        titleLine1={dict.contact.titleLine1}
        titleLine2={dict.contact.titleLine2}
        subtitle={dict.contact.subtitle}
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          {CONTACT_METHODS.map((method) => (
            <a
              key={method.label}
              href={method.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-black/10 bg-navy-800/50 p-4 transition-colors hover:border-gold-500/40"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
                <method.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-foreground/50">{method.label}</p>
                <p className="text-sm font-semibold" dir="ltr">{method.value}</p>
              </div>
            </a>
          ))}
        </div>

        <Card className="lg:col-span-2">
          <CardContent className="p-6 sm:p-8">
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{dict.contact.fullName}</Label>
                  <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{dict.contact.emailLabel}</Label>
                  <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">{dict.contact.phoneOptional}</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{dict.contact.subject}</Label>
                  <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{dict.contact.message}</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? dict.contact.sending : dict.contact.send}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-24">
        <FaqAccordion title={dict.contact.faqTitle} />
      </div>
    </div>
  );
}
