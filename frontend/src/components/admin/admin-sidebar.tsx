"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  GraduationCap,
  LineChart,
  MessageSquare,
  CreditCard,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export const ADMIN_SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "signals", label: "Signals", icon: TrendingUp },
  { id: "users", label: "Users", icon: Users },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "analysis", label: "Market Analysis", icon: LineChart },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "support", label: "Support Messages", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number]["id"];

export function AdminSidebar({
  section,
  onSectionChange,
}: {
  section: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}) {
  const { user } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-navy-950 lg:flex">
      <Link href="/" className="flex items-center gap-2 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg gold-gradient-bg">
          <TrendingUp className="h-5 w-5 text-navy-950" strokeWidth={2.5} />
        </span>
        <span className="font-display text-lg font-bold tracking-tight">
          Afro<span className="gold-gradient-text">Trading</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-4">
        {ADMIN_SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => onSectionChange(s.id)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              section === s.id
                ? "bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 text-navy-950"
                : "text-foreground/60 hover:bg-white/5 hover:text-foreground"
            )}
          >
            <s.icon className="h-4 w-4" />
            {s.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-white/5 p-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/60 transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
        {user && (
          <div className="mt-3 flex items-center gap-3 px-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{user.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.fullName}</p>
              <p className="truncate text-xs text-foreground/40">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export function AdminMobileNav({
  section,
  onSectionChange,
}: {
  section: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}) {
  return (
    <div className="border-b border-white/5 bg-navy-950 p-4 lg:hidden">
      <Select value={section} onValueChange={(v) => onSectionChange(v as AdminSection)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ADMIN_SECTIONS.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
