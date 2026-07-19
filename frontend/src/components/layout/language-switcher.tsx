"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/context/i18n-context";
import { LOCALES, LOCALE_INFO } from "@/lib/i18n/locales";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium text-foreground/70 outline-none transition-colors hover:bg-black/5 hover:text-gold-400">
        <Globe className="h-4 w-4" />
        <span>{LOCALE_INFO[locale].nativeLabel}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((code) => (
          <DropdownMenuItem key={code} onSelect={() => setLocale(code)}>
            <span className={code === locale ? "font-semibold text-gold-400" : ""}>
              {LOCALE_INFO[code].nativeLabel}
            </span>
            <span className="ml-2 text-xs text-foreground/40">{LOCALE_INFO[code].label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
