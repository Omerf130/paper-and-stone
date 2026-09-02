import type { Metadata } from "next";
import AdminPage from "@/components/admin/AdminPage/AdminPage";
import AdminDashboardActivityFeed from "@/components/admin/dashboard/AdminDashboardActivityFeed";
import AdminDashboardMetrics from "@/components/admin/dashboard/AdminDashboardMetrics";
import AdminDashboardPageHeader from "@/components/admin/dashboard/AdminDashboardPageHeader";
import AdminDashboardProjectStatusOverview from "@/components/admin/dashboard/AdminDashboardProjectStatusOverview";
import AdminDashboardQuickActions from "@/components/admin/dashboard/AdminDashboardQuickActions";
import AdminDashboardRecentProducts from "@/components/admin/dashboard/AdminDashboardRecentProducts";
import AdminDashboardRecentProjects from "@/components/admin/dashboard/AdminDashboardRecentProjects";
import { requireAdmin } from "@/lib/auth/authorization";
import { getAdminDashboardData } from "@/lib/admin/getAdminDashboardData";
import dashboardStyles from "./AdminDashboardPage.module.scss";

export const metadata: Metadata = {
  title: "ניהול | Paper & Stone",
};

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const data = await getAdminDashboardData(user.id);
  const greetingName = user.email.split("@")[0] ?? "מנהל/ת";

  return (
    <AdminPage width="wide">
      <div className={dashboardStyles.page}>
        <AdminDashboardPageHeader greetingName={greetingName} />

        <AdminDashboardMetrics metrics={data.metrics} />

        <div className={dashboardStyles.workspaceGrid}>
          <div className={dashboardStyles.primaryColumn}>
            <AdminDashboardRecentProjects
              projects={data.recentProjects}
              totalProjects={data.metrics.projects}
            />
            <AdminDashboardQuickActions />
          </div>

          <div className={dashboardStyles.secondaryColumn}>
            <AdminDashboardActivityFeed
              entries={data.activityFeed}
              attentionProjectCount={data.attentionProjectCount}
            />
            <AdminDashboardProjectStatusOverview summary={data.queueSummary} />
            <AdminDashboardRecentProducts
              products={data.recentProducts}
              productThumbnailsById={data.productThumbnailsById}
            />
          </div>
        </div>
      </div>
    </AdminPage>
  );
}
