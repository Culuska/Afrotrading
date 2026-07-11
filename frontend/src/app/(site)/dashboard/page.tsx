"use client";

import { useAuth } from "@/context/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { ProfileTab } from "@/components/dashboard/profile-tab";
import { SavedSignalsTab } from "@/components/dashboard/saved-signals-tab";
import { EducationProgressTab } from "@/components/dashboard/education-progress-tab";
import { NotificationsTab } from "@/components/dashboard/notifications-tab";
import { SecurityTab } from "@/components/dashboard/security-tab";

function DashboardContent() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">
          Welcome back, <span className="gold-gradient-text">{user?.fullName.split(" ")[0]}</span>
        </h1>
        <p className="mt-1 text-foreground/60">Manage your account, signals, and preferences.</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="saved">Saved Signals</TabsTrigger>
          <TabsTrigger value="education">Education Progress</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="saved">
          <SavedSignalsTab />
        </TabsContent>
        <TabsContent value="education">
          <EducationProgressTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
      </Tabs>
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
