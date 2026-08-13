import type { Metadata } from "next";
import { requireProfessional } from "@/lib/auth/authorization";
import { getMyProfessionalProfileView } from "@/lib/professionals/ensureProfessionalProfile";
import { isProfileReadyForProjects } from "@/lib/professionals/profile-readiness";
import InternalPage from "@/components/internal/InternalPage/InternalPage";
import InternalPageHeader from "@/components/internal/InternalPageHeader/InternalPageHeader";
import Button from "@/components/ui/Button/Button";
import FeedbackBanner from "@/components/ui/FeedbackBanner/FeedbackBanner";
import ProjectForm from "@/components/professional/projects/ProjectForm/ProjectForm";

export const metadata: Metadata = {
  title: "יצירת פרויקט | Paper & Stone",
};

export default async function NewProjectPage() {
  const user = await requireProfessional();
  const profile = await getMyProfessionalProfileView(user.id);
  const profileReady = isProfileReadyForProjects(profile);

  return (
    <InternalPage width="form">
      <InternalPageHeader
        title="יצירת פרויקט חדש"
        description="הזינו את פרטי הפרויקט הבסיסיים. לאחר היצירה תוכלו להוסיף מוצרים."
      />

      {!profileReady ? (
        <FeedbackBanner tone="warning">
          <p>יש להשלים שם מלא וטלפון בפרופיל לפני יצירת פרויקט.</p>
          <Button href="/professional/profile" variant="secondary" size="sm">
            השלמת פרופיל
          </Button>
        </FeedbackBanner>
      ) : (
        <ProjectForm
          mode="create"
          initialProject={{
            name: "",
            clientName: "",
            location: "",
            description: "",
          }}
        />
      )}
    </InternalPage>
  );
}
