"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, TrendingUp, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { TELEGRAM_GROUP_URL } from "@/lib/config";
import { useAuth } from "@/context/auth-context";
import { useI18n } from "@/context/i18n-context";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { dict } = useI18n();

  const NAV_LINKS = [
    { href: "/signals", label: dict.nav.links.signals },
    { href: "/signals/history", label: dict.nav.links.signalHistory },
    { href: "/education", label: dict.nav.links.education },
    { href: "/market-analysis", label: dict.nav.links.marketAnalysis },
    { href: "/pricing", label: dict.nav.links.pricing },
    { href: "/about", label: dict.nav.links.about },
    { href: "/contact", label: dict.nav.links.support },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-navy-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-18 max-w-[90rem] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg gold-gradient-bg">
            <TrendingUp className="h-5 w-5 text-navy-950" strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            Afro<span className="gold-gradient-text">Trading</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-black/5 hover:text-gold-400",
                pathname === link.href && "bg-black/5 text-gold-400"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <a href={TELEGRAM_GROUP_URL} target="_blank" rel="noopener noreferrer">
              <Send className="h-4 w-4" /> {dict.nav.telegram}
            </a>
          </Button>

          <LanguageSwitcher />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarFallback>{user.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">{dict.nav.dashboard}</Link>
                </DropdownMenuItem>
                {user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">{dict.nav.adminPanel}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => logout()}>{dict.nav.logOut}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">{dict.nav.logIn}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">{dict.nav.getStarted}</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-foreground/80 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-black/5 bg-navy-950 lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-black/5 hover:text-gold-400"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-black/5 pt-3">
                {user ? (
                  <>
                    <Button asChild variant="secondary">
                      <Link href="/dashboard">{dict.nav.dashboard}</Link>
                    </Button>
                    <Button variant="ghost" onClick={() => logout()}>
                      {dict.nav.logOut}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline">
                      <Link href="/login">{dict.nav.logIn}</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register">{dict.nav.getStarted}</Link>
                    </Button>
                  </>
                )}
                <div className="pt-1">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
