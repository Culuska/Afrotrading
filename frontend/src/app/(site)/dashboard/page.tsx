"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  DashboardSidebar,
  DashboardMobileNav,
  DASHBOARD_SECTIONS,
  type DashboardSection,
} from "@/components/dashboard/dashboard-sidebar";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { ProfileTab } from "@/components/dashboard/profile-tab";
import { SavedSignalsTab } from "@/components/dashboard/saved-signals-tab";
import { ReferralsTab } from "@/components/dashboard/referrals-tab";
import { EducationProgressTab } from "@/components/dashboard/education-progress-tab";
import { NotificationsTab } from "@/components/dashboard/notifications-tab";
import { SecurityTab } from "@/components/dashboard/security-tab";

const SECTION_CONTENT: Record<DashboardSection, React.ComponentType> = {
  overview: OverviewTab,
  profile: ProfileTab,
  saved: SavedSignalsTab,
  referrals: ReferralsTab,
  education: EducationProgressTab,
  notifications: NotificationsTab,
  security: SecurityTab,
};

function DashboardContent() {
  const { user } = useAuth();
  const [section, setSection] = useState<DashboardSection>("overview");
  const ActiveSection = SECTION_CONTENT[section];
  const sectionLabel = DASHBOARD_SECTIONS.find((s) => s.id === section)?.label;

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)]">
      <DashboardSidebar section={section} onSectionChange={setSection} />

      <div className="flex-1 px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold">
              Welcome back, <span className="gold-gradient-text">{user?.fullName.split(" ")[0]}</span>
            </h1>
            <p className="mt-1 text-foreground/60">Manage your account, signals, and preferences.</p>
          </div>

          <DashboardMobileNav section={section} onSectionChange={setSection} />

          <h2 className="mb-4 hidden font-display text-xl font-semibold lg:block">{sectionLabel}</h2>

          <ActiveSection />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
