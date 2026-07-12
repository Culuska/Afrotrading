import Link from "next/link";
import { TrendingUp, Send, MessageCircle, Mail, Phone } from "lucide-react";
import { InstagramIcon, XIcon, TikTokIcon } from "@/components/icons/social-icons";
import {
  TELEGRAM_GROUP_URL,
  WHATSAPP_URL,
  CONTACT_PHONE_DISPLAY,
  INSTAGRAM_URL,
  X_URL,
  TIKTOK_URL,
} from "@/lib/config";

const FOOTER_LINKS = [
  {
    heading: "Platform",
    links: [
      { href: "/signals", label: "Live Signals" },
      { href: "/signals/history", label: "Signal History" },
      { href: "/market-analysis", label: "Market Analysis" },
      { href: "/education", label: "Education Center" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/pricing", label: "Pricing" },
      { href: "/contact", label: "Support" },
      { href: "/about#risk-disclaimer", label: "Risk Disclaimer" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/register", label: "Create Account" },
      { href: "/login", label: "Log In" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg gold-gradient-bg">
                <TrendingUp className="h-5 w-5 text-navy-950" strokeWidth={2.5} />
              </span>
              <span className="font-display text-xl font-bold tracking-tight">
                Afro<span className="gold-gradient-text">Trading</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-foreground/60">
              Premium XAUUSD gold signals, in-depth market analysis, and trading education for
              serious traders across Africa and beyond.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={TELEGRAM_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-foreground/70 transition-colors hover:border-gold-500/50 hover:text-gold-400"
                aria-label="Telegram"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-foreground/70 transition-colors hover:border-gold-500/50 hover:text-gold-400"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-foreground/70 transition-colors hover:border-gold-500/50 hover:text-gold-400"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={X_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-foreground/70 transition-colors hover:border-gold-500/50 hover:text-gold-400"
                aria-label="X (Twitter)"
              >
                <XIcon className="h-4 w-4" />
              </a>
              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-foreground/70 transition-colors hover:border-gold-500/50 hover:text-gold-400"
                aria-label="TikTok"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
              <a
                href="mailto:support@afrotrading.com"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-foreground/70 transition-colors hover:border-gold-500/50 hover:text-gold-400"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.heading}>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-gold-400">
                {group.heading}
              </h4>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-foreground/60 transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-gold-400">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-foreground/60">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold-400" /> {CONTACT_PHONE_DISPLAY}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold-400" /> support@afrotrading.com
              </li>
            </ul>
          </div>
        </div>

        <div id="risk-disclaimer" className="mt-12 rounded-2xl border border-warning/20 bg-warning/5 p-5">
          <p className="text-xs leading-6 text-foreground/50">
            <span className="font-semibold text-warning">Risk Disclaimer:</span> Trading gold (XAUUSD), forex, and
            other leveraged products carries a high level of risk and may not be suitable for all investors. Past
            performance of signals is not indicative of future results. AfroTrading provides signals and analysis for
            educational purposes only and does not constitute financial advice. You should never trade with money you
            cannot afford to lose. Always conduct your own due diligence and consult a licensed financial advisor
            before making trading decisions.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-foreground/40 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} AfroTrading. All rights reserved.</p>
          <p>Built for traders, by traders.</p>
        </div>
      </div>
    </footer>
  );
}
