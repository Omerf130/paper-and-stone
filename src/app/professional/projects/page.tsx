import type { Metadata } from "next";
import { requireProfessional } from "@/lib/auth/authorization";
import { getProfessionalProjects } from "@/lib/projects/project-queries";
import InternalPage from "@/components/internal/InternalPage/InternalPage";
import InternalPageHeader from "@/components/internal/InternalPageHeader/InternalPageHeader";
import ProfessionalProjectList from "@/components/professional/projects/ProfessionalProjectList/ProfessionalProjectList";
import Button from "@/components/ui/Button/Button";

export const metadata: Metadata = {
  title: "הפרויקטים שלי | Paper & Stone",
};

export default async function ProfessionalProjectsPage() {
  const user = await requireProfessional();
  const projects = await getProfessionalProjects(user.id);

  return (
    <InternalPage width="default">
      <InternalPageHeader
        title="הפרויקטים שלי"
        description="פרויקטים ומוצרים שנבחרו עבור לקוחות."
        actions={
          <Button href="/professional/projects/new" size="sm">
            יצירת פרויקט חדש
          </Button>
        }
      />

      <ProfessionalProjectList projects={projects} />
    </InternalPage>
  );
}
