"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminOverviewTab } from "@/components/admin/overview-tab";
import { AdminUsersTab } from "@/components/admin/users-tab";
import { AdminSignalsTab } from "@/components/admin/signals-tab";
import { AdminEducationTab } from "@/components/admin/education-tab";
import { AdminMarketAnalysisTab } from "@/components/admin/market-analysis-tab";
import { AdminSettingsTab } from "@/components/admin/settings-tab";

function AdminContent() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">
          Admin <span className="gold-gradient-text">Dashboard</span>
        </h1>
        <p className="mt-1 text-foreground/60">Manage signals, users, content, and platform settings.</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><AdminOverviewTab /></TabsContent>
        <TabsContent value="signals"><AdminSignalsTab /></TabsContent>
        <TabsContent value="users"><AdminUsersTab /></TabsContent>
        <TabsContent value="education"><AdminEducationTab /></TabsContent>
        <TabsContent value="analysis"><AdminMarketAnalysisTab /></TabsContent>
        <TabsContent value="settings"><AdminSettingsTab /></TabsContent>
      </Tabs>
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
