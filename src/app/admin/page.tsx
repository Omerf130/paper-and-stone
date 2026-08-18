import type { Metadata } from "next";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminPageHeader from "@/components/admin/AdminPageHeader/AdminPageHeader";
import AdminDashboardAttention from "@/components/admin/dashboard/AdminDashboardAttention";
import AdminDashboardMetrics from "@/components/admin/dashboard/AdminDashboardMetrics";
import AdminDashboardQuickActions from "@/components/admin/dashboard/AdminDashboardQuickActions";
import AdminDashboardRecentProjects from "@/components/admin/dashboard/AdminDashboardRecentProjects";
import { requireAdmin } from "@/lib/auth/authorization";
import { getAdminDashboardData } from "@/lib/admin/getAdminDashboardData";

export const metadata: Metadata = {
  title: "ניהול | Paper & Stone",
};

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const data = await getAdminDashboardData(user.id);

  return (
    <AdminPage width="default">
      <AdminPageHeader
        title="ראשי"
        description="סקירה של מה שדורש טיפול, מצב המערכת וקיצורי דרך לניהול."
      />

      <AdminDashboardAttention
        attentionProjectCount={data.attentionProjectCount}
        activeProjectCount={data.activeProjectCount}
        submittedProjectCount={data.submittedProjectCount}
        pendingOnboardingProjectCount={data.pendingOnboardingProjectCount}
        unreadAdminMessageCount={data.unreadAdminMessageCount}
        quoteAcceptedAwaitingApprovalCount={
          data.quoteAcceptedAwaitingApprovalCount
        }
        quoteChangeRequestedCount={data.quoteChangeRequestedCount}
        quoteAwaitingArchitectCount={data.quoteAwaitingArchitectCount}
        pendingArchitectRequestCount={data.pendingArchitectRequestCount}
      />

      <AdminDashboardMetrics metrics={data.metrics} />

      <AdminDashboardQuickActions />

      <AdminDashboardRecentProjects projects={data.recentSubmittedProjects} />
    </AdminPage>
  );
}
