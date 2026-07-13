"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminSidebar, AdminMobileNav, ADMIN_SECTIONS, type AdminSection } from "@/components/admin/admin-sidebar";
import { AdminOverviewTab } from "@/components/admin/overview-tab";
import { AdminUsersTab } from "@/components/admin/users-tab";
import { AdminSignalsTab } from "@/components/admin/signals-tab";
import { AdminEducationTab } from "@/components/admin/education-tab";
import { AdminMarketAnalysisTab } from "@/components/admin/market-analysis-tab";
import { AdminSupportTab } from "@/components/admin/support-tab";
import { AdminSettingsTab } from "@/components/admin/settings-tab";

const SECTION_CONTENT: Record<AdminSection, React.ComponentType> = {
  overview: AdminOverviewTab,
  signals: AdminSignalsTab,
  users: AdminUsersTab,
  education: AdminEducationTab,
  analysis: AdminMarketAnalysisTab,
  support: AdminSupportTab,
  settings: AdminSettingsTab,
};

function AdminContent() {
  const [section, setSection] = useState<AdminSection>("overview");
  const ActiveSection = SECTION_CONTENT[section];
  const sectionLabel = ADMIN_SECTIONS.find((s) => s.id === section)?.label;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar section={section} onSectionChange={setSection} />

      <div className="flex-1">
        <AdminMobileNav section={section} onSectionChange={setSection} />

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold">
              {sectionLabel} <span className="hidden sm:inline gold-gradient-text">— Admin</span>
            </h1>
            <p className="mt-1 text-foreground/60">Manage signals, users, content, and platform settings.</p>
          </div>

          <ActiveSection />
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminContent />
    </ProtectedRoute>
  );
}
