"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  User,
  Bookmark,
  GraduationCap,
  Bell,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export const DASHBOARD_SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Profile", icon: User },
  { id: "saved", label: "Saved Signals", icon: Bookmark },
  { id: "education", label: "Education Progress", icon: GraduationCap },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck },
] as const;

export type DashboardSection = (typeof DASHBOARD_SECTIONS)[number]["id"];

export function DashboardSidebar({
  section,
  onSectionChange,
}: {
  section: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
}) {
  const { user } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-black/5 bg-navy-950/60 lg:flex">
      {user && (
        <div className="flex items-center gap-3 border-b border-black/5 px-6 py-6">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{user.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.fullName}</p>
            <p className="truncate text-xs text-foreground/40">{user.email}</p>
          </div>
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-1 px-4 py-4">
        {DASHBOARD_SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => onSectionChange(s.id)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              section === s.id
                ? "bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 text-navy-950"
                : "text-foreground/60 hover:bg-black/5 hover:text-foreground"
            )}
          >
            <s.icon className="h-4 w-4" />
            {s.label}
          </button>
        ))}
      </nav>

      {user?.role === "ADMIN" && (
        <div className="border-t border-black/5 p-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/60 transition-colors hover:bg-black/5 hover:text-foreground"
          >
            <ShieldAlert className="h-4 w-4" /> Admin Panel
          </Link>
        </div>
      )}
    </aside>
  );
}

export function DashboardMobileNav({
  section,
  onSectionChange,
}: {
  section: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
}) {
  return (
    <div className="mb-6 lg:hidden">
      <Select value={section} onValueChange={(v) => onSectionChange(v as DashboardSection)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DASHBOARD_SECTIONS.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
