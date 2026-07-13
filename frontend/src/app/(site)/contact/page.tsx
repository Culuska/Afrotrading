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
import { TELEGRAM_GROUP_URL, WHATSAPP_URL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/config";

const CONTACT_METHODS = [
  { icon: Send, label: "Telegram", value: `@${TELEGRAM_GROUP_URL.replace(/^https?:\/\/t\.me\//, "")}`, href: TELEGRAM_GROUP_URL },
  { icon: MessageCircle, label: "WhatsApp", value: CONTACT_PHONE_DISPLAY, href: WHATSAPP_URL },
  { icon: Mail, label: "Email", value: "support@theafrotrading.com", href: "mailto:support@theafrotrading.com" },
  { icon: Phone, label: "Phone", value: CONTACT_PHONE_DISPLAY, href: CONTACT_PHONE_TEL },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const mutation = useMutation({
    mutationFn: () => api.post("/api/contact", form, { auth: false }),
    onSuccess: () => {
      toast.success("Message sent! We'll get back to you shortly.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold">
          Get in <span className="gold-gradient-text">Touch</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-foreground/60">
          Questions about signals, membership, or the platform? We&apos;re here to help.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          {CONTACT_METHODS.map((method) => (
            <a
              key={method.label}
              href={method.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-navy-800/50 p-4 transition-colors hover:border-gold-500/40"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
                <method.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-foreground/50">{method.label}</p>
                <p className="text-sm font-semibold">{method.value}</p>
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
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
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
