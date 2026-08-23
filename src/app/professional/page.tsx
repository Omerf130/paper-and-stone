import type { Metadata } from "next";
import { requireProfessional } from "@/lib/auth/authorization";
import { getProfessionalDashboardData } from "@/lib/professionals/getProfessionalDashboardData";
import InternalPage from "@/components/internal/InternalPage/InternalPage";
import InternalPageHeader from "@/components/internal/InternalPageHeader/InternalPageHeader";
import ProfessionalDashboardAttention from "@/components/professional/dashboard/ProfessionalDashboardAttention";
import ProfessionalDashboardProfile from "@/components/professional/dashboard/ProfessionalDashboardProfile";
import ProfessionalDashboardProjects from "@/components/professional/dashboard/ProfessionalDashboardProjects";
import Button from "@/components/ui/Button/Button";

export const metadata: Metadata = {
  title: "אזור מקצועי | Paper & Stone",
};

export default async function ProfessionalDashboardPage() {
  const user = await requireProfessional();
  const dashboard = await getProfessionalDashboardData(user.id, user.email);

  return (
    <InternalPage width="default">
      <InternalPageHeader
        title={`שלום, ${dashboard.displayName}`}
        description="סביבת העבודה שלכם לניהול פרויקטים, מעקב אחר סטטוסים ותקשורת עם צוות Paper & Stone."
        actions={
          <Button href="/professional/projects/new" size="sm">
            יצירת פרויקט חדש
          </Button>
        }
      />

      <ProfessionalDashboardAttention
        attentionProjectCount={dashboard.attentionProjectCount}
        stalePricingProjectCount={dashboard.stalePricingProjectCount}
        commercialDirtyProjectCount={dashboard.commercialDirtyProjectCount}
        changesRequestedCount={dashboard.changesRequestedCount}
        pendingOnboardingCount={dashboard.pendingOnboardingCount}
        unreadNotificationCount={dashboard.unreadNotificationCount}
        unreadMessageCount={dashboard.unreadMessageCount}
        unreadClientMessageCount={dashboard.unreadClientMessageCount}
        profileIncomplete={!dashboard.profileCompleteness.isComplete}
        workflowRejectedItemCount={dashboard.workflowRejectedItemCount}
        workflowResubmitItemCount={dashboard.workflowResubmitItemCount}
        workflowClientReviewItemCount={dashboard.workflowClientReviewItemCount}
      />

      <ProfessionalDashboardProjects projects={dashboard.dashboardProjects} />

      <ProfessionalDashboardProfile completeness={dashboard.profileCompleteness} />
    </InternalPage>
  );
}
