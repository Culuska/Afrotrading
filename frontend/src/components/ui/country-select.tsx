"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";

export function CountrySelect({
  value,
  onChange,
  placeholder = "Select country",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => searchRef.current?.focus());
  }, [open]);

  function toggleOpen() {
    setOpen((o) => {
      if (!o) setQuery("");
      return !o;
    });
  }

  const filtered = COUNTRIES.filter((c) => c.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-black/10 bg-navy-900/80 px-4 py-2 text-sm outline-none transition-colors focus:border-gold-500/60 focus:ring-2 focus:ring-gold-500/20"
      >
        <span className={value ? "text-foreground" : "text-foreground/40"}>{value || placeholder}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-foreground/40" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-black/10 bg-background shadow-xl">
          <div className="flex items-center gap-2 border-b border-black/10 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-foreground/40" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search countries..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/40"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-2.5 text-sm text-foreground/40">No countries found</li>
            )}
            {filtered.map((country) => (
              <li key={country}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(country);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-black/5",
                    country === value && "text-gold-400"
                  )}
                >
                  {country}
                  {country === value && <Check className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
